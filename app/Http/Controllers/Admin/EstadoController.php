<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use App\Models\Pais;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EstadoController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $paisId = $request->input('pais_id');
        $perPage = $request->input('perPage', 10);
        $sortBy = $request->input('sortBy');
        $sortDir = $request->input('sortDir', 'asc');

        $query = Estado::with('pais');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                    ->orWhere('codigo', 'like', "%{$search}%")
                    ->orWhere('capital', 'like', "%{$search}%");
            });
        }

        if ($status !== null && $status !== '') {
            $query->where('activo', $status);
        }

        if ($paisId) {
            $query->where('pais_id', $paisId);
        }

        $allowedSortColumns = ['nombre', 'codigo', 'capital', 'activo', 'created_at'];
        if ($sortBy && in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('nombre', 'asc');
        }

        $estados = $query->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Estado::count(),
            'activos' => Estado::where('activo', true)->count(),
            'inactivos' => Estado::where('activo', false)->count(),
        ];

        $paises = Pais::where('activo', true)
            ->select('id', 'nombre', 'codigo_iso2')
            ->orderBy('nombre', 'asc')
            ->get();

        return inertia('admin/Estados/Index', [
            'estados' => $estados,
            'paises' => $paises,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'pais_id', 'perPage', 'sortBy', 'sortDir']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pais_id' => 'required|exists:pais,id',
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:20',
            'capital' => 'nullable|string|max:255',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'activo' => 'boolean',
        ]);

        try {
            Estado::create($validated);

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('State created successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear el estado: '.$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error creating the state. Please try again.'),
            ]);
        }
    }

    public function update(Request $request, Estado $estado)
    {
        $validated = $request->validate([
            'pais_id' => 'required|exists:pais,id',
            'nombre' => 'required|string|max:255',
            'codigo' => 'nullable|string|max:20',
            'capital' => 'nullable|string|max:255',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'activo' => 'boolean',
        ]);

        try {
            DB::transaction(function () use ($estado, $validated) {
                $estado->update($validated);
            });

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('State updated successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error("Error al actualizar el estado {$estado->id}: ".$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error updating the state. Please try again.'),
            ]);
        }
    }

    public function toggleStatus(Estado $estado)
    {
        try {
            $estado->activo = ! $estado->activo;
            $estado->save();

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Status updated successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error("Error al cambiar el estado del estado {$estado->id}: ".$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error updating the status. Please try again.'),
            ]);
        }
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:estados,id',
        ]);

        DB::beginTransaction();

        try {
            Estado::destroy($validated['ids']);

            DB::commit();

            $message = count($validated['ids']) > 1
                ? __('Selected states have been deleted successfully.')
                : __('Selected state has been deleted successfully.');

            return back()->with('notification', [
                'type' => 'success',
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error en la eliminación masiva de estados: '.$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error deleting the states. Please try again.'),
            ]);
        }
    }
}
