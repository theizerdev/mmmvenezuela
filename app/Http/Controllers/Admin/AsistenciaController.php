<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\ActividadSesion;
use App\Models\Asistencia;
use App\Models\Pastor;
use App\Services\AsistenciaExcelExportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AsistenciaController extends Controller
{
    /**
     * Pantalla de Terminal de Escaneo Ultrarrápido con Lector QR / Cámara / Código de Barras
     */
    public function scanner(int $actividadId)
    {
        $actividad = Actividad::with(['sesiones'])->findOrFail($actividadId);

        // Detectar sesión activa actual según la hora actual
        $now = now();
        $sesionActiva = $actividad->sesiones()
            ->where('fecha_hora_inicio', '<=', $now->copy()->addHours(2))
            ->where('fecha_hora_fin', '>=', $now->copy()->subHours(2))
            ->first() ?? $actividad->sesiones()->first();

        // Últimos 10 escaneados para mostrar en la cinta de actividad
        $ultimosEscaneos = Asistencia::with(['pastor.estado', 'sesion'])
            ->where('actividad_id', $actividad->id)
            ->orderBy('fecha_registro', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($as) => [
                'id' => $as->id,
                'pastor_id' => $as->pastor_id,
                'nombre_completo' => ($as->pastor?->nombres ?? '') . ' ' . ($as->pastor?->apellidos ?? ''),
                'documento' => $as->pastor?->documento,
                'codigo' => $as->pastor?->codigo,
                'foto' => $as->pastor?->foto,
                'zona' => $as->pastor?->zona,
                'nivel_ministerial' => $as->pastor?->nivel_ministerial,
                'sesion' => $as->sesion?->nombre ?? 'General',
                'hora' => $as->fecha_registro->format('h:i:s A'),
                'asistio_con_conyuge' => $as->asistio_con_conyuge,
                'kit_entregado' => $as->kit_entregado,
                'comida_entregada' => $as->comida_entregada,
            ]);

        $totalPresentes = $this->calcularTotalPresentes($actividad->id);

        $pastoresConvocados = Pastor::where('status', true)
            ->whereNotNull('foto')
            ->when($actividad->zona, fn ($q) => $q->where('zona', $actividad->zona))
            ->select('id', 'codigo', 'nombres', 'apellidos', 'documento', 'foto', 'nivel_ministerial', 'zona', 'nombre_conyuge')
            ->get()
            ->filter(fn ($p) => !empty($p->foto))
            ->map(function ($p) {
                $fotoUrl = $p->foto_url;
                $localPath = public_path(ltrim((string) $fotoUrl, '/'));
                $existeLocalmente = !empty($fotoUrl) && (
                    str_starts_with($fotoUrl, 'http') ||
                    str_starts_with($fotoUrl, 'data:') ||
                    file_exists($localPath)
                );

                return [
                    'id' => $p->id,
                    'codigo' => $p->codigo,
                    'documento' => $p->documento,
                    'nombre_completo' => "{$p->nombres} {$p->apellidos}",
                    'foto' => $fotoUrl,
                    'foto_disponible' => $existeLocalmente,
                    'nivel_ministerial' => $p->nivel_ministerial,
                    'zona' => $p->zona,
                    'nombre_conyuge' => $p->nombre_conyuge,
                ];
            })
            ->values();

        return Inertia::render('admin/Actividades/Escanear', [
            'actividad' => $actividad,
            'sesionActiva' => $sesionActiva,
            'ultimosEscaneos' => $ultimosEscaneos,
            'totalPresentes' => $totalPresentes,
            'pastoresConvocados' => $pastoresConvocados,
        ]);
    }

    /**
     * Procesar escaneo de código QR o lectura de código de barras
     */
    public function registrar(Request $request)
    {
        $request->validate([
            'actividad_id' => 'required|exists:actividades,id',
            'actividad_sesion_id' => 'nullable|exists:actividad_sesiones,id',
            'codigo_qr' => 'required|string',
            'asistio_con_conyuge' => 'nullable|boolean',
            'nombre_acompanante' => 'nullable|string|max:255',
            'kit_entregado' => 'nullable|boolean',
            'comida_entregada' => 'nullable|boolean',
            'metodo' => 'nullable|string|in:qr_carnet,cedula,manual',
            'observaciones' => 'nullable|string',
        ]);

        $rawCodigo = trim($request->input('codigo_qr'));
        $clave = $this->extraerIdentificadorDeQr($rawCodigo);

        // Buscar al pastor por código, documento formateado, documento sin puntos o ID
        $cleanClave = str_replace(['.', '-', ' '], '', $clave);
        $soloNumeros = preg_replace('/\D/', '', $clave);

        $pastor = Pastor::with(['estado', 'municipioModel', 'iglesiasPrincipales'])
            ->where('codigo', $clave)
            ->orWhere('documento', $clave)
            ->orWhereRaw("REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', '') = ?", [$cleanClave])
            ->when(!empty($soloNumeros), function ($q) use ($soloNumeros) {
                $q->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', ''), 'V', ''), 'E', '') = ?", [$soloNumeros])
                  ->orWhere('documento', 'like', "%{$soloNumeros}%");
            })
            ->orWhere('id', is_numeric($clave) ? (int)$clave : 0)
            ->first();

        if (!$pastor) {
            return response()->json([
                'success' => false,
                'encontrado' => false,
                'message' => "No se encontró ningún pastor con el código o documento: {$clave}",
                'codigo_leido' => $clave,
            ], 404);
        }

        $actividadId = $request->input('actividad_id');
        $sesionId = $request->input('actividad_sesion_id');

        // Verificar si ya existe registro de asistencia para este pastor en esta actividad o sesión
        $queryExistente = Asistencia::where('actividad_id', $actividadId)
            ->where('pastor_id', $pastor->id);

        if ($sesionId) {
            $queryExistente->where('actividad_sesion_id', $sesionId);
        }

        $asistenciaExistente = $queryExistente->first();

        if ($asistenciaExistente) {
            return response()->json([
                'success' => false,
                'ya_registrado' => true,
                'message' => "¡Atención! {$pastor->nombres} {$pastor->apellidos} ya marcó asistencia previamente a las " . $asistenciaExistente->fecha_registro->format('h:i A'),
                'pastor' => $this->formatearDatosPastor($pastor),
                'asistencia' => $asistenciaExistente,
            ], 200);
        }

        $asistioConConyuge = (bool) $request->input('asistio_con_conyuge', false);

        // Crear nuevo registro de asistencia del pastor escaneado
        $asistencia = Asistencia::create([
            'actividad_id' => $actividadId,
            'actividad_sesion_id' => $sesionId,
            'pastor_id' => $pastor->id,
            'fecha_registro' => now(),
            'metodo' => $request->input('metodo', 'qr_carnet'),
            'asistio_con_conyuge' => $asistioConConyuge,
            'nombre_acompanante' => $request->input('nombre_acompanante', $pastor->nombre_conyuge),
            'kit_entregado' => (bool) $request->input('kit_entregado', false),
            'comida_entregada' => (bool) $request->input('comida_entregada', false),
            'observaciones' => $request->input('observaciones'),
            'registrado_por_user_id' => auth()->id(),
        ]);

        $asistenciasList = [
            [
                'id' => $asistencia->id,
                'pastor_id' => $asistencia->pastor_id,
                'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
                'documento' => $pastor->documento,
                'codigo' => $pastor->codigo,
                'foto' => $pastor->foto_url,
                'zona' => $pastor->zona,
                'nivel_ministerial' => $pastor->nivel_ministerial,
                'sesion' => $asistencia->sesion?->nombre ?? 'General',
                'hora' => $asistencia->fecha_registro->format('h:i:s A'),
                'asistio_con_conyuge' => $asistencia->asistio_con_conyuge,
                'kit_entregado' => $asistencia->kit_entregado,
                'comida_entregada' => $asistencia->comida_entregada,
            ],
        ];

        $conyugePastor = null;
        if ($asistioConConyuge) {
            // 1. Buscar si el cónyuge está vinculado por ID de cónyuge
            if ($pastor->conyuge_id) {
                $conyugePastor = Pastor::find($pastor->conyuge_id);
            }
            if (! $conyugePastor) {
                $conyugePastor = Pastor::where('conyuge_id', $pastor->id)->first();
            }
            // 2. Si no, buscar por coincidencia de nombre completo
            if (! $conyugePastor && ! empty($pastor->nombre_conyuge)) {
                $nombreLimpio = trim($pastor->nombre_conyuge);
                $conyugePastor = Pastor::whereRaw("CONCAT(nombres, ' ', apellidos) LIKE ?", ["%{$nombreLimpio}%"])
                    ->orWhere('documento', $nombreLimpio)
                    ->first();
            }

            if ($conyugePastor && $conyugePastor->id !== $pastor->id) {
                $conyugeAsistencia = Asistencia::updateOrCreate(
                    [
                        'actividad_id' => $actividadId,
                        'pastor_id' => $conyugePastor->id,
                        'actividad_sesion_id' => $sesionId,
                    ],
                    [
                        'fecha_registro' => now(),
                        'metodo' => $request->input('metodo', 'qr_carnet'),
                        'asistio_con_conyuge' => true,
                        'nombre_acompanante' => "{$pastor->nombres} {$pastor->apellidos}",
                        'kit_entregado' => (bool) $request->input('kit_entregado', false),
                        'comida_entregada' => (bool) $request->input('comida_entregada', false),
                        'observaciones' => "Acreditado junto a cónyuge: {$pastor->nombres} {$pastor->apellidos}",
                        'registrado_por_user_id' => auth()->id(),
                    ]
                );

                $asistenciasList[] = [
                    'id' => $conyugeAsistencia->id,
                    'pastor_id' => $conyugeAsistencia->pastor_id,
                    'nombre_completo' => "{$conyugePastor->nombres} {$conyugePastor->apellidos}",
                    'documento' => $conyugePastor->documento,
                    'codigo' => $conyugePastor->codigo,
                    'foto' => $conyugePastor->foto_url,
                    'zona' => $conyugePastor->zona,
                    'nivel_ministerial' => $conyugePastor->nivel_ministerial,
                    'sesion' => $conyugeAsistencia->sesion?->nombre ?? 'General',
                    'hora' => $conyugeAsistencia->fecha_registro->format('h:i:s A'),
                    'asistio_con_conyuge' => true,
                    'kit_entregado' => $conyugeAsistencia->kit_entregado,
                    'comida_entregada' => $conyugeAsistencia->comida_entregada,
                ];
            }
        }

        $totalPresentes = $this->calcularTotalPresentes($actividadId);

        $mensaje = "¡Asistencia registrada con éxito! Bienvenido(a) {$pastor->nombres} {$pastor->apellidos}";
        if ($asistioConConyuge) {
            $nombreConyuge = $conyugePastor ? "{$conyugePastor->nombres} {$conyugePastor->apellidos}" : ($pastor->nombre_conyuge ?: 'su cónyuge');
            $mensaje = "¡Asistencia de ambos confirmada! {$pastor->nombres} {$pastor->apellidos} y {$nombreConyuge} (2 Asistentes registrados)";
        }

        return response()->json([
            'success' => true,
            'ya_registrado' => false,
            'message' => $mensaje,
            'pastor' => $this->formatearDatosPastor($pastor),
            'asistencia' => $asistenciasList[0],
            'asistencias' => $asistenciasList,
            'totalPresentes' => $totalPresentes,
        ]);
    }

    /**
     * Enrolar foto facial de un pastor capturada directamente desde la cámara del terminal
     */
    public function enrolarRostro(Request $request)
    {
        $validated = $request->validate([
            'pastor_id' => 'required|exists:pastores,id',
            'imagen_base64' => 'required|string',
            'actividad_id' => 'nullable|exists:actividades,id',
            'actividad_sesion_id' => 'nullable|exists:actividad_sesiones,id',
            'asistio_con_conyuge' => 'nullable|boolean',
            'kit_entregado' => 'nullable|boolean',
            'comida_entregada' => 'nullable|boolean',
        ]);

        $pastor = Pastor::findOrFail($validated['pastor_id']);

        $imageData = $validated['imagen_base64'];
        $type = 'jpeg';
        if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $type = strtolower($matches[1]);
        }
        $decoded = base64_decode($imageData);

        if ($decoded === false) {
            return response()->json(['success' => false, 'message' => 'Error al procesar la imagen facial.'], 422);
        }

        $filename = "pastor_{$pastor->id}_" . time() . ".{$type}";

        $storageDir = storage_path('app/public/pastores');
        if (!file_exists($storageDir)) {
            mkdir($storageDir, 0755, true);
        }
        file_put_contents($storageDir . DIRECTORY_SEPARATOR . $filename, $decoded);

        $publicStorageDir = public_path('storage/pastores');
        if (!file_exists($publicStorageDir)) {
            mkdir($publicStorageDir, 0755, true);
        }
        file_put_contents($publicStorageDir . DIRECTORY_SEPARATOR . $filename, $decoded);

        $pastor->foto = $filename;
        $pastor->save();

        $asistenciasList = [];
        $totalPresentes = 0;
        if (!empty($validated['actividad_id'])) {
            $asistioConConyuge = (bool) ($validated['asistio_con_conyuge'] ?? false);

            $asistencia = Asistencia::updateOrCreate(
                [
                    'actividad_id' => $validated['actividad_id'],
                    'pastor_id' => $pastor->id,
                    'actividad_sesion_id' => $validated['actividad_sesion_id'] ?? null,
                ],
                [
                    'fecha_registro' => now(),
                    'metodo' => 'facial',
                    'asistio_con_conyuge' => $asistioConConyuge,
                    'nombre_acompanante' => $pastor->nombre_conyuge,
                    'kit_entregado' => (bool) ($validated['kit_entregado'] ?? false),
                    'comida_entregada' => (bool) ($validated['comida_entregada'] ?? false),
                    'registrado_por_user_id' => auth()->id(),
                ]
            );

            $asistenciasList[] = [
                'id' => $asistencia->id,
                'pastor_id' => $asistencia->pastor_id,
                'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
                'documento' => $pastor->documento,
                'codigo' => $pastor->codigo,
                'foto' => $pastor->foto_url,
                'zona' => $pastor->zona,
                'nivel_ministerial' => $pastor->nivel_ministerial,
                'sesion' => $asistencia->sesion?->nombre ?? 'General',
                'hora' => $asistencia->fecha_registro->format('h:i:s A'),
                'asistio_con_conyuge' => $asistencia->asistio_con_conyuge,
                'kit_entregado' => $asistencia->kit_entregado,
                'comida_entregada' => $asistencia->comida_entregada,
            ];

            // Si cónyuge presente, registrar también
            if ($asistioConConyuge) {
                $conyugePastor = null;
                if ($pastor->conyuge_id) {
                    $conyugePastor = Pastor::find($pastor->conyuge_id);
                }
                if (! $conyugePastor) {
                    $conyugePastor = Pastor::where('conyuge_id', $pastor->id)->first();
                }
                if (! $conyugePastor && ! empty($pastor->nombre_conyuge)) {
                    $nombreLimpio = trim($pastor->nombre_conyuge);
                    $conyugePastor = Pastor::whereRaw("CONCAT(nombres, ' ', apellidos) LIKE ?", ["%{$nombreLimpio}%"])
                        ->orWhere('documento', $nombreLimpio)
                        ->first();
                }

                if ($conyugePastor && $conyugePastor->id !== $pastor->id) {
                    $conyugeAsistencia = Asistencia::updateOrCreate(
                        [
                            'actividad_id' => $validated['actividad_id'],
                            'pastor_id' => $conyugePastor->id,
                            'actividad_sesion_id' => $validated['actividad_sesion_id'] ?? null,
                        ],
                        [
                            'fecha_registro' => now(),
                            'metodo' => 'facial',
                            'asistio_con_conyuge' => true,
                            'nombre_acompanante' => "{$pastor->nombres} {$pastor->apellidos}",
                            'kit_entregado' => (bool) ($validated['kit_entregado'] ?? false),
                            'comida_entregada' => (bool) ($validated['comida_entregada'] ?? false),
                            'observaciones' => "Acreditado junto a cónyuge: {$pastor->nombres} {$pastor->apellidos}",
                            'registrado_por_user_id' => auth()->id(),
                        ]
                    );

                    $asistenciasList[] = [
                        'id' => $conyugeAsistencia->id,
                        'pastor_id' => $conyugeAsistencia->pastor_id,
                        'nombre_completo' => "{$conyugePastor->nombres} {$conyugePastor->apellidos}",
                        'documento' => $conyugePastor->documento,
                        'codigo' => $conyugePastor->codigo,
                        'foto' => $conyugePastor->foto_url,
                        'zona' => $conyugePastor->zona,
                        'nivel_ministerial' => $conyugePastor->nivel_ministerial,
                        'sesion' => $conyugeAsistencia->sesion?->nombre ?? 'General',
                        'hora' => $conyugeAsistencia->fecha_registro->format('h:i:s A'),
                        'asistio_con_conyuge' => true,
                        'kit_entregado' => $conyugeAsistencia->kit_entregado,
                        'comida_entregada' => $conyugeAsistencia->comida_entregada,
                    ];
                }
            }

            $totalPresentes = $this->calcularTotalPresentes($validated['actividad_id']);
        }

        $mensajeExito = "¡Rostro enrolado y asistencia confirmada para {$pastor->nombres} {$pastor->apellidos}!";
        if (!empty($validated['asistio_con_conyuge'])) {
            $mensajeExito = "¡Rostro enrolado y asistencia de ambos registrada para {$pastor->nombres} {$pastor->apellidos} y cónyuge!";
        }

        return response()->json([
            'success' => true,
            'message' => $mensajeExito,
            'pastor' => $this->formatearDatosPastor($pastor),
            'asistencia' => $asistenciasList[0] ?? null,
            'asistencias' => $asistenciasList,
            'totalPresentes' => $totalPresentes,
            'foto_url' => $pastor->foto_url,
        ]);
    }

    /**
     * Búsqueda en vivo de pastores para registro manual (cuando no tienen el carnet a mano)
     */
    public function buscarPastores(Request $request)
    {
        $term = trim($request->input('q', ''));
        if (strlen($term) < 2) {
            return response()->json([]);
        }

        $clean = str_replace(['.', '-', ' '], '', $term);

        $pastores = Pastor::where('status', true)
            ->where(function ($q) use ($term, $clean) {
                $q->where('nombres', 'like', "%{$term}%")
                  ->orWhere('apellidos', 'like', "%{$term}%")
                  ->orWhere('codigo', 'like', "%{$term}%")
                  ->orWhere('documento', 'like', "%{$term}%")
                  ->orWhereRaw("REPLACE(REPLACE(documento, '.', ''), '-', '') LIKE ?", ["%{$clean}%"]);
            })
            ->limit(15)
            ->get(['id', 'codigo', 'nombres', 'apellidos', 'documento', 'foto', 'nivel_ministerial', 'zona', 'nombre_conyuge'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'codigo' => $p->codigo,
                'nombres' => $p->nombres,
                'apellidos' => $p->apellidos,
                'nombre_completo' => "{$p->nombres} {$p->apellidos}",
                'documento' => $p->documento,
                'foto' => $p->foto_url,
                'nivel_ministerial' => $p->nivel_ministerial,
                'zona' => $p->zona,
                'nombre_conyuge' => $p->nombre_conyuge,
            ]);

        return response()->json($pastores);
    }

    /**
     * Revertir una asistencia registrada por equivocación
     */
    public function revertir(int $id)
    {
        $asistencia = Asistencia::findOrFail($id);
        $actividadId = $asistencia->actividad_id;
        $asistencia->delete();

        $totalPresentes = Asistencia::where('actividad_id', $actividadId)->distinct('pastor_id')->count('pastor_id');

        return response()->json([
            'success' => true,
            'message' => 'Asistencia revertida correctamente.',
            'totalPresentes' => $totalPresentes,
        ]);
    }

    /**
     * Exportar reporte detallado de asistencia a formato Excel (.xlsx) con pestañas
     */
    public function exportExcel(int $actividadId, AsistenciaExcelExportService $excelService): StreamedResponse
    {
        return $excelService->export($actividadId);
    }

    /**
     * Exportar reporte oficial de asistencia en formato PDF
     */
    public function exportPdf(int $actividadId)
    {
        $actividad = Actividad::with(['sesiones'])->findOrFail($actividadId);

        // Padrón de pastores convocados
        $pastoresConvocadosQuery = Pastor::where('status', true);
        if ($actividad->zona) {
            $pastoresConvocadosQuery->where('zona', $actividad->zona);
        }
        $totalPadron = $pastoresConvocadosQuery->count();

        // Asistencias registradas
        $asistencias = Asistencia::with(['pastor.estado', 'sesion', 'registradoPor'])
            ->where('actividad_id', $actividad->id)
            ->orderBy('fecha_registro', 'asc')
            ->get();

        $pastorIdsPresentes = $asistencias->pluck('pastor_id')->unique()->filter()->values();
        $totalPresentes = $pastorIdsPresentes->count();
        $porcentajeQuorum = $totalPadron > 0 ? round(($totalPresentes / $totalPadron) * 100, 1) : 0;

        $totalConConyuge = $asistencias->where('asistio_con_conyuge', true)->unique('pastor_id')->count();
        $totalAusentes = max(0, $totalPadron - $totalPresentes);

        // Cargar logo en base64 para DomPDF
        $logoBase64 = null;
        $logoPath = public_path('icons/logo_mmm-a-color-sin-fondo.png');
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath));
        }

        $pdf = Pdf::loadView('pdf.reporte_asistencia', [
            'actividad' => $actividad,
            'asistencias' => $asistencias,
            'totalPadron' => $totalPadron,
            'totalPresentes' => $totalPresentes,
            'porcentajeQuorum' => $porcentajeQuorum,
            'totalConConyuge' => $totalConConyuge,
            'totalAusentes' => $totalAusentes,
            'logoBase64' => $logoBase64,
            'fechaEmision' => Carbon::now()->format('d/m/Y h:i A'),
            'fechasActividad' => Carbon::parse($actividad->fecha_inicio)->format('d/m/Y') . ' al ' . Carbon::parse($actividad->fecha_fin)->format('d/m/Y'),
        ]);

        $pdf->setPaper('letter', 'landscape');

        $slug = preg_replace('/[^A-Za-z0-9_]/', '_', $actividad->nombre);
        $filename = "Asistencia_{$slug}_" . Carbon::now()->format('Ymd_His') . ".pdf";

        return $pdf->download($filename);
    }

    /**
     * Alias retrocompatible: Exportar reporte de asistencia (redirige a Excel .xlsx)
     */
    public function export(int $actividadId, AsistenciaExcelExportService $excelService): StreamedResponse
    {
        return $this->exportExcel($actividadId, $excelService);
    }

    /**
     * Extrae el código o cédula limpia a partir de la cadena que leyó el lector QR
     */
    protected function extraerIdentificadorDeQr(string $data): string
    {
        $data = trim($data);

        // Si es una URL del tipo http(s)://.../validar-credencial/{codigo}
        if (preg_match('~/validar-credencial/([^/?#\s]+)~i', $data, $matches)) {
            return urldecode($matches[1]);
        }

        // Si contiene parámetros GET como ?codigo=XXX o ?id=XXX
        if (preg_match('~[?&](?:codigo|id|doc)=([^&#\s]+)~i', $data, $matches)) {
            return urldecode($matches[1]);
        }

        // De lo contrario, es el código directo escaneado
        return $data;
    }

    protected function formatearDatosPastor(Pastor $pastor): array
    {
        return [
            'id' => $pastor->id,
            'codigo' => $pastor->codigo,
            'nombres' => $pastor->nombres,
            'apellidos' => $pastor->apellidos,
            'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
            'documento' => $pastor->documento,
            'foto' => $pastor->foto_url,
            'nivel_ministerial' => $pastor->nivel_ministerial,
            'cargo_nacional' => $pastor->cargo_nacional,
            'zona' => $pastor->zona,
            'distrito' => $pastor->distrito,
            'nombre_conyuge' => $pastor->nombre_conyuge,
            'estado' => $pastor->estado?->nombre,
            'municipio' => $pastor->municipioModel?->nombre,
            'iglesia' => $pastor->iglesiasPrincipales->first()?->nombre,
        ];
    }

    /**
     * Calcular total real de asistentes presentes (pastores únicos + cónyuges acompañantes)
     */
    protected function calcularTotalPresentes(int $actividadId): int
    {
        $pastoresPresentesIds = Asistencia::where('actividad_id', $actividadId)
            ->pluck('pastor_id')
            ->unique();

        $totalPastores = $pastoresPresentesIds->count();

        // Contar acompañantes cónyuges cuyos pastores no son registros independientes en la lista anterior
        $conyugesNoPastores = Asistencia::where('actividad_id', $actividadId)
            ->where('asistio_con_conyuge', true)
            ->with('pastor')
            ->get()
            ->filter(function ($as) use ($pastoresPresentesIds) {
                $pastor = $as->pastor;
                if (! $pastor) {
                    return true;
                }
                // Si el cónyuge es otro pastor y ya está contado en la lista de presentes, no duplicar
                if ($pastor->conyuge_id && $pastoresPresentesIds->contains($pastor->conyuge_id)) {
                    return false;
                }

                return true;
            })
            ->count();

        return $totalPastores + $conyugesNoPastores;
    }
}
