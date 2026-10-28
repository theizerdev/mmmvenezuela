<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Asistencia;
use App\Models\Pastor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PresbiterioApiController extends Controller
{
    /**
     * Inicio de sesión para Presbíteros y Supervisores Nacionales.
     */
    public function login(Request $request): JsonResponse
    {
        $loginValue = $request->input('login')
            ?? $request->input('usuario')
            ?? $request->input('username')
            ?? $request->input('email');

        $request->merge(['login' => $loginValue]);

        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
            'expo_push_token' => 'nullable|string',
        ]);

        $login = trim($request->input('login'));
        $password = $request->input('password');

        // Búsqueda por email o username
        $user = User::where('email', $login)
            ->orWhere('username', $login)
            ->orWhere('telefono', $login)
            ->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas. Verifique su usuario y contraseña.',
            ], 401);
        }

        // Actualizar push token si fue enviado
        if ($request->filled('expo_push_token')) {
            $user->expo_push_token = $request->input('expo_push_token');
            $user->save();
        }

        $token = $user->createToken('asistencia-liderazgo-token')->plainTextToken;
        $roles = $user->getRoleNames()->toArray();

        $esSupervisor = $user->hasAnyRole(['Supervisor Nacional', 'supervisor-nacional', 'Super Administrador', 'super-admin', 'Junta Nacional']);
        $esPresbitero = $user->hasAnyRole(['Presbitero', 'presbitero']);

        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'telefono' => $user->telefono,
                'zona' => $user->zona,
                'distrito' => $user->distrito,
                'zona_2' => $user->zona_2,
                'roles' => $roles,
                'es_presbitero' => $esPresbitero,
                'es_supervisor' => $esSupervisor,
                'push_notificaciones_activas' => (bool) $user->push_notificaciones_activas,
                'push_modo_silencioso' => (bool) $user->push_modo_silencioso,
            ],
        ]);
    }

    /**
     * Cerrar sesión y revocar token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente.',
        ]);
    }

    /**
     * Actualizar token de notificación push y preferencias de silencio.
     */
    public function updatePushSettings(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'expo_push_token' => 'nullable|string',
            'push_notificaciones_activas' => 'nullable|boolean',
            'push_modo_silencioso' => 'nullable|boolean',
        ]);

        if ($request->has('expo_push_token')) {
            $user->expo_push_token = $request->input('expo_push_token');
        }
        if ($request->has('push_notificaciones_activas')) {
            $user->push_notificaciones_activas = (bool) $request->input('push_notificaciones_activas');
        }
        if ($request->has('push_modo_silencioso')) {
            $user->push_modo_silencioso = (bool) $request->input('push_modo_silencioso');
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Preferencias actualizadas correctamente.',
            'push_notificaciones_activas' => (bool) $user->push_notificaciones_activas,
            'push_modo_silencioso' => (bool) $user->push_modo_silencioso,
        ]);
    }

    /**
     * Dashboard para el Presbítero (filtrado por su zona).
     */
    public function presbiteroDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $esSupervisor = $user->hasAnyRole(['Supervisor Nacional', 'supervisor-nacional', 'Super Administrador', 'super-admin', 'Junta Nacional']);

        // Determinar la zona: si es supervisor puede filtrar por cualquier zona, si es presbítero usa su zona
        $zona = $esSupervisor ? ($request->input('zona') ?? $user->zona ?? '1') : ($user->zona ?? '1');

        // Buscar el presbítero oficial asignado a esta zona en la base de datos
        $presbiteroUser = User::where('zona', $zona)->first();
        $presbiteroNombre = $presbiteroUser ? $presbiteroUser->name : "Presbítero Zona {$zona}";
        $presbiteroTelefono = $presbiteroUser?->telefono;

        $actividadId = $request->input('actividad_id');
        $sesionId = $request->input('actividad_sesion_id') ?? $request->input('sesion_id');

        // Obtener actividad activa si no se especificó (sin restringir por la zona del evento)
        $actividad = $actividadId
            ? Actividad::withoutGlobalScope('multitenancy')->find($actividadId)
            : Actividad::withoutGlobalScope('multitenancy')->where('estado', '!=', 'cancelada')->orderBy('fecha_inicio', 'desc')->first();

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró una actividad activa.',
            ], 404);
        }

        // 1. Padrón de pastores de esta zona
        $pastoresZona = Pastor::withoutGlobalScope('multitenancy')
            ->with(['estado', 'municipioModel', 'iglesiasPrincipales'])
            ->where('zona', $zona)
            ->where('status', true)
            ->orderBy('nombres')
            ->get();

        $totalPadron = $pastoresZona->count();

        // 2. Asistencias registradas para esta actividad
        $asistenciasQuery = Asistencia::with(['pastor', 'sesion'])
            ->where('actividad_id', $actividad->id)
            ->whereIn('pastor_id', $pastoresZona->pluck('id'));

        if ($sesionId) {
            $asistenciasQuery->where('actividad_sesion_id', $sesionId);
        }

        $asistencias = $asistenciasQuery->orderBy('fecha_registro', 'desc')->get();
        $asistenciasPorPastor = $asistencias->keyBy('pastor_id');

        $presentes = [];
        $pendientes = [];
        $conConyugeCount = 0;

        foreach ($pastoresZona as $pastor) {
            $extension = $pastor->extension_nombre ?? $pastor->iglesiasPrincipales->first()?->nombre ?? 'Sede Principal';
            $fotoUrl = $pastor->foto_url ? (str_starts_with($pastor->foto_url, 'http') ? $pastor->foto_url : url($pastor->foto_url)) : null;

            if ($asistenciasPorPastor->has($pastor->id)) {
                $as = $asistenciasPorPastor->get($pastor->id);
                if ($as->asistio_con_conyuge) {
                    $conConyugeCount++;
                }

                $presentes[] = [
                    'id' => $pastor->id,
                    'pastor_id' => $pastor->id,
                    'asistencia_id' => $as->id,
                    'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
                    'documento' => $pastor->documento,
                    'codigo' => $pastor->codigo,
                    'foto' => $fotoUrl,
                    'foto_url' => $fotoUrl,
                    'nivel_ministerial' => $pastor->nivel_ministerial ?? 'Obrero',
                    'extension_nombre' => $extension,
                    'extension_estado' => $pastor->extension_estado ?? $pastor->estado?->nombre,
                    'distrito' => $pastor->distrito,
                    'hora' => $as->fecha_registro?->format('h:i A') ?? 'Acreditado',
                    'hora_asistencia' => $as->fecha_registro?->format('h:i A') ?? 'Acreditado',
                    'metodo' => $as->metodo,
                    'asistio_con_conyuge' => (bool) $as->asistio_con_conyuge,
                    'conyuge_presente' => (bool) $as->asistio_con_conyuge,
                    'nombre_conyuge' => $pastor->nombre_conyuge,
                ];
            } else {
                $telefonoLimpio = preg_replace('/\D/', '', $pastor->telefono ?? '');
                $pendientes[] = [
                    'id' => $pastor->id,
                    'pastor_id' => $pastor->id,
                    'nombre_completo' => "{$pastor->nombres} {$pastor->apellidos}",
                    'documento' => $pastor->documento,
                    'codigo' => $pastor->codigo,
                    'foto' => $fotoUrl,
                    'foto_url' => $fotoUrl,
                    'nivel_ministerial' => $pastor->nivel_ministerial ?? 'Obrero',
                    'extension_nombre' => $extension,
                    'extension_estado' => $pastor->extension_estado ?? $pastor->estado?->nombre,
                    'distrito' => $pastor->distrito,
                    'telefono' => $pastor->telefono,
                    'telefono_limpio' => $telefonoLimpio,
                    'tiene_telefono' => !empty($telefonoLimpio),
                    'nombre_conyuge' => $pastor->nombre_conyuge,
                ];
            }
        }

        $totalPresentes = count($presentes);
        $totalPendientes = count($pendientes);
        $porcentaje = $totalPadron > 0 ? round(($totalPresentes / $totalPadron) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'zona' => (string) $zona,
            'presbitero_nombre' => $presbiteroNombre,
            'presbitero_telefono' => $presbiteroTelefono,
            'actividad' => [
                'id' => $actividad->id,
                'nombre' => $actividad->nombre,
                'tipo' => $actividad->tipo,
                'lugar' => $actividad->lugar,
            ],
            'metricas' => [
                'total_padron' => $totalPadron,
                'total_presentes' => $totalPresentes,
                'total_pendientes' => $totalPendientes,
                'porcentaje_asistencia' => $porcentaje,
                'con_conyuge' => $conConyugeCount,
            ],
            'presentes' => $presentes,
            'pendientes' => $pendientes,
        ]);
    }

    /**
     * Dashboard para el Supervisor Nacional (Resumen País + Ranking de todas las Zonas).
     */
    public function supervisorDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['Supervisor Nacional', 'supervisor-nacional', 'Super Administrador', 'super-admin', 'Junta Nacional'])) {
            return response()->json([
                'success' => false,
                'message' => 'No tiene permisos para acceder al dashboard nacional.',
            ], 403);
        }

        $actividadId = $request->input('actividad_id');
        $actividad = $actividadId
            ? Actividad::withoutGlobalScope('multitenancy')->find($actividadId)
            : Actividad::withoutGlobalScope('multitenancy')->where('estado', '!=', 'cancelada')->orderBy('fecha_inicio', 'desc')->first();

        if (!$actividad) {
            return response()->json([
                'success' => false,
                'message' => 'No se encontró una actividad activa.',
            ], 404);
        }

        // 1. Métricas Globales País
        $totalPastoresPadron = Pastor::withoutGlobalScope('multitenancy')->where('status', true)->count();
        $asistenciasNacionales = Asistencia::where('actividad_id', $actividad->id)->get();
        $pastorIdsPresentes = $asistenciasNacionales->pluck('pastor_id')->unique()->values();
        $totalPresentesNacional = $pastorIdsPresentes->count();
        $porcentajeNacional = $totalPastoresPadron > 0 ? round(($totalPresentesNacional / $totalPastoresPadron) * 100, 1) : 0;
        $totalConConyugeNacional = $asistenciasNacionales->where('asistio_con_conyuge', true)->unique('pastor_id')->count();

        // 2. Conteo de pastores por Zona
        $padronPorZona = Pastor::withoutGlobalScope('multitenancy')->where('status', true)
            ->whereNotNull('zona')
            ->select('zona', DB::raw('count(*) as total'))
            ->groupBy('zona')
            ->pluck('total', 'zona')
            ->toArray();

        $presentesPorZona = Pastor::withoutGlobalScope('multitenancy')->whereIn('id', $pastorIdsPresentes)
            ->whereNotNull('zona')
            ->select('zona', DB::raw('count(*) as total'))
            ->groupBy('zona')
            ->pluck('total', 'zona')
            ->toArray();

        // Obtener presbíteros asignados a cada zona
        $presbiterosPorZona = User::whereNotNull('zona')
            ->get()
            ->keyBy('zona');

        // Construir listado oficial de las 41 Zonas de Venezuela en estricto orden numérico (1 al 41)
        $zonas = [];
        for ($z = 1; $z <= 41; $z++) {
            $zStr = (string) $z;
            $padronCount = $padronPorZona[$zStr] ?? $padronPorZona[$z] ?? 0;
            $presentesCount = $presentesPorZona[$zStr] ?? $presentesPorZona[$z] ?? 0;
            $pct = $padronCount > 0 ? round(($presentesCount / $padronCount) * 100, 1) : 0;
            $presbitero = $presbiterosPorZona->get($zStr) ?? $presbiterosPorZona->get($z);

            $semaforo = 'red';
            if ($pct >= 70) {
                $semaforo = 'green';
            } elseif ($pct >= 40) {
                $semaforo = 'amber';
            }

            $zonas[] = [
                'zona' => $zStr,
                'nombre_zona' => "Zona {$z}",
                'presbitero_nombre' => $presbitero ? $presbitero->name : "Presbítero Zona {$z}",
                'presbitero_telefono' => $presbitero?->telefono,
                'padron' => $padronCount,
                'total_padron' => $padronCount,
                'presentes' => $presentesCount,
                'pendientes' => max(0, $padronCount - $presentesCount),
                'porcentaje' => $pct,
                'semaforo' => $semaforo,
            ];
        }

        return response()->json([
            'success' => true,
            'actividad' => [
                'id' => $actividad->id,
                'nombre' => $actividad->nombre,
                'tipo' => $actividad->tipo,
                'lugar' => $actividad->lugar,
            ],
            'metricas_nacionales' => [
                'total_padron' => $totalPastoresPadron,
                'total_presentes' => $totalPresentesNacional,
                'total_pendientes' => max(0, $totalPastoresPadron - $totalPresentesNacional),
                'porcentaje_asistencia' => $porcentajeNacional,
                'total_con_conyuge' => $totalConConyugeNacional,
                'total_zonas' => count($zonas),
            ],
            'zonas' => $zonas,
        ]);
    }
}

