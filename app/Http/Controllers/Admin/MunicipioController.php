<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use App\Models\Municipio;
use App\Models\Pais;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MunicipioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Municipio::with(['estado.pais']);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('capital', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('activo', (bool) $request->input('status'));
        }

        // Estado filter
        if ($request->filled('estado_id')) {
            $query->where('estado_id', $request->input('estado_id'));
        }

        // Pais filter (via estado relationship)
        if ($request->filled('pais_id')) {
            $query->whereHas('estado', function ($q) use ($request) {
                $q->where('pais_id', $request->input('pais_id'));
            });
        }

        // Pagination and Sorting
        $perPage = (int) $request->input('perPage', 10);
        $sortBy = $request->input('sortBy', 'nombre');
        $sortDir = strtolower($request->input('sortDir', 'asc')) === 'desc' ? 'desc' : 'asc';

        $allowedSortColumns = ['nombre', 'codigo', 'capital', 'activo', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('nombre', 'asc');
        }

        $municipios = $query->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Municipio::count(),
            'activos' => Municipio::where('activo', true)->count(),
            'inactivos' => Municipio::where('activo', false)->count(),
        ];

        $estados = Estado::with('pais')
            ->where('activo', true)
            ->select('id', 'pais_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $paises = Pais::where('activo', true)
            ->select('id', 'nombre', 'codigo_iso2')
            ->orderBy('nombre', 'asc')
            ->get();

        return Inertia::render('admin/Municipios/Index', [
            'municipios' => $municipios,
            'estados' => $estados,
            'paises' => $paises,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'estado_id', 'pais_id', 'perPage', 'sortBy', 'sortDir']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'estado_id' => ['required', 'exists:estados,id'],
            'nombre' => ['required', 'string', 'max:191'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'capital' => ['nullable', 'string', 'max:191'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'activo' => ['boolean'],
        ]);

        Municipio::create($validated);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Municipio creado exitosamente.'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Municipio $municipio): RedirectResponse
    {
        $validated = $request->validate([
            'estado_id' => ['required', 'exists:estados,id'],
            'nombre' => ['required', 'string', 'max:191'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'capital' => ['nullable', 'string', 'max:191'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'activo' => ['boolean'],
        ]);

        $municipio->update($validated);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Municipio actualizado exitosamente.'),
        ]);
    }

    /**
     * Toggle the status of the specified resource.
     */
    public function toggleStatus(Municipio $municipio): RedirectResponse
    {
        $municipio->update(['activo' => ! $municipio->activo]);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Estatus del municipio actualizado exitosamente.'),
        ]);
    }

    /**
     * Bulk destroy resources.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:municipios,id'],
        ]);

        Municipio::whereIn('id', $request->input('ids'))->delete();

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Municipios eliminados exitosamente.'),
        ]);
    }
}
