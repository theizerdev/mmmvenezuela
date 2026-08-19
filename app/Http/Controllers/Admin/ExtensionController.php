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
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ExtensionController extends Controller
{
    /**
     * Dashboard de Extensiones / Iglesias
     */
    public function dashboard(Request $request)
    {
        $range = $request->query('range', '3m'); // 7d, 1m, 3m, 1y, all

        // 1. KPI Stats
        $totalExtensiones = Iglesia::count();
        $extensionesActivas = Iglesia::where('activa', true)->count();
        $extensionesInactivas = $totalExtensiones - $extensionesActivas;
        $totalMiembros = (int) Iglesia::sum('miembros_activos');
        $totalCamposBlancos = (int) Iglesia::sum('cantidad_campos_blancos');
        $totalFundadas = (int) Iglesia::sum('iglesias_fundadas');
        $totalMedios = Iglesia::where('posee_medio_comunicacion', true)->count();

        // 2. ApexCharts Time Series Registros por rango
        $categories = [];
        $seriesData = [];

        if ($range === '7d') {
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dateStr = $date->format('Y-m-d');
                $label = $date->format('d/m');
                $count = Iglesia::whereDate('created_at', $dateStr)->count();
                $categories[] = $label;
                $seriesData[] = $count;
            }
        } elseif ($range === '1m') {
            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $dateStr = $date->format('Y-m-d');
                $label = $date->format('d/m');
                $count = Iglesia::whereDate('created_at', $dateStr)->count();
                $categories[] = $label;
                $seriesData[] = $count;
            }
        } elseif ($range === '3m') {
            for ($i = 11; $i >= 0; $i--) {
                $startOfWeek = now()->subWeeks($i)->startOfWeek();
                $endOfWeek = now()->subWeeks($i)->endOfWeek();
                $label = 'Sem ' . $startOfWeek->format('d/m');
                $count = Iglesia::whereBetween('created_at', [$startOfWeek, $endOfWeek])->count();
                $categories[] = $label;
                $seriesData[] = $count;
            }
        } elseif ($range === '1y') {
            for ($i = 11; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $label = mb_convert_case($month->translatedFormat('M Y'), MB_CASE_TITLE);
                $count = Iglesia::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count();
                $categories[] = $label;
                $seriesData[] = $count;
            }
        } else {
            $firstRecord = Iglesia::min('created_at');
            $startDate = $firstRecord ? \Carbon\Carbon::parse($firstRecord)->startOfMonth() : now()->subYear()->startOfMonth();
            $currentMonth = $startDate->copy();
            while ($currentMonth <= now()->endOfMonth()) {
                $label = mb_convert_case($currentMonth->translatedFormat('M Y'), MB_CASE_TITLE);
                $count = Iglesia::whereYear('created_at', $currentMonth->year)
                    ->whereMonth('created_at', $currentMonth->month)
                    ->count();
                $categories[] = $label;
                $seriesData[] = $count;
                $currentMonth->addMonth();
            }
        }

        $registrosChart = [
            'categories' => $categories,
            'series' => $seriesData,
        ];

        // 3. ApexCharts Donut por Tipo de Local
        $donutData = Iglesia::leftJoin('tipo_locales', 'iglesias.tipo_local_id', '=', 'tipo_locales.id')
            ->selectRaw("COALESCE(tipo_locales.nombre, 'No asignado') as label, COUNT(iglesias.id) as value")
            ->groupBy('label')
            ->get();

        // 4. Extensiones Recientes (Timeline)
        $extensionesRecientes = Iglesia::with(['pastor', 'estado', 'municipio', 'tipoLocal'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'nombre' => $e->nombre,
                'created_at' => $e->created_at ? $e->created_at->format('d/m/Y h:i A') : '',
                'fecha_humana' => $e->created_at ? $e->created_at->diffForHumans() : '',
                'pastor_nombre' => $e->pastor ? "{$e->pastor->nombres} {$e->pastor->apellidos}" : 'Sin pastor',
                'estado_nombre' => $e->estado?->nombre ?: 'Sin estado',
                'municipio_nombre' => $e->municipio?->nombre ?: '',
                'tipo_local' => $e->tipoLocal?->nombre ?: 'N/A',
                'activa' => (bool) $e->activa,
            ]);

        // 5. Datos para Mapa de Venezuela y Marcadores
        $extensionesPorEstado = Iglesia::leftJoin('estados', 'iglesias.estado_id', '=', 'estados.id')
            ->selectRaw("estados.id as estado_id, COALESCE(estados.nombre, 'Sin Estado') as estado_nombre, COUNT(iglesias.id) as cantidad")
            ->groupBy('estados.id', 'estados.nombre')
            ->get();

        $pinesMapa = Iglesia::with(['pastor', 'estado', 'municipio', 'tipoLocal'])
            ->select('id', 'nombre', 'pastor_id', 'estado_id', 'municipio_id', 'tipo_local_id', 'latitud', 'longitud', 'activa', 'miembros_activos', 'direccion')
            ->get()
            ->map(fn($e) => [
                'id' => $e->id,
                'nombre' => $e->nombre,
                'pastor' => $e->pastor ? "{$e->pastor->nombres} {$e->pastor->apellidos}" : 'Sin pastor',
                'estado_id' => $e->estado_id,
                'estado_nombre' => $e->estado?->nombre ?: '',
                'municipio_nombre' => $e->municipio?->nombre ?: '',
                'ubicacion' => implode(', ', array_filter([$e->municipio?->nombre, $e->estado?->nombre])),
                'tipo_local' => $e->tipoLocal?->nombre ?: 'N/A',
                'lat' => $e->latitud ? (float) $e->latitud : null,
                'lng' => $e->longitud ? (float) $e->longitud : null,
                'activa' => (bool) $e->activa,
                'miembros' => (int) $e->miembros_activos,
                'direccion' => $e->direccion ?: '',
            ]);

        return inertia('admin/Extensiones/Dashboard', [
            'range' => $range,
            'stats' => [
                'total_extensiones' => $totalExtensiones,
                'extensiones_activas' => $extensionesActivas,
                'extensiones_inactivas' => $extensionesInactivas,
                'total_miembros' => $totalMiembros,
                'total_campos_blancos' => $totalCamposBlancos,
                'total_fundadas' => $totalFundadas,
                'total_medios' => $totalMedios,
            ],
            'registrosChart' => $registrosChart,
            'donutData' => $donutData,
            'extensionesRecientes' => $extensionesRecientes,
            'extensionesPorEstado' => $extensionesPorEstado,
            'pinesMapa' => $pinesMapa,
        ]);
    }

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

    /**
     * Verificar contraseña o autenticación de seguridad del usuario logueado
     */
    public function verifySecurity(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = Auth::user();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => __('La contraseña ingresada es incorrecta.'),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => __('Verificación de seguridad exitosa.'),
        ]);
    }

    /**
     * Adjuntar documento a una extensión
     */
    public function uploadDocumento(Request $request, $id)
    {
        $request->validate([
            'documento' => 'required|file|mimes:pdf,png,jpg,jpeg,webp|max:10240', // max 10MB
        ]);

        $extension = Iglesia::findOrFail($id);

        if ($request->hasFile('documento')) {
            $file = $request->file('documento');

            // Eliminar documento anterior si existía
            if ($extension->documento_path && Storage::disk('public')->exists($extension->documento_path)) {
                Storage::disk('public')->delete($extension->documento_path);
            }

            $originalName = $file->getClientOriginalName();
            $mimeType = $file->getMimeType();
            $fileSize = $file->getSize();

            $path = $file->store("extensiones/documentos/{$extension->id}", 'public');

            $extension->update([
                'documento_path' => $path,
                'documento_nombre' => $originalName,
                'documento_size' => $fileSize,
                'documento_mime' => $mimeType,
                'documento_updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => __('Documento adjuntado exitosamente.'),
                'documento_url' => Storage::url($path),
                'documento_nombre' => $originalName,
                'documento_size' => $fileSize,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __('No se pudo procesar el archivo.'),
        ], 400);
    }

    /**
     * Eliminar documento adjunto de una extensión
     */
    public function deleteDocumento($id)
    {
        $extension = Iglesia::findOrFail($id);

        if ($extension->documento_path && Storage::disk('public')->exists($extension->documento_path)) {
            Storage::disk('public')->delete($extension->documento_path);
        }

        $extension->update([
            'documento_path' => null,
            'documento_nombre' => null,
            'documento_size' => null,
            'documento_mime' => null,
            'documento_updated_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => __('Documento eliminado exitosamente.'),
        ]);
    }
}
