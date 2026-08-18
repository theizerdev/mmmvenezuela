<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Iglesia;
use App\Models\Pastor;
use App\Models\Estado;
use App\Models\Municipio;
use App\Models\Parroquia;
use App\Models\TipoLocal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExtensionController extends Controller
{
    /**
     * Listado General de Extensiones / Iglesias
     */
    public function index(Request $request)
    {
        $query = Iglesia::with(['pastor:id,nombres,apellidos,codigo,zona,distrito', 'estado:id,nombre', 'municipio:id,nombre', 'parroquia:id,nombre', 'tipoLocal:id,nombre']);

        // Búsqueda por texto
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'LIKE', "%{$search}%")
                  ->orWhere('direccion', 'LIKE', "%{$search}%")
                  ->orWhere('sector', 'LIKE', "%{$search}%")
                  ->orWhere('zona', 'LIKE', "%{$search}%")
                  ->orWhere('distrito', 'LIKE', "%{$search}%");
            });
        }

        // Filtro por Zona
        if ($zona = $request->input('zona')) {
            $query->where('zona', $zona);
        }

        // Filtro por Estado
        if ($estadoId = $request->input('estado_id')) {
            $query->where('estado_id', $estadoId);
        }

        // Filtro por Estado de Actividad
        if ($request->has('activa') && $request->input('activa') !== '') {
            $query->where('activa', filter_var($request->input('activa'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->input('per_page', 15);
        $extensiones = $query->orderBy('id', 'desc')->paginate($perPage)->withQueryString();

        // Estadísticas generales
        $stats = [
            'total' => Iglesia::count(),
            'activas' => Iglesia::where('activa', true)->count(),
            'miembros_totales' => (int) Iglesia::sum('miembros_activos'),
            'campos_blancos' => (int) Iglesia::sum('cantidad_campos_blancos'),
        ];

        $estados = Estado::select('id', 'nombre')->orderBy('nombre')->get();
        $zonas = Iglesia::select('zona')->whereNotNull('zona')->distinct()->orderBy('zona')->pluck('zona');

        return inertia('admin/Extensiones/Index', [
            'extensiones' => $extensiones,
            'stats' => $stats,
            'filters' => $request->only(['search', 'zona', 'estado_id', 'activa', 'per_page']),
            'estados' => $estados,
            'zonas' => $zonas,
        ]);
    }

    /**
     * Formulario de Nuevo Registro de Extensión
     */
    public function create()
    {
        $pastores = Pastor::select('id', 'nombres', 'apellidos', 'codigo', 'zona', 'distrito')
            ->orderBy('nombres')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nombre_completo' => "{$p->nombres} {$p->apellidos} ({$p->codigo})",
                'zona' => $p->zona,
                'distrito' => $p->distrito,
            ]);

        $estados = Estado::select('id', 'nombre')->orderBy('nombre')->get();
        $municipios = Municipio::select('id', 'estado_id', 'nombre')->where('activo', true)->orderBy('nombre')->get();
        $parroquias = Parroquia::select('id', 'municipio_id', 'nombre')->where('activo', true)->orderBy('nombre')->get();
        $tiposLocal = TipoLocal::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get();

        return inertia('admin/Extensiones/Create', [
            'pastores' => $pastores,
            'estados' => $estados,
            'municipios' => $municipios,
            'parroquias' => $parroquias,
            'tiposLocal' => $tiposLocal,
        ]);
    }

    /**
     * Guardar Extensión / Iglesia
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'pastor_id' => 'nullable|exists:pastores,id',
            'estado_id' => 'nullable|exists:estados,id',
            'municipio_id' => 'nullable|exists:municipios,id',
            'parroquia_id' => 'nullable|exists:parroquias,id',
            'tipo_local_id' => 'nullable|exists:tipo_locales,id',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'zona' => 'nullable|string|max:50',
            'distrito' => 'nullable|string|max:50',
            'fecha_fundacion' => 'nullable|date',
            'anios_activa' => 'nullable|integer|min:0',
            'descripcion' => 'nullable|string',
            'activa' => 'boolean',
            'miembros_activos' => 'nullable|integer|min:0',
            'cantidad_campos_blancos' => 'nullable|integer|min:0',
            'miembro_probante' => 'nullable|integer|min:0',
            'logros_obtenidos' => 'nullable|string',
            'tiempo_trabajo' => 'nullable|string|max:100',
            'sector' => 'nullable|string|max:150',
            'calle' => 'nullable|string|max:150',
            'avenida' => 'nullable|string|max:150',
            'iglesias_fundadas' => 'nullable|integer|min:0',
            'pastores_ministerio' => 'nullable|integer|min:0',
            'posee_medio_comunicacion' => 'boolean',
            'medio_comunicacion' => 'nullable|string',
            'nombre_medio_comunicacion' => 'nullable|string|max:255',
            'donde_medio_comunicacion' => 'nullable|string|max:255',
            'medios_lista' => 'nullable|array',
        ]);

        if (!empty($validated['medios_lista']) && $validated['posee_medio_comunicacion']) {
            $medios = array_filter($validated['medios_lista'], fn($m) => !empty($m['cual']) || !empty($m['donde']));
            $validated['medio_comunicacion'] = json_encode(array_values($medios));
            if (count($medios) > 0) {
                $first = reset($medios);
                $validated['nombre_medio_comunicacion'] = $first['cual'] ?? '';
                $validated['donde_medio_comunicacion'] = $first['donde'] ?? '';
            }
        } else if (!$validated['posee_medio_comunicacion']) {
            $validated['medio_comunicacion'] = null;
            $validated['nombre_medio_comunicacion'] = null;
            $validated['donde_medio_comunicacion'] = null;
        }

        unset($validated['medios_lista']);

        $validated['usuario_registro_id'] = Auth::id();
        $validated['empresa_id'] = Auth::user()?->empresa_id ?: 1;

        $iglesia = Iglesia::create($validated);
        $this->syncPastorConyuge($iglesia, $validated['pastor_id'] ?? null);

        return redirect()->route('admin.extensiones.index')->with('notification', [
            'type' => 'success',
            'message' => __('Extensión registrada exitosamente y asociada al pastor y su cónyuge.'),
        ]);
    }

    /**
     * Editar Extensión
     */
    public function edit($id)
    {
        $extension = Iglesia::findOrFail($id);

        // Formatear medios_lista si existe en JSON
        $mediosLista = [];
        if ($extension->medio_comunicacion) {
            $decoded = json_decode($extension->medio_comunicacion, true);
            if (is_array($decoded)) {
                $mediosLista = $decoded;
            } else if ($extension->posee_medio_comunicacion) {
                $mediosLista[] = [
                    'cual' => $extension->nombre_medio_comunicacion ?: $extension->medio_comunicacion,
                    'donde' => $extension->donde_medio_comunicacion ?: '',
                    'nota' => $extension->medio_comunicacion ?: ''
                ];
            }
        }
        $extension->medios_lista = $mediosLista;

        $pastores = Pastor::select('id', 'nombres', 'apellidos', 'codigo', 'zona', 'distrito')
            ->orderBy('nombres')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'nombre_completo' => "{$p->nombres} {$p->apellidos} ({$p->codigo})",
                'zona' => $p->zona,
                'distrito' => $p->distrito,
            ]);

        $estados = Estado::select('id', 'nombre')->orderBy('nombre')->get();
        $municipios = Municipio::select('id', 'estado_id', 'nombre')->where('activo', true)->orderBy('nombre')->get();
        $parroquias = Parroquia::select('id', 'municipio_id', 'nombre')->where('activo', true)->orderBy('nombre')->get();
        $tiposLocal = TipoLocal::select('id', 'nombre')->where('activo', true)->orderBy('nombre')->get();

        return inertia('admin/Extensiones/Edit', [
            'extension' => $extension,
            'pastores' => $pastores,
            'estados' => $estados,
            'municipios' => $municipios,
            'parroquias' => $parroquias,
            'tiposLocal' => $tiposLocal,
        ]);
    }

    /**
     * Actualizar Extensión
     */
    public function update(Request $request, $id)
    {
        $extension = Iglesia::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'pastor_id' => 'nullable|exists:pastores,id',
            'estado_id' => 'nullable|exists:estados,id',
            'municipio_id' => 'nullable|exists:municipios,id',
            'parroquia_id' => 'nullable|exists:parroquias,id',
            'tipo_local_id' => 'nullable|exists:tipo_locales,id',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
            'zona' => 'nullable|string|max:50',
            'distrito' => 'nullable|string|max:50',
            'fecha_fundacion' => 'nullable|date',
            'anios_activa' => 'nullable|integer|min:0',
            'descripcion' => 'nullable|string',
            'activa' => 'boolean',
            'miembros_activos' => 'nullable|integer|min:0',
            'cantidad_campos_blancos' => 'nullable|integer|min:0',
            'miembro_probante' => 'nullable|integer|min:0',
            'logros_obtenidos' => 'nullable|string',
            'tiempo_trabajo' => 'nullable|string|max:100',
            'sector' => 'nullable|string|max:150',
            'calle' => 'nullable|string|max:150',
            'avenida' => 'nullable|string|max:150',
            'iglesias_fundadas' => 'nullable|integer|min:0',
            'pastores_ministerio' => 'nullable|integer|min:0',
            'posee_medio_comunicacion' => 'boolean',
            'medio_comunicacion' => 'nullable|string',
            'nombre_medio_comunicacion' => 'nullable|string|max:255',
            'donde_medio_comunicacion' => 'nullable|string|max:255',
            'medios_lista' => 'nullable|array',
        ]);

        if (!empty($validated['medios_lista']) && $validated['posee_medio_comunicacion']) {
            $medios = array_filter($validated['medios_lista'], fn($m) => !empty($m['cual']) || !empty($m['donde']));
            $validated['medio_comunicacion'] = json_encode(array_values($medios));
            if (count($medios) > 0) {
                $first = reset($medios);
                $validated['nombre_medio_comunicacion'] = $first['cual'] ?? '';
                $validated['donde_medio_comunicacion'] = $first['donde'] ?? '';
            }
        } else if (!$validated['posee_medio_comunicacion']) {
            $validated['medio_comunicacion'] = null;
            $validated['nombre_medio_comunicacion'] = null;
            $validated['donde_medio_comunicacion'] = null;
        }

        unset($validated['medios_lista']);

        $extension->update($validated);
        $this->syncPastorConyuge($extension, $validated['pastor_id'] ?? null);

        return redirect()->route('admin.extensiones.index')->with('notification', [
            'type' => 'success',
            'message' => __('Extensión actualizada exitosamente.'),
        ]);
    }

    /**
     * Sincronizar el pastor y su cónyuge en la tabla pivot iglesia_pastor
     */
    protected function syncPastorConyuge(Iglesia $iglesia, ?int $pastorId): void
    {
        if (!$pastorId) {
            $iglesia->pastores()->detach();
            return;
        }

        $pastor = Pastor::find($pastorId);
        if (!$pastor) {
            $iglesia->pastores()->detach();
            return;
        }

        $idsToSync = [$pastor->id];

        // 1. Si el pastor tiene cónyuge registrado en la BD (conyuge_id)
        if ($pastor->conyuge_id) {
            $idsToSync[] = (int) $pastor->conyuge_id;
        }

        // 2. Si otro pastor tiene a este pastor como su conyuge_id
        $conyugesDirectos = Pastor::where('conyuge_id', $pastor->id)->pluck('id')->toArray();
        $idsToSync = array_unique(array_merge($idsToSync, $conyugesDirectos));

        // 3. Sincronizar la relación M a M en la tabla pivot iglesia_pastor
        $iglesia->pastores()->sync($idsToSync);
    }

    /**
     * Eliminar Extensión
     */
    public function destroy(Request $request, $id)
    {
        $ids = $request->input('ids', [$id]);
        Iglesia::whereIn('id', $ids)->delete();

        return redirect()->route('admin.extensiones.index')->with('notification', [
            'type' => 'success',
            'message' => __('Extensión(es) eliminada(s) exitosamente.'),
        ]);
    }
}
