<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\ActividadSesion;
use App\Models\Asistencia;
use App\Models\Pastor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActividadController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $tipo = $request->input('tipo');
        $estado = $request->input('estado');
        $zona = $request->input('zona');

        $query = Actividad::with(['sesiones'])
            ->withCount([
                'asistencias',
                'asistencias as total_pastores_unicos' => function ($q) {
                    $q->select(DB::raw('count(distinct pastor_id)'));
                },
            ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('lugar', 'like', "%{$search}%")
                  ->orWhere('descripcion', 'like', "%{$search}%");
            });
        }

        if ($tipo) {
            $query->where('tipo', $tipo);
        }

        if ($estado) {
            $query->where('estado', $estado);
        }

        if ($zona) {
            $query->where('zona', $zona);
        }

        $actividades = $query->orderBy('fecha_inicio', 'desc')->paginate(12)->withQueryString();

        // Estadísticas generales para los KPIs del header
        $totalActividades = Actividad::count();
        $actividadesEnCurso = Actividad::where('estado', 'en_curso')
            ->orWhere(function ($q) {
                $now = now();
                $q->where('fecha_inicio', '<=', $now)->where('fecha_fin', '>=', $now);
            })->count();
        $totalAsistenciasRegistradas = Asistencia::count();
        $totalPastoresRegistrados = Pastor::where('status', true)->count();

        return Inertia::render('admin/Actividades/Index', [
            'actividades' => $actividades,
            'filters' => [
                'search' => $search,
                'tipo' => $tipo,
                'estado' => $estado,
                'zona' => $zona,
            ],
            'kpis' => [
                'total_actividades' => $totalActividades,
                'en_curso' => $actividadesEnCurso,
                'total_asistencias' => $totalAsistenciasRegistradas,
                'total_pastores' => $totalPastoresRegistrados,
            ],
            'tiposDisponibles' => [
                'Convención',
                'Retiro Pastoral',
                'Asamblea Nacional',
                'Reunión de Zona',
                'Confraternidad',
                'Taller / Seminario',
                'Reunión de Obreros',
                'Otro',
            ],
        ]);
    }

    public function create()
    {
        return redirect()->route('admin.actividades.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'lugar' => 'nullable|string|max:255',
            'zona' => 'nullable|string|max:50',
            'distrito' => 'nullable|string|max:50',
            'estado' => 'required|in:planificada,en_curso,finalizada,cancelada',
            'permite_conyuge' => 'boolean',
            'controla_comida' => 'boolean',
            'capacidad_maxima' => 'nullable|integer|min:1',
            'sesiones' => 'nullable|array',
            'sesiones.*.nombre' => 'required|string|max:255',
            'sesiones.*.fecha_hora_inicio' => 'required|date',
            'sesiones.*.fecha_hora_fin' => 'required|date|after_or_equal:sesiones.*.fecha_hora_inicio',
            'sesiones.*.es_obligatoria' => 'boolean',
            'sesiones.*.tipo_comida' => 'nullable|string|in:ninguna,desayuno,almuerzo,cena',
        ]);

        DB::beginTransaction();
        try {
            $actividad = Actividad::create([
                'nombre' => $validated['nombre'],
                'tipo' => $validated['tipo'],
                'descripcion' => $validated['descripcion'] ?? null,
                'fecha_inicio' => $validated['fecha_inicio'],
                'fecha_fin' => $validated['fecha_fin'],
                'lugar' => $validated['lugar'] ?? null,
                'zona' => $validated['zona'] ?? null,
                'distrito' => $validated['distrito'] ?? null,
                'estado' => $validated['estado'],
                'permite_conyuge' => $validated['permite_conyuge'] ?? true,
                'controla_comida' => $validated['controla_comida'] ?? false,
                'capacidad_maxima' => $validated['capacidad_maxima'] ?? null,
            ]);

            if (!empty($validated['sesiones'])) {
                foreach ($validated['sesiones'] as $index => $sesionData) {
                    $actividad->sesiones()->create([
                        'nombre' => $sesionData['nombre'],
                        'fecha_hora_inicio' => $sesionData['fecha_hora_inicio'],
                        'fecha_hora_fin' => $sesionData['fecha_hora_fin'],
                        'es_obligatoria' => $sesionData['es_obligatoria'] ?? true,
                        'tipo_comida' => $sesionData['tipo_comida'] ?? 'ninguna',
                        'orden' => $index + 1,
                    ]);
                }
            } else {
                // Crear al menos una sesión general por defecto
                $actividad->sesiones()->create([
                    'nombre' => 'Sesión General / Registro',
                    'fecha_hora_inicio' => $validated['fecha_inicio'],
                    'fecha_hora_fin' => $validated['fecha_fin'],
                    'es_obligatoria' => true,
                    'tipo_comida' => 'ninguna',
                    'orden' => 1,
                ]);
            }

            DB::commit();

            return redirect()->route('admin.actividades.index')
                ->with('notification', ['type' => 'success', 'message' => '¡Actividad creada exitosamente!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('notification', ['type' => 'error', 'message' => 'Error al crear la actividad: ' . $e->getMessage()]);
        }
    }

    public function edit(int $id)
    {
        return redirect()->route('admin.actividades.index');
    }

    public function update(Request $request, int $id)
    {
        $actividad = Actividad::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'lugar' => 'nullable|string|max:255',
            'zona' => 'nullable|string|max:50',
            'distrito' => 'nullable|string|max:50',
            'estado' => 'required|in:planificada,en_curso,finalizada,cancelada',
            'permite_conyuge' => 'boolean',
            'controla_comida' => 'boolean',
            'capacidad_maxima' => 'nullable|integer|min:1',
            'sesiones' => 'nullable|array',
            'sesiones.*.id' => 'nullable|integer',
            'sesiones.*.nombre' => 'required|string|max:255',
            'sesiones.*.fecha_hora_inicio' => 'required|date',
            'sesiones.*.fecha_hora_fin' => 'required|date|after_or_equal:sesiones.*.fecha_hora_inicio',
            'sesiones.*.es_obligatoria' => 'boolean',
            'sesiones.*.tipo_comida' => 'nullable|string|in:ninguna,desayuno,almuerzo,cena',
        ]);

        DB::beginTransaction();
        try {
            $actividad->update([
                'nombre' => $validated['nombre'],
                'tipo' => $validated['tipo'],
                'descripcion' => $validated['descripcion'] ?? null,
                'fecha_inicio' => $validated['fecha_inicio'],
                'fecha_fin' => $validated['fecha_fin'],
                'lugar' => $validated['lugar'] ?? null,
                'zona' => $validated['zona'] ?? null,
                'distrito' => $validated['distrito'] ?? null,
                'estado' => $validated['estado'],
                'permite_conyuge' => $validated['permite_conyuge'] ?? true,
                'controla_comida' => $validated['controla_comida'] ?? false,
                'capacidad_maxima' => $validated['capacidad_maxima'] ?? null,
            ]);

            // Sincronizar sesiones
            if (isset($validated['sesiones'])) {
                $keptIds = [];
                foreach ($validated['sesiones'] as $index => $sData) {
                    if (!empty($sData['id'])) {
                        $sesion = ActividadSesion::where('actividad_id', $actividad->id)->where('id', $sData['id'])->first();
                        if ($sesion) {
                            $sesion->update([
                                'nombre' => $sData['nombre'],
                                'fecha_hora_inicio' => $sData['fecha_hora_inicio'],
                                'fecha_hora_fin' => $sData['fecha_hora_fin'],
                                'es_obligatoria' => $sData['es_obligatoria'] ?? true,
                                'tipo_comida' => $sData['tipo_comida'] ?? 'ninguna',
                                'orden' => $index + 1,
                            ]);
                            $keptIds[] = $sesion->id;
                            continue;
                        }
                    }

                    // Crear nueva sesión
                    $newSesion = $actividad->sesiones()->create([
                        'nombre' => $sData['nombre'],
                        'fecha_hora_inicio' => $sData['fecha_hora_inicio'],
                        'fecha_hora_fin' => $sData['fecha_hora_fin'],
                        'es_obligatoria' => $sData['es_obligatoria'] ?? true,
                        'tipo_comida' => $sData['tipo_comida'] ?? 'ninguna',
                        'orden' => $index + 1,
                    ]);
                    $keptIds[] = $newSesion->id;
                }

                // Eliminar sesiones removidas
                $actividad->sesiones()->whereNotIn('id', $keptIds)->delete();
            }

            DB::commit();

            return redirect()->route('admin.actividades.index')
                ->with('notification', ['type' => 'success', 'message' => '¡Actividad actualizada exitosamente!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->with('notification', ['type' => 'error', 'message' => 'Error al actualizar: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $id)
    {
        $actividad = Actividad::findOrFail($id);
        $actividad->delete();

        return redirect()->route('admin.actividades.index')
            ->with('notification', ['type' => 'success', 'message' => 'Actividad eliminada correctamente.']);
    }

    /**
     * Dashboard en Vivo / Monitor de la actividad
     */
    public function monitor(int $id)
    {
        $actividad = Actividad::with(['sesiones'])->findOrFail($id);

        // Consulta de pastores convocados (si la actividad es de zona, filtrar por esa zona)
        $pastoresQuery = Pastor::where('status', true);
        if ($actividad->zona) {
            $pastoresQuery->where('zona', $actividad->zona);
        }
        $totalPastoresPadrón = $pastoresQuery->count();

        // Asistencias registradas
        $asistencias = Asistencia::with(['pastor.estado', 'pastor.municipioModel', 'sesion', 'registradoPor'])
            ->where('actividad_id', $actividad->id)
            ->orderBy('fecha_registro', 'desc')
            ->get();

        $pastorIdsPresentes = $asistencias->pluck('pastor_id')->unique()->values();
        $totalPresentes = $pastorIdsPresentes->count();
        $porcentajeAsistencia = $totalPastoresPadrón > 0 ? round(($totalPresentes / $totalPastoresPadrón) * 100, 1) : 0;

        $totalConConyuge = $asistencias->where('asistio_con_conyuge', true)->unique('pastor_id')->count();
        $totalKitsEntregados = $asistencias->where('kit_entregado', true)->unique('pastor_id')->count();
        $totalComidasEntregadas = $asistencias->where('comida_entregada', true)->count();

        // Desglose por Niveles Ministeriales
        $nivelesConvocados = Pastor::where('status', true)
            ->when($actividad->zona, fn ($q) => $q->where('zona', $actividad->zona))
            ->select('nivel_ministerial', DB::raw('count(*) as total'))
            ->groupBy('nivel_ministerial')
            ->pluck('total', 'nivel_ministerial');

        $nivelesPresentes = Pastor::whereIn('id', $pastorIdsPresentes)
            ->select('nivel_ministerial', DB::raw('count(*) as total'))
            ->groupBy('nivel_ministerial')
            ->pluck('total', 'nivel_ministerial');

        // Desglose por Zonas
        $zonasConvocadas = Pastor::where('status', true)
            ->when($actividad->zona, fn ($q) => $q->where('zona', $actividad->zona))
            ->whereNotNull('zona')
            ->select('zona', DB::raw('count(*) as total'))
            ->groupBy('zona')
            ->pluck('total', 'zona');

        $zonasPresentes = Pastor::whereIn('id', $pastorIdsPresentes)
            ->whereNotNull('zona')
            ->select('zona', DB::raw('count(*) as total'))
            ->groupBy('zona')
            ->pluck('total', 'zona');

        // Lista de pastores ausentes (hasta 50 para contactar)
        $pastoresAusentes = Pastor::where('status', true)
            ->when($actividad->zona, fn ($q) => $q->where('zona', $actividad->zona))
            ->whereNotIn('id', $pastorIdsPresentes)
            ->select('id', 'codigo', 'nombres', 'apellidos', 'documento', 'telefono_tlf', 'telefono_hab', 'zona', 'distrito', 'nivel_ministerial', 'foto')
            ->orderBy('nombres')
            ->limit(100)
            ->get();

        return Inertia::render('admin/Actividades/Monitor', [
            'actividad' => $actividad,
            'metricas' => [
                'total_padron' => $totalPastoresPadrón,
                'total_presentes' => $totalPresentes,
                'porcentaje' => $porcentajeAsistencia,
                'con_conyuge' => $totalConConyuge,
                'kits_entregados' => $totalKitsEntregados,
                'comidas_entregadas' => $totalComidasEntregadas,
            ],
            'niveles' => [
                'convocados' => $nivelesConvocados,
                'presentes' => $nivelesPresentes,
            ],
            'zonas' => [
                'convocadas' => $zonasConvocadas,
                'presentes' => $zonasPresentes,
            ],
            'ultimasAsistencias' => $asistencias->take(20)->map(fn ($as) => [
                'id' => $as->id,
                'pastor_id' => $as->pastor_id,
                'nombre_completo' => ($as->pastor?->nombres ?? '') . ' ' . ($as->pastor?->apellidos ?? ''),
                'documento' => $as->pastor?->documento,
                'codigo' => $as->pastor?->codigo,
                'foto' => $as->pastor?->foto,
                'zona' => $as->pastor?->zona,
                'nivel_ministerial' => $as->pastor?->nivel_ministerial,
                'sesion' => $as->sesion?->nombre ?? 'General',
                'metodo' => $as->metodo,
                'fecha_registro' => $as->fecha_registro->format('d/m/Y h:i A'),
                'asistio_con_conyuge' => $as->asistio_con_conyuge,
                'kit_entregado' => $as->kit_entregado,
                'comida_entregada' => $as->comida_entregada,
            ]),
            'ausentes' => $pastoresAusentes,
        ]);
    }
}
