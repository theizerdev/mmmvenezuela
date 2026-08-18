<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use App\Models\Municipio;
use App\Models\Pais;
use App\Models\Parroquia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ParroquiaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Parroquia::with(['municipio.estado.pais']);

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

        // Municipio filter
        if ($request->filled('municipio_id')) {
            $query->where('municipio_id', $request->input('municipio_id'));
        }

        // Estado filter (via municipio relationship)
        if ($request->filled('estado_id')) {
            $query->whereHas('municipio', function ($q) use ($request) {
                $q->where('estado_id', $request->input('estado_id'));
            });
        }

        // Pais filter (via municipio.estado relationship)
        if ($request->filled('pais_id')) {
            $query->whereHas('municipio.estado', function ($q) use ($request) {
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

        $parroquias = $query->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Parroquia::count(),
            'activas' => Parroquia::where('activo', true)->count(),
            'inactivas' => Parroquia::where('activo', false)->count(),
        ];

        $municipios = Municipio::with('estado')
            ->where('activo', true)
            ->select('id', 'estado_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $estados = Estado::with('pais')
            ->where('activo', true)
            ->select('id', 'pais_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $paises = Pais::where('activo', true)
            ->select('id', 'nombre', 'codigo_iso2')
            ->orderBy('nombre', 'asc')
            ->get();

        return Inertia::render('admin/Parroquias/Index', [
            'parroquias' => $parroquias,
            'municipios' => $municipios,
            'estados' => $estados,
            'paises' => $paises,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'municipio_id', 'estado_id', 'pais_id', 'perPage', 'sortBy', 'sortDir']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'municipio_id' => ['required', 'exists:municipios,id'],
            'nombre' => ['required', 'string', 'max:191'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'capital' => ['nullable', 'string', 'max:191'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'activo' => ['boolean'],
        ]);

        Parroquia::create($validated);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Parroquia creada exitosamente.'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Parroquia $parroquia): RedirectResponse
    {
        $validated = $request->validate([
            'municipio_id' => ['required', 'exists:municipios,id'],
            'nombre' => ['required', 'string', 'max:191'],
            'codigo' => ['nullable', 'string', 'max:50'],
            'capital' => ['nullable', 'string', 'max:191'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
            'activo' => ['boolean'],
        ]);

        $parroquia->update($validated);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Parroquia actualizada exitosamente.'),
        ]);
    }

    /**
     * Toggle the status of the specified resource.
     */
    public function toggleStatus(Parroquia $parroquia): RedirectResponse
    {
        $parroquia->update(['activo' => ! $parroquia->activo]);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Estatus de la parroquia actualizado exitosamente.'),
        ]);
    }

    /**
     * Bulk destroy resources.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:parroquias,id'],
        ]);

        Parroquia::whereIn('id', $request->input('ids'))->delete();

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Parroquias eliminadas exitosamente.'),
        ]);
    }
}
