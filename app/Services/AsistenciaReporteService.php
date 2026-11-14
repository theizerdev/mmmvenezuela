<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\ActividadSesion;
use App\Models\Asistencia;
use App\Models\Pastor;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AsistenciaReporteService
{
    /**
     * Normalizar cualquier formato de zona ("01", "Zona 1", "1") a clave homogénea.
     */
    public function normalizeZona(?string $zona): string
    {
        $raw = trim((string) ($zona ?? ''));
        if ($raw === '') {
            return 'Sin Zona';
        }

        if (preg_match('/^(?:zona\s*)?0*(\d+)$/i', $raw, $matches)) {
            return (string) ((int) $matches[1]);
        }

        return $raw;
    }

    /**
     * Etiqueta humana estándar para una zona.
     */
    public function formatNombreZona(string $zonaKey): string
    {
        return $zonaKey === 'Sin Zona' ? 'Sin Zona Asignada' : "Zona {$zonaKey}";
    }

    /**
     * Construir resumen por zonas y listado detallado de asistentes para una actividad o sesión.
     */
    public function buildDetallePorZonas(Actividad $actividad, ?ActividadSesion $sesion = null): array
    {
        $zonaActividad = $actividad->zona ? $this->normalizeZona($actividad->zona) : null;

        // 1. Padrón de pastores activos convocados (respetando Multitenantable del usuario)
        $pastoresConvocados = Pastor::where('status', true)
            ->select('id', 'zona')
            ->get();

        if ($zonaActividad !== null && $zonaActividad !== 'Sin Zona') {
            $pastoresConvocados = $pastoresConvocados
                ->filter(fn (Pastor $p) => $this->normalizeZona($p->zona) === $zonaActividad)
                ->values();
        }

        $padronPorZona = [];
        foreach ($pastoresConvocados as $pastor) {
            $zKey = $this->normalizeZona($pastor->zona);
            $padronPorZona[$zKey] = ($padronPorZona[$zKey] ?? 0) + 1;
        }
        $totalPadron = $pastoresConvocados->count();

        // 2. Asistencias registradas en el alcance (sesión específica o actividad completa)
        $asistencias = Asistencia::with([
            'pastor:id,codigo,nombres,apellidos,documento,nivel_ministerial,cargo_nacional,zona,distrito,estado_id,conyuge_id,nombre_conyuge,telefono_tlf',
            'pastor.estado:id,nombre',
            'pastor.iglesiasPrincipales:id,pastor_id,nombre,estado_id',
            'pastor.iglesias:id,nombre,estado_id',
            'pastor.conyuge:id,nombres,apellidos',
            'pastor.conyuge.iglesiasPrincipales:id,pastor_id,nombre,estado_id',
            'pastor.conyuge.iglesias:id,nombre,estado_id',
            'sesion:id,nombre,fecha_hora_inicio,fecha_hora_fin,is_activa',
        ])
            ->where('actividad_id', $actividad->id)
            ->when($sesion, fn ($q) => $q->where('actividad_sesion_id', $sesion->id))
            ->orderBy('fecha_registro', 'asc')
            ->get();

        if ($zonaActividad !== null && $zonaActividad !== 'Sin Zona') {
            $asistencias = $asistencias
                ->filter(fn (Asistencia $as) => $this->normalizeZona($as->pastor?->zona) === $zonaActividad)
                ->values();
        }

        if ($this->isUsuarioPresbiteroRestringido()) {
            $zonasUsuario = $this->getZonasPermitidasUsuario();
            $asistencias = $asistencias
                ->filter(fn (Asistencia $as) => in_array($this->normalizeZona($as->pastor?->zona), $zonasUsuario, true))
                ->values();
        }

        $pastoresPresentesIds = $asistencias->pluck('pastor_id')->filter()->unique()->values();
        $totalPresentes = $pastoresPresentesIds->count();
        $porcentajeQuorum = $totalPadron > 0 ? round(($totalPresentes / $totalPadron) * 100, 1) : 0;
        $totalConConyuge = $asistencias->where('asistio_con_conyuge', true)->unique('pastor_id')->count();
        $totalAusentes = max(0, $totalPadron - $totalPresentes);

        // 3. Presbíteros asignados por zona
        $presbiterosPorZona = $this->resolvePresbiterosPorZona();

        // 4. Agrupar registros formateados por zona
        $asistenciasAgrupadas = [];
        $todosCronologico = [];

        foreach ($asistencias as $as) {
            $pastor = $as->pastor;
            $zKey = $this->normalizeZona($pastor?->zona);
            $item = $this->formatAsistenteItem($as, $zKey);

            $asistenciasAgrupadas[$zKey][] = $item;
            $todosCronologico[] = $item;
        }

        // Ordenar listado cronológico del más reciente al más antiguo para vista en pantalla
        $asistenciasCronologico = collect($todosCronologico)
            ->sortByDesc('fecha_registro_iso')
            ->values()
            ->all();

        // 5. Determinar universo ordenado de zonas (1..41 para eventos nacionales, o zonas convocadas)
        $zoneKeys = $this->resolveOrderedZoneKeys($padronPorZona, $asistenciasAgrupadas, $zonaActividad);

        $zonas = [];
        $zonasConAsistencia = 0;

        foreach ($zoneKeys as $zKey) {
            $rowsZona = $asistenciasAgrupadas[$zKey] ?? [];

            // Ordenar alfabéticamente por apellidos y nombres dentro de la zona
            usort($rowsZona, function (array $a, array $b) {
                $cmpAp = strcasecmp($a['apellidos'], $b['apellidos']);
                if ($cmpAp !== 0) {
                    return $cmpAp;
                }

                $cmpNom = strcasecmp($a['nombres'], $b['nombres']);
                if ($cmpNom !== 0) {
                    return $cmpNom;
                }

                return strcmp($a['fecha_registro_iso'], $b['fecha_registro_iso']);
            });

            $zonaRowsCol = collect($rowsZona);
            $zonaPresentes = $zonaRowsCol->pluck('pastor_id')->filter()->unique()->count();
            $zonaPadron = $padronPorZona[$zKey] ?? 0;
            $zonaConConyuge = $zonaRowsCol->where('asistio_con_conyuge', true)->unique('pastor_id')->count();
            $zonaPendientes = max(0, $zonaPadron - $zonaPresentes);
            $zonaPct = $zonaPadron > 0 ? round(($zonaPresentes / $zonaPadron) * 100, 1) : 0;

            if ($zonaPresentes > 0) {
                $zonasConAsistencia++;
            }

            $semaforo = 'empty';
            if ($zonaPresentes > 0) {
                if ($zonaPct >= 70) {
                    $semaforo = 'green';
                } elseif ($zonaPct >= 40) {
                    $semaforo = 'amber';
                } else {
                    $semaforo = 'red';
                }
            }

            $zonas[] = [
                'zona' => $zKey,
                'nombre_zona' => $this->formatNombreZona($zKey),
                'presbitero_nombre' => $presbiterosPorZona[$zKey] ?? ($zKey === 'Sin Zona' ? '—' : "Presbítero Zona {$zKey}"),
                'total_padron' => $zonaPadron,
                'total_presentes' => $zonaPresentes,
                'total_pendientes' => $zonaPendientes,
                'total_con_conyuge' => $zonaConConyuge,
                'total_registros' => count($rowsZona),
                'porcentaje' => $zonaPct,
                'semaforo' => $semaforo,
                'asistentes' => $rowsZona,
            ];
        }

        return [
            'metricas' => [
                'total_padron' => $totalPadron,
                'total_presentes' => $totalPresentes,
                'porcentaje_quorum' => $porcentajeQuorum,
                'total_con_conyuge' => $totalConConyuge,
                'total_ausentes' => $totalAusentes,
                'zonas_con_asistencia' => $zonasConAsistencia,
                'total_zonas' => count($zonas),
                'total_registros' => count($todosCronologico),
            ],
            'zonas' => $zonas,
            'asistentes_cronologico' => $asistenciasCronologico,
        ];
    }

    /**
     * Formatear una fila de asistencia evitando serialización pesada de modelos.
     */
    protected function formatAsistenteItem(Asistencia $as, string $zonaNormalizada): array
    {
        $pastor = $as->pastor;
        $nombres = trim((string) ($pastor?->nombres ?? ''));
        $apellidos = trim((string) ($pastor?->apellidos ?? ''));
        $iglesia = $this->resolveIglesiaNombre($pastor);

        $metodo = (string) ($as->metodo ?? 'manual');
        $metodoLabel = match ($metodo) {
            'facial' => 'Facial',
            'qr_carnet' => 'QR',
            'conyuge_vinculado' => 'Cónyuge',
            default => 'Manual',
        };

        $acompanante = $as->asistio_con_conyuge
            ? ($as->nombre_acompanante ?: $pastor?->nombre_conyuge)
            : null;

        return [
            'id' => $as->id,
            'pastor_id' => $as->pastor_id,
            'codigo' => $pastor?->codigo ?? '—',
            'documento' => $pastor?->documento ?? '—',
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'nombre_completo' => trim("{$apellidos} {$nombres}") ?: 'Pastor no disponible',
            'nombre_mostrado' => trim("{$nombres} {$apellidos}") ?: 'Pastor no disponible',
            'nivel_ministerial' => $pastor?->nivel_ministerial ?? 'Pastor',
            'cargo_nacional' => $pastor?->cargo_nacional,
            'zona' => $zonaNormalizada,
            'distrito' => $pastor?->distrito,
            'iglesia' => $iglesia,
            'estado' => $pastor?->estado?->nombre,
            'telefono' => $pastor?->telefono_tlf,
            'sesion' => $as->sesion?->nombre ?? 'Sesión General',
            'hora' => $as->fecha_registro ? $as->fecha_registro->format('h:i A') : '—',
            'fecha_hora' => $as->fecha_registro ? $as->fecha_registro->format('d/m/Y h:i A') : '—',
            'fecha_registro_iso' => $as->fecha_registro ? $as->fecha_registro->toIso8601String() : '',
            'metodo' => $metodo,
            'metodo_label' => $metodoLabel,
            'asistio_con_conyuge' => (bool) $as->asistio_con_conyuge,
            'nombre_acompanante' => $acompanante,
        ];
    }

    /**
     * Resolver nombre de iglesia sin disparar consultas lazy adicionales.
     */
    protected function resolveIglesiaNombre(?Pastor $pastor): ?string
    {
        if (! $pastor) {
            return null;
        }

        if ($pastor->relationLoaded('iglesiasPrincipales') && $pastor->iglesiasPrincipales->isNotEmpty()) {
            $nombre = trim((string) $pastor->iglesiasPrincipales->first()->nombre);
            if ($nombre !== '') {
                return $nombre;
            }
        }

        if ($pastor->relationLoaded('iglesias') && $pastor->iglesias->isNotEmpty()) {
            $nombre = trim((string) $pastor->iglesias->first()->nombre);
            if ($nombre !== '') {
                return $nombre;
            }
        }

        if ($pastor->relationLoaded('conyuge') && $pastor->conyuge) {
            $conyuge = $pastor->conyuge;
            if ($conyuge->relationLoaded('iglesiasPrincipales') && $conyuge->iglesiasPrincipales->isNotEmpty()) {
                $nombre = trim((string) $conyuge->iglesiasPrincipales->first()->nombre);
                if ($nombre !== '') {
                    return $nombre;
                }
            }
            if ($conyuge->relationLoaded('iglesias') && $conyuge->iglesias->isNotEmpty()) {
                $nombre = trim((string) $conyuge->iglesias->first()->nombre);
                if ($nombre !== '') {
                    return $nombre;
                }
            }
        }

        return null;
    }

    /**
     * Obtener mapa [zona_normalizada => nombre_presbitero].
     */
    protected function resolvePresbiterosPorZona(): array
    {
        $usuarios = User::withoutGlobalScopes()
            ->whereNotNull('zona')
            ->with('roles:id,name')
            ->get(['id', 'name', 'zona']);

        $mapa = [];
        foreach ($usuarios as $user) {
            $zKey = $this->normalizeZona($user->zona);
            if ($zKey === 'Sin Zona') {
                continue;
            }

            $esPresbitero = $user->roles->contains(
                fn ($r) => in_array(mb_strtolower($r->name), ['presbitero', 'presbítero'], true)
            );

            if (! isset($mapa[$zKey]) || $esPresbitero) {
                $mapa[$zKey] = $user->name;
            }
        }

        return $mapa;
    }

    /**
     * Construir el listado ordenado de zonas (1..41 para alcance nacional, o alcance filtrado).
     */
    protected function resolveOrderedZoneKeys(array $padronPorZona, array $asistenciasAgrupadas, ?string $zonaActividad): array
    {
        $keys = array_unique(array_merge(array_keys($padronPorZona), array_keys($asistenciasAgrupadas)));

        if ($zonaActividad === null && ! $this->isUsuarioPresbiteroRestringido()) {
            for ($z = 1; $z <= 41; $z++) {
                $keys[] = (string) $z;
            }
            $keys = array_unique($keys);
        }

        usort($keys, function (string $a, string $b) {
            if ($a === 'Sin Zona') {
                return 1;
            }
            if ($b === 'Sin Zona') {
                return -1;
            }

            $numA = ctype_digit($a) ? (int) $a : null;
            $numB = ctype_digit($b) ? (int) $b : null;

            if ($numA !== null && $numB !== null) {
                return $numA <=> $numB;
            }
            if ($numA !== null) {
                return -1;
            }
            if ($numB !== null) {
                return 1;
            }

            return strnatcasecmp($a, $b);
        });

        return array_values($keys);
    }

    /**
     * Determinar si el usuario actual está limitado por zona (Presbítero sin rol nacional).
     */
    protected function isUsuarioPresbiteroRestringido(): bool
    {
        $user = Auth::user();

        return (bool) (
            $user
            && $user->hasAnyRole(['Presbitero', 'presbitero'])
            && ! $user->hasAnyRole(['Super Administrador', 'super-admin', 'Supervisor Nacional', 'supervisor-nacional', 'Junta Nacional', 'Secretaria Nacional'])
        );
    }

    /**
     * Obtener zonas normalizadas permitidas para un Presbítero.
     */
    protected function getZonasPermitidasUsuario(): array
    {
        $user = Auth::user();
        if (! $user) {
            return [];
        }

        return array_values(array_filter([
            $user->zona ? $this->normalizeZona($user->zona) : null,
            $user->zona_2 ? $this->normalizeZona($user->zona_2) : null,
        ], fn ($z) => $z !== null && $z !== 'Sin Zona'));
    }
}
