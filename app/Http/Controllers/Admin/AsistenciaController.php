<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\ActividadSesion;
use App\Models\Asistencia;
use App\Models\Pastor;
use App\Services\AsistenciaExcelExportService;
use App\Services\AsistenciaReporteService;
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

        // Detectar sesión activa oficial (establecida por administración o por horario)
        $sesionActiva = $actividad->sesion_activa;

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

        $totalPresentes = $this->calcularTotalPresentes($actividad->id, $sesionActiva?->id);

        // Obtener los IDs de pastores que ya tienen asistencia registrada en la sesión activa
        $pastorIdsRegistrados = Asistencia::where('actividad_id', $actividad->id)
            ->when($sesionActiva, fn ($q) => $q->where('actividad_sesion_id', $sesionActiva->id))
            ->pluck('pastor_id')
            ->unique()
            ->values()
            ->toArray();

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
            'pastorIdsRegistrados' => $pastorIdsRegistrados,
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
            'codigo_qr' => 'nullable|string',
            'pastor_id' => 'nullable|exists:pastores,id',
            'asistio_con_conyuge' => 'nullable|boolean',
            'nombre_acompanante' => 'nullable|string|max:255',
            'kit_entregado' => 'nullable|boolean',
            'comida_entregada' => 'nullable|boolean',
            'metodo' => 'nullable|string|in:qr_carnet,cedula,manual,facial',
            'dispositivo' => 'nullable|string|max:150',
            'observaciones' => 'nullable|string',
            'fecha_registro' => 'nullable|string',
        ]);

        $pastor = null;
        if ($request->filled('pastor_id')) {
            $pastor = Pastor::withoutGlobalScopes()
                ->with(['estado', 'municipioModel', 'iglesiasPrincipales'])
                ->find($request->input('pastor_id'));
        }

        if (!$pastor) {
            $rawCodigo = trim($request->input('codigo_qr') ?? '');
            if (empty($rawCodigo)) {
                return response()->json([
                    'success' => false,
                    'encontrado' => false,
                    'message' => "Debe suministrar un código QR, cédula o ID del pastor.",
                ], 422);
            }

            $clave = $this->extraerIdentificadorDeQr($rawCodigo);

            // Buscar al pastor por código, documento formateado, documento sin puntos o ID
            $cleanClave = str_replace(['.', '-', ' '], '', $clave);
            $soloNumeros = preg_replace('/\D/', '', $clave);

            $pastor = Pastor::withoutGlobalScopes()
                ->with(['estado', 'municipioModel', 'iglesiasPrincipales'])
                ->where(function ($q) use ($clave, $cleanClave, $soloNumeros) {
                    $q->where('codigo', $clave)
                        ->orWhere('documento', $clave)
                        ->orWhereRaw("REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', '') = ?", [$cleanClave]);

                    if (!empty($soloNumeros)) {
                        $q->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', ''), 'V', ''), 'E', '') = ?", [$soloNumeros])
                          ->orWhere('documento', 'like', "%{$soloNumeros}%");
                    }

                    if (is_numeric($clave)) {
                        $q->orWhere('id', (int) $clave);
                    }
                })
                ->first();
        }

        if (!$pastor) {
            return response()->json([
                'success' => false,
                'encontrado' => false,
                'message' => "No se encontró ningún pastor con los datos suministrados.",
            ], 404);
        }

        $actividadId = (int) $request->input('actividad_id');
        $actividad = Actividad::with('sesiones')->findOrFail($actividadId);
        $sesionId = $request->input('actividad_sesion_id') ?: $actividad->sesion_activa?->id;
        $asistioConConyuge = (bool) $request->input('asistio_con_conyuge', false);
        $dispositivo = trim((string) $request->input('dispositivo', 'Terminal Web (Escáner)'));
        $metodo = $request->input('metodo', 'qr_carnet');

        // Verificación atómica contra duplicados y registro en transacción
        $resultado = DB::transaction(function () use (
            $actividadId,
            $sesionId,
            $pastor,
            $metodo,
            $dispositivo,
            $asistioConConyuge,
            $request
        ) {
            $queryExistente = Asistencia::withoutGlobalScopes()
                ->where('actividad_id', $actividadId)
                ->where('pastor_id', $pastor->id);

            if ($sesionId) {
                $queryExistente->where('actividad_sesion_id', $sesionId);
            } else {
                $queryExistente->whereNull('actividad_sesion_id');
            }

            $asistenciaExistente = $queryExistente->lockForUpdate()->first();

            if ($asistenciaExistente) {
                return [
                    'duplicado' => true,
                    'asistencia' => $asistenciaExistente,
                ];
            }

            $asistencia = Asistencia::create([
                'actividad_id' => $actividadId,
                'actividad_sesion_id' => $sesionId,
                'pastor_id' => $pastor->id,
                'fecha_registro' => $request->filled('fecha_registro') ? \Carbon\Carbon::parse($request->input('fecha_registro')) : now(),
                'metodo' => $metodo,
                'dispositivo' => $dispositivo ?: 'Terminal Web (Escáner)',
                'asistio_con_conyuge' => $asistioConConyuge,
                'nombre_acompanante' => $request->input('nombre_acompanante', $pastor->nombre_conyuge),
                'kit_entregado' => (bool) $request->input('kit_entregado', false),
                'comida_entregada' => (bool) $request->input('comida_entregada', false),
                'observaciones' => $request->input('observaciones'),
                'registrado_por_user_id' => auth()->id(),
            ]);

            return [
                'duplicado' => false,
                'asistencia' => $asistencia,
            ];
        });

        if ($resultado['duplicado']) {
            $asistenciaExistente = $resultado['asistencia'];
            return response()->json([
                'success' => false,
                'ya_registrado' => true,
                'message' => "¡Atención! {$pastor->nombres} {$pastor->apellidos} ya marcó asistencia previamente a las " . $asistenciaExistente->fecha_registro->format('h:i A'),
                'pastor' => $this->formatearDatosPastor($pastor),
                'asistencia' => $asistenciaExistente,
                'pastor_ids_acreditados' => [$pastor->id],
            ], 200);
        }

        $asistencia = $resultado['asistencia'];

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
                        'dispositivo' => $dispositivo ?: 'Terminal Web (Escáner)',
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

        $totalPresentes = $this->calcularTotalPresentes($actividadId, $sesionId ? (int) $sesionId : null);
        $pastorIdsAcreditados = array_values(array_unique(array_filter(array_map(fn ($a) => $a['pastor_id'], $asistenciasList))));

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
            'pastor_ids_acreditados' => $pastorIdsAcreditados,
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

            $sesionId = !empty($validated['actividad_sesion_id']) ? (int) $validated['actividad_sesion_id'] : null;
            $totalPresentes = $this->calcularTotalPresentes($validated['actividad_id'], $sesionId);
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
            'pastor_ids_acreditados' => array_values(array_unique(array_filter(array_map(fn($a) => $a['pastor_id'] ?? null, $asistenciasList)))),
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
        $soloNumeros = preg_replace('/\D/', '', $term);

        $pastores = Pastor::withoutGlobalScopes()
            ->where('status', true)
            ->where(function ($q) use ($term, $clean, $soloNumeros) {
                $q->where('nombres', 'like', "%{$term}%")
                  ->orWhere('apellidos', 'like', "%{$term}%")
                  ->orWhere('codigo', 'like', "%{$term}%")
                  ->orWhere('documento', 'like', "%{$term}%")
                  ->orWhereRaw("REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', '') LIKE ?", ["%{$clean}%"]);

                if (!empty($soloNumeros) && strlen($soloNumeros) >= 4) {
                    $q->orWhere('documento', 'like', "%{$soloNumeros}%");
                }
            })
            ->limit(20)
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
        $sesionId = $asistencia->actividad_sesion_id;
        $pastorId = $asistencia->pastor_id;
        $asistencia->delete();

        $totalPresentes = $this->calcularTotalPresentes($actividadId, $sesionId);

        return response()->json([
            'success' => true,
            'message' => 'Asistencia revertida correctamente.',
            'totalPresentes' => $totalPresentes,
            'pastor_id_revertido' => $pastorId,
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
     * Obtener detalle de asistentes organizado por todas las zonas para una sesión (o actividad completa).
     */
    public function sesionDetalle(Request $request, int $actividadId, AsistenciaReporteService $reporteService)
    {
        $actividad = Actividad::with([
            'sesiones' => fn ($q) => $q->withCount('asistencias'),
        ])->findOrFail($actividadId);

        $sesionIdParam = $request->query('sesion_id');
        $sesion = $this->resolveSesionScope($actividad, $sesionIdParam, defaultToActive: true);
        $detalle = $reporteService->buildDetallePorZonas($actividad, $sesion);

        return response()->json([
            'success' => true,
            'actividad' => [
                'id' => $actividad->id,
                'nombre' => $actividad->nombre,
                'tipo' => $actividad->tipo,
                'lugar' => $actividad->lugar,
                'zona' => $actividad->zona,
                'estado' => $actividad->estado,
                'permite_conyuge' => (bool) $actividad->permite_conyuge,
                'fecha_inicio' => $actividad->fecha_inicio?->toIso8601String(),
                'fecha_fin' => $actividad->fecha_fin?->toIso8601String(),
            ],
            'scope' => $sesion ? 'sesion' : 'actividad',
            'sesion_seleccionada' => $sesion ? [
                'id' => $sesion->id,
                'nombre' => $sesion->nombre,
                'fecha_hora_inicio' => $sesion->fecha_hora_inicio?->toIso8601String(),
                'fecha_hora_fin' => $sesion->fecha_hora_fin?->toIso8601String(),
                'es_obligatoria' => (bool) $sesion->es_obligatoria,
                'is_activa' => (bool) $sesion->is_activa,
            ] : null,
            'sesiones' => $actividad->sesiones->map(fn ($s) => [
                'id' => $s->id,
                'nombre' => $s->nombre,
                'fecha_hora_inicio' => $s->fecha_hora_inicio?->toIso8601String(),
                'fecha_hora_fin' => $s->fecha_hora_fin?->toIso8601String(),
                'es_obligatoria' => (bool) $s->es_obligatoria,
                'is_activa' => (bool) $s->is_activa,
                'asistencias_count' => (int) ($s->asistencias_count ?? 0),
            ])->values(),
            ...$detalle,
        ]);
    }

    /**
     * Exportar reporte oficial de asistencia en formato PDF organizado por todas las zonas.
     */
    public function exportPdf(Request $request, int $actividadId, AsistenciaReporteService $reporteService)
    {
        $actividad = Actividad::with(['sesiones'])->findOrFail($actividadId);
        $sesion = $this->resolveSesionScope($actividad, $request->query('sesion_id'), defaultToActive: false);
        $soloConAsistencia = filter_var($request->query('solo_con_asistencia', false), FILTER_VALIDATE_BOOLEAN);

        $detalle = $reporteService->buildDetallePorZonas($actividad, $sesion);

        // Cargar logo en base64 para DomPDF
        $logoBase64 = null;
        $logoPath = public_path('icons/logo_mmm-a-color-sin-fondo.png');
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode((string) file_get_contents($logoPath));
        }

        $pdf = Pdf::loadView('pdf.reporte_asistencia', [
            'actividad' => $actividad,
            'sesion' => $sesion,
            'metricas' => $detalle['metricas'],
            'zonas' => $detalle['zonas'],
            'soloConAsistencia' => $soloConAsistencia,
            'logoBase64' => $logoBase64,
            'fechaEmision' => Carbon::now()->format('d/m/Y h:i A'),
            'fechasActividad' => Carbon::parse($actividad->fecha_inicio)->format('d/m/Y') . ' al ' . Carbon::parse($actividad->fecha_fin)->format('d/m/Y'),
        ]);

        $pdf->setPaper('letter', 'landscape');
        $pdf->render();

        $dompdf = $pdf->getDomPDF();
        $canvas = $dompdf->getCanvas();
        $fontMetrics = $dompdf->getFontMetrics();
        $font = $fontMetrics->getFont('Helvetica', 'normal');
        $color = [0.39, 0.45, 0.55];
        $footerY = $canvas->get_height() - 22;

        $canvas->page_text(
            28,
            $footerY,
            'SAPRCOE • MMM Venezuela — Reporte de Asistencia por Zonas',
            $font,
            7.2,
            $color
        );
        $canvas->page_text(
            $canvas->get_width() - 88,
            $footerY,
            'Página {PAGE_NUM} de {PAGE_COUNT}',
            $font,
            7.4,
            $color
        );

        $slug = preg_replace('/[^A-Za-z0-9_]/', '_', $actividad->nombre);
        $sesionSuffix = $sesion ? '_' . preg_replace('/[^A-Za-z0-9_]/', '_', $sesion->nombre) : '';
        $filename = "Asistencia_Zonas_{$slug}{$sesionSuffix}_" . Carbon::now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Resolver la sesión objetivo para reportes o consultas de detalle.
     */
    protected function resolveSesionScope(Actividad $actividad, mixed $sesionIdParam, bool $defaultToActive): ?ActividadSesion
    {
        if ($sesionIdParam === 'all') {
            return null;
        }

        if ($sesionIdParam === 'activa') {
            return $actividad->sesion_activa;
        }

        if ($sesionIdParam !== null && $sesionIdParam !== '' && is_numeric($sesionIdParam)) {
            $sesion = $actividad->sesiones->firstWhere('id', (int) $sesionIdParam);
            abort_if(! $sesion, 404, 'La sesión solicitada no pertenece a esta actividad.');

            return $sesion;
        }

        return $defaultToActive ? $actividad->sesion_activa : null;
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
    protected function calcularTotalPresentes(int $actividadId, ?int $sesionId = null): int
    {
        $query = Asistencia::where('actividad_id', $actividadId);
        if ($sesionId) {
            $query->where('actividad_sesion_id', $sesionId);
        }

        $pastoresPresentesIds = $query->pluck('pastor_id')->unique();
        $totalPastores = $pastoresPresentesIds->count();

        // Contar acompañantes cónyuges cuyos pastores no son registros independientes en la lista anterior
        $conyugesQuery = Asistencia::where('actividad_id', $actividadId)
            ->where('asistio_con_conyuge', true);
        if ($sesionId) {
            $conyugesQuery->where('actividad_sesion_id', $sesionId);
        }

        $conyugesNoPastores = $conyugesQuery->with('pastor')
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

    /**
     * Obtener estadísticas e IDs de pastores registrados para una sesión específica
     */
    public function obtenerSesionInfo(Request $request, int $actividadId)
    {
        $actividad = Actividad::with('sesiones')->findOrFail($actividadId);
        $sesionId = $request->input('sesion_id');

        $pastorIdsRegistrados = Asistencia::where('actividad_id', $actividad->id)
            ->when($sesionId, fn ($q) => $q->where('actividad_sesion_id', $sesionId))
            ->pluck('pastor_id')
            ->unique()
            ->values()
            ->toArray();

        $totalPresentes = $this->calcularTotalPresentes($actividad->id, $sesionId ? (int) $sesionId : null);

        return response()->json([
            'success' => true,
            'sesion_id' => $sesionId ? (int) $sesionId : null,
            'total_presentes' => $totalPresentes,
            'pastor_ids_registrados' => $pastorIdsRegistrados,
            'sesiones' => $actividad->sesiones,
        ]);
    }

    /**
     * Crear una nueva sesión / día rápido desde el escáner
     */
    public function crearSesionRapida(Request $request, int $actividadId)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'fecha_hora_inicio' => 'required|date',
            'fecha_hora_fin' => 'required|date|after_or_equal:fecha_hora_inicio',
            'tipo_comida' => 'nullable|string|in:ninguna,desayuno,almuerzo,cena',
            'es_obligatoria' => 'boolean',
        ]);

        $actividad = Actividad::findOrFail($actividadId);
        $ultimoOrden = $actividad->sesiones()->max('orden') ?? 0;

        $sesion = $actividad->sesiones()->create([
            'nombre' => trim($request->input('nombre')),
            'fecha_hora_inicio' => $request->input('fecha_hora_inicio'),
            'fecha_hora_fin' => $request->input('fecha_hora_fin'),
            'tipo_comida' => $request->input('tipo_comida', 'ninguna'),
            'es_obligatoria' => (bool) $request->input('es_obligatoria', true),
            'orden' => $ultimoOrden + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Sesión '{$sesion->nombre}' creada exitosamente.",
            'sesion' => $sesion,
            'sesiones' => $actividad->sesiones()->orderBy('orden')->get(),
        ]);
    }

    /**
     * Establecer una sesión como la Sesión Activa Oficial de la actividad
     * para sincronizar todos los terminales web y apps móviles.
     */
    public function activarSesion(Request $request, int $actividadId)
    {
        $request->validate([
            'sesion_id' => 'required|exists:actividad_sesiones,id',
        ]);

        $actividad = Actividad::with('sesiones')->findOrFail($actividadId);
        $sesionId = (int) $request->input('sesion_id');

        DB::transaction(function () use ($actividad, $sesionId) {
            $actividad->sesiones()->update(['is_activa' => false]);
            $actividad->sesiones()->where('id', $sesionId)->update(['is_activa' => true]);
        });

        $actividad->load('sesiones');
        $sesionActiva = $actividad->sesiones->firstWhere('id', $sesionId);
        $totalPresentes = $this->calcularTotalPresentes($actividad->id, $sesionId);

        $pastorIdsRegistrados = Asistencia::where('actividad_id', $actividad->id)
            ->where('actividad_sesion_id', $sesionId)
            ->pluck('pastor_id')
            ->unique()
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'message' => "La sesión '{$sesionActiva?->nombre}' ha sido activada oficialmente para todos los dispositivos móviles y terminales.",
            'sesion_activa' => $sesionActiva,
            'sesiones' => $actividad->sesiones()->orderBy('orden')->get(),
            'total_presentes' => $totalPresentes,
            'pastor_ids_registrados' => $pastorIdsRegistrados,
        ]);
    }

    /**
     * Obtener el padrón completo de obreros y asistencias previas
     * para almacenamiento en el navegador (IndexedDB / Modo Offline).
     */
    public function padronOffline(int $actividadId)
    {
        $actividad = Actividad::with('sesiones')->findOrFail($actividadId);
        $sesionActiva = $actividad->sesion_activa;

        $pastores = Pastor::withoutGlobalScopes()
            ->where('status', true)
            ->with(['estado', 'municipioModel', 'iglesiasPrincipales'])
            ->orderBy('nombres', 'asc')
            ->get()
            ->map(function ($p) {
                return $this->formatearDatosPastor($p);
            })
            ->values();

        $asistenciasPrevias = Asistencia::withoutGlobalScopes()
            ->where('actividad_id', $actividad->id)
            ->get(['id', 'pastor_id', 'actividad_sesion_id', 'fecha_registro', 'asistio_con_conyuge', 'kit_entregado', 'comida_entregada'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'pastor_id' => $a->pastor_id,
                'actividad_sesion_id' => $a->actividad_sesion_id,
                'hora' => $a->fecha_registro?->format('h:i A'),
                'asistio_con_conyuge' => (bool) $a->asistio_con_conyuge,
                'kit_entregado' => (bool) $a->kit_entregado,
                'comida_entregada' => (bool) $a->comida_entregada,
            ])
            ->values();

        $pastorIdsRegistrados = $asistenciasPrevias
            ->when($sesionActiva, fn ($c) => $c->where('actividad_sesion_id', $sesionActiva->id))
            ->pluck('pastor_id')
            ->unique()
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'total_pastores' => $pastores->count(),
            'pastores' => $pastores,
            'asistencias_previas' => $asistenciasPrevias,
            'pastor_ids_registrados' => $pastorIdsRegistrados,
            'total_presentes' => $this->calcularTotalPresentes($actividad->id, $sesionActiva?->id),
            'sesion_activa' => $sesionActiva ? [
                'id' => $sesionActiva->id,
                'nombre' => $sesionActiva->nombre,
                'fecha_hora_inicio' => $sesionActiva->fecha_hora_inicio,
                'fecha_hora_fin' => $sesionActiva->fecha_hora_fin,
                'is_activa' => true,
            ] : null,
            'sincronizado_en' => now()->toIso8601String(),
        ]);
    }

    /**
     * Sincronización en lote de marcajes offline desde el terminal web o app móvil.
     */
    public function sincronizarLote(Request $request)
    {
        $request->validate([
            'actividad_id' => 'required|exists:actividades,id',
            'asistencias' => 'required|array|min:1',
            'asistencias.*.pastor_id' => 'nullable|integer',
            'asistencias.*.codigo_qr' => 'nullable|string',
            'asistencias.*.actividad_sesion_id' => 'nullable|integer',
            'asistencias.*.asistio_con_conyuge' => 'nullable|boolean',
            'asistencias.*.metodo' => 'nullable|string',
            'asistencias.*.dispositivo' => 'nullable|string',
            'asistencias.*.fecha_registro' => 'nullable|string',
        ]);

        $actividadId = (int) $request->input('actividad_id');
        $actividad = Actividad::with('sesiones')->findOrFail($actividadId);
        $sesionActiva = $actividad->sesion_activa;
        $items = $request->input('asistencias');

        $sincronizados = 0;
        $duplicados = 0;
        $nuevasAsistencias = [];

        DB::transaction(function () use (
            $actividadId,
            $sesionActiva,
            $items,
            &$sincronizados,
            &$duplicados,
            &$nuevasAsistencias
        ) {
            foreach ($items as $item) {
                $pastor = null;
                if (!empty($item['pastor_id'])) {
                    $pastor = Pastor::withoutGlobalScopes()->find($item['pastor_id']);
                }

                if (!$pastor && !empty($item['codigo_qr'])) {
                    $clave = $this->extraerIdentificadorDeQr(trim($item['codigo_qr']));
                    $cleanClave = str_replace(['.', '-', ' '], '', $clave);
                    $soloNumeros = preg_replace('/\D/', '', $clave);

                    $pastor = Pastor::withoutGlobalScopes()
                        ->where(function ($q) use ($clave, $cleanClave, $soloNumeros) {
                            $q->where('codigo', $clave)
                                ->orWhere('documento', $clave)
                                ->orWhereRaw("REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', '') = ?", [$cleanClave]);

                            if (!empty($soloNumeros)) {
                                $q->orWhereRaw("REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(documento, '.', ''), '-', ''), ' ', ''), 'V', ''), 'E', '') = ?", [$soloNumeros])
                                  ->orWhere('documento', 'like', "%{$soloNumeros}%");
                            }
                        })
                        ->first();
                }

                if (!$pastor) {
                    continue;
                }

                $sesionId = !empty($item['actividad_sesion_id']) ? (int) $item['actividad_sesion_id'] : $sesionActiva?->id;
                $asistioConConyuge = !empty($item['asistio_con_conyuge']);
                $metodo = $item['metodo'] ?? 'qr_carnet';
                $dispositivo = $item['dispositivo'] ?? 'Terminal Web (Offline Sincronizado)';
                $fechaRegistro = !empty($item['fecha_registro'])
                    ? \Carbon\Carbon::parse($item['fecha_registro'])
                    : now();

                $queryExistente = Asistencia::withoutGlobalScopes()
                    ->where('actividad_id', $actividadId)
                    ->where('pastor_id', $pastor->id);

                if ($sesionId) {
                    $queryExistente->where('actividad_sesion_id', $sesionId);
                } else {
                    $queryExistente->whereNull('actividad_sesion_id');
                }

                $existente = $queryExistente->first();
                if ($existente) {
                    $duplicados++;
                    continue;
                }

                $asistencia = Asistencia::create([
                    'actividad_id' => $actividadId,
                    'actividad_sesion_id' => $sesionId,
                    'pastor_id' => $pastor->id,
                    'fecha_registro' => $fechaRegistro,
                    'metodo' => $metodo,
                    'dispositivo' => $dispositivo,
                    'asistio_con_conyuge' => $asistioConConyuge,
                    'nombre_acompanante' => $asistioConConyuge ? $pastor->nombre_conyuge : null,
                    'kit_entregado' => false,
                    'comida_entregada' => false,
                    'registrado_por_user_id' => auth()->id(),
                ]);

                $sincronizados++;
                $nuevasAsistencias[] = [
                    'id' => $asistencia->id,
                    'pastor_id' => $pastor->id,
                    'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
                    'documento' => $pastor->documento,
                    'codigo' => $pastor->codigo,
                    'foto' => $pastor->foto_url,
                    'zona' => $pastor->zona,
                    'sesion' => $asistencia->sesion?->nombre ?? 'General',
                    'hora' => $fechaRegistro->format('h:i:s A'),
                    'asistio_con_conyuge' => $asistioConConyuge,
                ];
            }
        });

        $totalPresentes = $this->calcularTotalPresentes($actividadId, $sesionActiva?->id);
        $pastorIdsRegistrados = Asistencia::where('actividad_id', $actividadId)
            ->when($sesionActiva, fn ($q) => $q->where('actividad_sesion_id', $sesionActiva->id))
            ->pluck('pastor_id')
            ->unique()
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'message' => "¡Sincronización exitosa! {$sincronizados} asistencias procesadas" . ($duplicados > 0 ? " ({$duplicados} omitidas por ya estar registradas)." : '.'),
            'sincronizados' => $sincronizados,
            'duplicados' => $duplicados,
            'total_presentes' => $totalPresentes,
            'pastor_ids_registrados' => $pastorIdsRegistrados,
            'nuevas_asistencias' => $nuevasAsistencias,
        ]);
    }
}
