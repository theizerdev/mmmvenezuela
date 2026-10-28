<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\ActividadSesion;
use App\Models\Asistencia;
use App\Models\Pastor;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AsistenciaApiController extends Controller
{
    /**
     * Obtener lista de actividades activas / recientes para que la app se conecte sin login.
     */
    public function actividadesActivas(): JsonResponse
    {
        $now = now();

        $actividades = Actividad::with(['sesiones' => function ($q) {
            $q->orderBy('fecha_hora_inicio', 'asc');
        }])
        ->where('estado', '!=', 'cancelada')
        ->orderBy('fecha_inicio', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($actividad) use ($now) {
            // Detectar sesión activa según la hora actual
            $sesionActiva = $actividad->sesiones
                ->filter(function ($s) use ($now) {
                    $inicio = Carbon::parse($s->fecha_hora_inicio)->subHours(2);
                    $fin = Carbon::parse($s->fecha_hora_fin)->addHours(2);
                    return $now->between($inicio, $fin);
                })
                ->first() ?? $actividad->sesiones->first();

            $totalPresentes = Asistencia::where('actividad_id', $actividad->id)
                ->distinct('pastor_id')
                ->count('pastor_id');

            return [
                'id' => $actividad->id,
                'nombre' => $actividad->nombre,
                'tipo' => $actividad->tipo,
                'fecha_inicio' => $actividad->fecha_inicio ? Carbon::parse($actividad->fecha_inicio)->format('d/m/Y') : null,
                'fecha_fin' => $actividad->fecha_fin ? Carbon::parse($actividad->fecha_fin)->format('d/m/Y') : null,
                'lugar' => $actividad->lugar,
                'zona' => $actividad->zona,
                'permite_conyuge' => (bool) $actividad->permite_conyuge,
                'controla_comida' => (bool) $actividad->controla_comida,
                'total_presentes' => $totalPresentes,
                'sesion_activa' => $sesionActiva ? [
                    'id' => $sesionActiva->id,
                    'nombre' => $sesionActiva->nombre,
                    'fecha_hora_inicio' => $sesionActiva->fecha_hora_inicio,
                    'fecha_hora_fin' => $sesionActiva->fecha_hora_fin,
                    'es_obligatoria' => (bool) $sesionActiva->es_obligatoria,
                    'tipo_comida' => $sesionActiva->tipo_comida,
                ] : null,
                'sesiones' => $actividad->sesiones->map(fn ($s) => [
                    'id' => $s->id,
                    'nombre' => $s->nombre,
                    'fecha_hora_inicio' => $s->fecha_hora_inicio,
                    'fecha_hora_fin' => $s->fecha_hora_fin,
                    'es_obligatoria' => (bool) $s->es_obligatoria,
                    'tipo_comida' => $s->tipo_comida,
                ]),
            ];
        });

        return response()->json([
            'success' => true,
            'actividades' => $actividades,
        ]);
    }

    /**
     * Búsqueda de pastor por cédula, código o identificador general.
     * Retorna datos completos incluyendo la EXTENSIÓN en la que labora y cónyuge.
     */
    public function buscarPastor(Request $request): JsonResponse
    {
        $term = trim($request->input('cedula') ?? $request->input('q') ?? '');
        $actividadId = $request->input('actividad_id');
        $sesionId = $request->input('actividad_sesion_id');

        if (empty($term)) {
            return response()->json([
                'success' => false,
                'message' => 'Debe ingresar un número de cédula o código.',
            ], 422);
        }

        $clave = $this->extraerIdentificadorDeQr($term);
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
                'message' => "No se encontró ningún obrero con el documento: {$clave}",
            ], 404);
        }

        $pastorData = $this->formatearPastorCompleto($pastor);

        // Verificar si ya registró asistencia en la actividad / sesión
        $asistenciaExistente = null;
        if ($actividadId) {
            $query = Asistencia::where('actividad_id', $actividadId)
                ->where('pastor_id', $pastor->id);

            if ($sesionId) {
                $query->where('actividad_sesion_id', $sesionId);
            }

            $asistenciaExistente = $query->first();
        }

        return response()->json([
            'success' => true,
            'encontrado' => true,
            'pastor' => $pastorData,
            'ya_registrado' => (bool) $asistenciaExistente,
            'asistencia_previa' => $asistenciaExistente ? [
                'id' => $asistenciaExistente->id,
                'hora' => $asistenciaExistente->fecha_registro?->format('h:i A'),
                'asistio_con_conyuge' => (bool) $asistenciaExistente->asistio_con_conyuge,
                'kit_entregado' => (bool) $asistenciaExistente->kit_entregado,
                'comida_entregada' => (bool) $asistenciaExistente->comida_entregada,
            ] : null,
        ]);
    }

    /**
     * Registrar la asistencia (vía QR o Manual).
     */
    public function registrarAsistencia(Request $request): JsonResponse
    {
        $request->validate([
            'actividad_id' => 'required|exists:actividades,id',
            'actividad_sesion_id' => 'nullable|exists:actividad_sesiones,id',
            'identificador' => 'nullable|string',
            'codigo_qr' => 'nullable|string',
            'cedula' => 'nullable|string',
            'pastor_id' => 'nullable|exists:pastores,id',
            'asistio_con_conyuge' => 'nullable|boolean',
            'kit_entregado' => 'nullable|boolean',
            'comida_entregada' => 'nullable|boolean',
            'metodo' => 'nullable|string|in:qr,manual,qr_carnet,cedula',
            'observaciones' => 'nullable|string',
        ]);

        $actividadId = (int) $request->input('actividad_id');
        $sesionId = $request->input('actividad_sesion_id');
        $asistioConConyuge = (bool) $request->input('asistio_con_conyuge', false);
        $metodo = $request->input('metodo', 'qr');

        // 1. Identificar al pastor
        $pastor = null;
        if ($request->filled('pastor_id')) {
            $pastor = Pastor::with(['estado', 'municipioModel', 'iglesiasPrincipales'])
                ->find($request->input('pastor_id'));
        }

        if (!$pastor) {
            $rawInput = trim($request->input('identificador') ?? $request->input('codigo_qr') ?? $request->input('cedula') ?? '');
            if (empty($rawInput)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe proporcionar la cédula, el código QR o el ID del pastor.',
                ], 422);
            }

            $clave = $this->extraerIdentificadorDeQr($rawInput);
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
        }

        if (!$pastor) {
            return response()->json([
                'success' => false,
                'encontrado' => false,
                'message' => 'No se encontró ningún obrero con los datos suministrados.',
            ], 404);
        }

        // 2. Verificar duplicados
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
                'message' => "¡Atención! {$pastor->nombres} {$pastor->apellidos} ya registró asistencia previamente a las " . $asistenciaExistente->fecha_registro?->format('h:i A'),
                'pastor' => $this->formatearPastorCompleto($pastor),
                'asistencia' => [
                    'id' => $asistenciaExistente->id,
                    'hora' => $asistenciaExistente->fecha_registro?->format('h:i:s A'),
                    'asistio_con_conyuge' => (bool) $asistenciaExistente->asistio_con_conyuge,
                ],
            ], 200);
        }

        // 3. Crear registro de asistencia
        $asistencia = Asistencia::create([
            'actividad_id' => $actividadId,
            'actividad_sesion_id' => $sesionId,
            'pastor_id' => $pastor->id,
            'fecha_registro' => now(),
            'metodo' => in_array($metodo, ['qr', 'qr_carnet']) ? 'qr_carnet' : 'manual',
            'asistio_con_conyuge' => $asistioConConyuge,
            'nombre_acompanante' => $request->input('nombre_acompanante', $pastor->nombre_conyuge),
            'kit_entregado' => (bool) $request->input('kit_entregado', false),
            'comida_entregada' => (bool) $request->input('comida_entregada', false),
            'observaciones' => $request->input('observaciones'),
            'registrado_por_user_id' => auth()->id() ?? null,
        ]);

        // 4. Procesar registro de Cónyuge si está en las instalaciones
        $conyugePastor = null;
        $conyugeRegistrado = false;
        if ($asistioConConyuge) {
            if ($pastor->conyuge_id) {
                $conyugePastor = Pastor::find($pastor->conyuge_id);
            }
            if (!$conyugePastor) {
                $conyugePastor = Pastor::where('conyuge_id', $pastor->id)->first();
            }
            if (!$conyugePastor && !empty($pastor->nombre_conyuge)) {
                $nombreLimpio = trim($pastor->nombre_conyuge);
                // Búsqueda directa por documento si colocó cédula
                $conyugePastor = Pastor::where('id', '!=', $pastor->id)->where('documento', $nombreLimpio)->first();

                // Búsqueda por coincidencia directa de nombre
                if (!$conyugePastor) {
                    $conyugePastor = Pastor::where('id', '!=', $pastor->id)
                        ->whereRaw("CONCAT(nombres, ' ', apellidos) LIKE ?", ["%{$nombreLimpio}%"])
                        ->first();
                }

                // Búsqueda inteligente por tokens de nombres y apellidos (ej: "Euclides Palencia" -> "Euclides del Carmen Palencia Lugos")
                if (!$conyugePastor) {
                    $words = array_filter(explode(' ', $nombreLimpio), fn($w) => mb_strlen($w) >= 3);
                    if (count($words) >= 2) {
                        $q = Pastor::query()->where('id', '!=', $pastor->id);
                        foreach ($words as $w) {
                            $q->where(function($sub) use ($w) {
                                $sub->where('nombres', 'like', "%{$w}%")
                                    ->orWhere('apellidos', 'like', "%{$w}%");
                            });
                        }
                        $conyugePastor = $q->first();
                    }
                }

                // Búsqueda por coincidencia inversa en el nombre_conyuge del otro pastor
                if (!$conyugePastor) {
                    $primerNombre = explode(' ', trim($pastor->nombres))[0] ?? '';
                    $primerApellido = explode(' ', trim($pastor->apellidos))[0] ?? '';
                    if ($primerNombre && $primerApellido) {
                        $conyugePastor = Pastor::where('id', '!=', $pastor->id)
                            ->where('nombre_conyuge', 'like', "%{$primerNombre}%")
                            ->where('nombre_conyuge', 'like', "%{$primerApellido}%")
                            ->first();
                    }
                }

                // Si encontramos al cónyuge pastor, vincular recíprocamente sus conyuge_id para registros futuros
                if ($conyugePastor && $conyugePastor->id !== $pastor->id) {
                    if (!$pastor->conyuge_id) {
                        $pastor->conyuge_id = $conyugePastor->id;
                        $pastor->saveQuietly();
                    }
                    if (!$conyugePastor->conyuge_id) {
                        $conyugePastor->conyuge_id = $pastor->id;
                        $conyugePastor->saveQuietly();
                    }
                }
            }

            if ($conyugePastor && $conyugePastor->id !== $pastor->id) {
                Asistencia::updateOrCreate(
                    [
                        'actividad_id' => $actividadId,
                        'pastor_id' => $conyugePastor->id,
                        'actividad_sesion_id' => $sesionId,
                    ],
                    [
                        'fecha_registro' => now(),
                        'metodo' => 'conyuge_vinculado',
                        'asistio_con_conyuge' => true,
                        'nombre_acompanante' => "{$pastor->nombres} {$pastor->apellidos}",
                        'kit_entregado' => (bool) $request->input('kit_entregado', false),
                        'comida_entregada' => (bool) $request->input('comida_entregada', false),
                        'observaciones' => "Acreditado automáticamente con su cónyuge {$pastor->nombres} {$pastor->apellidos}",
                        'registrado_por_user_id' => auth()->id() ?? null,
                    ]
                );
                $conyugeRegistrado = true;
            }
        }

        $totalPresentes = Asistencia::where('actividad_id', $actividadId)
            ->distinct('pastor_id')
            ->count('pastor_id');

        // 5. Disparar notificación push al presbítero de la zona en vivo
        try {
            $extensionNombre = $pastor->extension_nombre ?? $pastor->iglesiasPrincipales->first()?->nombre ?? 'Sede Principal';
            app(\App\Services\ExpoPushNotificationService::class)->notificarPresbitero(
                $pastor,
                $asistencia,
                $extensionNombre,
                $asistioConConyuge
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Error enviando push al presbítero: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => '¡Asistencia registrada exitosamente!',
            'pastor' => $this->formatearPastorCompleto($pastor),
            'asistencia' => [
                'id' => $asistencia->id,
                'hora' => $asistencia->fecha_registro?->format('h:i:s A'),
                'asistio_con_conyuge' => $asistioConConyuge,
                'conyuge_nombre' => $pastor->nombre_conyuge,
                'conyuge_acreditado_independiente' => $conyugeRegistrado,
            ],
            'total_presentes' => $totalPresentes,
        ]);
    }

    /**
     * Últimos escaneos para la cinta de actividad reciente.
     */
    public function ultimosEscaneos(int $actividadId): JsonResponse
    {
        $ultimos = Asistencia::with(['pastor.estado', 'pastor.iglesiasPrincipales', 'sesion'])
            ->where('actividad_id', $actividadId)
            ->orderBy('fecha_registro', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($as) {
                $pastor = $as->pastor;
                return [
                    'id' => $as->id,
                    'pastor_id' => $as->pastor_id,
                    'nombre_completo' => $pastor ? "{$pastor->nombres} {$pastor->apellidos}" : 'Invitado/Obrero',
                    'documento' => $pastor?->documento,
                    'codigo' => $pastor?->codigo,
                    'foto' => $pastor?->foto_url ? (str_starts_with($pastor->foto_url, 'http') ? $pastor->foto_url : url($pastor->foto_url)) : null,
                    'zona' => $pastor?->zona,
                    'extension_nombre' => $pastor?->extension_nombre ?? $pastor?->iglesiasPrincipales?->first()?->nombre ?? 'Principal',
                    'extension_estado' => $pastor?->extension_estado ?? $pastor?->estado?->nombre,
                    'sesion' => $as->sesion?->nombre ?? 'General',
                    'hora' => $as->fecha_registro?->format('h:i:s A'),
                    'asistio_con_conyuge' => (bool) $as->asistio_con_conyuge,
                ];
            });

        return response()->json([
            'success' => true,
            'ultimos' => $ultimos,
        ]);
    }

    /**
     * Formateo estandarizado del pastor para la app móvil.
     */
    protected function formatearPastorCompleto(Pastor $pastor): array
    {
        $extension = $pastor->extension_nombre ?? $pastor->iglesiasPrincipales->first()?->nombre ?? 'Sede Principal';
        $estadoExtension = $pastor->extension_estado ?? $pastor->estado?->nombre ?? 'Venezuela';

        return [
            'id' => $pastor->id,
            'codigo' => $pastor->codigo,
            'nombres' => $pastor->nombres,
            'apellidos' => $pastor->apellidos,
            'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
            'documento' => $pastor->documento,
            'foto' => $pastor->foto_url ? (str_starts_with($pastor->foto_url, 'http') ? $pastor->foto_url : url($pastor->foto_url)) : null,
            'nivel_ministerial' => $pastor->nivel_ministerial ?? 'Obrero',
            'cargo_nacional' => $pastor->cargo_nacional,
            'zona' => $pastor->zona,
            'distrito' => $pastor->distrito,
            'extension_nombre' => $extension,
            'extension_estado' => $estadoExtension,
            'iglesia' => $pastor->iglesiasPrincipales->first()?->nombre ?? $extension,
            'estado' => $pastor->estado?->nombre,
            'municipio' => $pastor->municipioModel?->nombre,
            'nombre_conyuge' => $pastor->nombre_conyuge,
            'tiene_conyuge' => !empty($pastor->nombre_conyuge) || !empty($pastor->conyuge_id),
        ];
    }

    /**
     * Extraer código limpio de la cadena QR
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

        return $data;
    }
}
