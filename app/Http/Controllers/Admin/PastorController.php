<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use App\Models\Municipio;
use App\Models\Parroquia;
use App\Models\Pastor;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PastorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = Pastor::with(['conyuge', 'estado', 'municipioModel', 'parroquia']);

        // Búsqueda multicriterio
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('codigo', 'like', "%{$search}%")
                    ->orWhere('nombres', 'like', "%{$search}%")
                    ->orWhere('apellidos', 'like', "%{$search}%")
                    ->orWhere('documento', 'like', "%{$search}%")
                    ->orWhere('zona', 'like', "%{$search}%")
                    ->orWhere('distrito', 'like', "%{$search}%");
            });
        }

        // Filtro por Nivel Ministerial
        if ($request->filled('nivel_ministerial')) {
            $query->where('nivel_ministerial', $request->input('nivel_ministerial'));
        }

        // Filtro por Estatus
        if ($request->filled('status')) {
            $query->where('status', (bool) $request->input('status'));
        }

        // Filtro por Zona
        if ($request->filled('zona')) {
            $query->where('zona', 'like', "%{$request->input('zona')}%");
        }

        // Filtro por Distrito
        if ($request->filled('distrito')) {
            $query->where('distrito', 'like', "%{$request->input('distrito')}%");
        }

        // Ordenamiento
        $perPage = (int) $request->input('perPage', 10);
        $sortBy = $request->input('sortBy', 'created_at');
        $sortDir = strtolower($request->input('sortDir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSortColumns = ['codigo', 'nombres', 'apellidos', 'documento', 'nivel_ministerial', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSortColumns)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $pastores = $query->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Pastor::count(),
            'activos' => Pastor::where('status', true)->count(),
            'inactivos' => Pastor::where('status', false)->count(),
            'ordenados' => Pastor::where('nivel_ministerial', 'Ministro Ordenado')->count(),
        ];

        return Inertia::render('admin/Pastores/Index', [
            'pastores' => $pastores,
            'stats' => $stats,
            'filters' => $request->only(['search', 'nivel_ministerial', 'status', 'zona', 'distrito', 'perPage', 'sortBy', 'sortDir']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $pastoresDisponibles = Pastor::where('status', true)
            ->select('id', 'nombres', 'apellidos', 'codigo', 'documento', 'genero')
            ->orderBy('nombres', 'asc')
            ->get();

        $estados = Estado::where('activo', true)
            ->select('id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $municipios = Municipio::where('activo', true)
            ->select('id', 'estado_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $parroquias = Parroquia::where('activo', true)
            ->select('id', 'municipio_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        return Inertia::render('admin/Pastores/Create', [
            'pastoresDisponibles' => $pastoresDisponibles,
            'estados' => $estados,
            'municipios' => $municipios,
            'parroquias' => $parroquias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        if (empty($request->input('codigo')) && ! empty($request->input('documento'))) {
            $request->merge([
                'codigo' => Pastor::generateCodigo($request->input('documento')),
            ]);
        }

        $validated = $request->validate([
            'codigo' => ['required', 'numeric', 'digits:8', 'unique:pastores,codigo'],
            'nombres' => ['required', 'string', 'max:191'],
            'apellidos' => ['required', 'string', 'max:191'],
            'documento' => ['required', 'string', 'max:50', 'unique:pastores,documento'],
            'genero' => ['nullable', 'string', 'in:M,F'],
            'edad' => ['nullable', 'integer', 'min:0', 'max:120'],
            'fe_nacimiento' => ['nullable', 'date'],
            'foto' => ['nullable', 'string'],
            'estado_civil' => ['nullable', 'string', 'max:100'],
            'nombre_conyuge' => ['nullable', 'string', 'max:191'],
            'conyuge_id' => ['nullable', 'exists:pastores,id'],

            // Eclesiásticos
            'nivel_ministerial' => ['required', 'in:Colaborador,Laico,Licenciado,Ministro Ordenado'],
            'zona' => ['nullable', 'string', 'max:191'],
            'distrito' => ['nullable', 'string', 'max:191'],
            'ano_promocion' => ['nullable', 'string', 'max:50'],
            'tiempo_colaborando' => ['nullable', 'string', 'max:100'],
            'batizado_espiritu_santo' => ['boolean'],
            'pertenece_ministerio' => ['boolean'],
            'cargo_nacional' => ['nullable', 'string', 'max:191'],
            'mencion' => ['nullable', 'string'],
            'nota' => ['nullable', 'string'],

            // Académicos
            'grado_instruccion' => ['nullable', 'string', 'max:191'],
            'titulo_obtenido' => ['nullable', 'string', 'max:191'],
            'estudio_teologico' => ['boolean'],
            'titulo_teologico' => ['nullable', 'string', 'max:191'],
            'tiempo_de_estudio_teologico' => ['nullable', 'string', 'max:100'],
            'instituto_teologico' => ['nullable', 'string', 'max:191'],

            // Ubicación y Contacto
            'edificio_casa_quinta' => ['nullable', 'string', 'max:191'],
            'piso' => ['nullable', 'string', 'max:50'],
            'apartamento' => ['nullable', 'string', 'max:50'],
            'calle_avenida' => ['nullable', 'string', 'max:191'],
            'urbanizacion' => ['nullable', 'string', 'max:191'],
            'estado_id' => ['nullable', 'exists:estados,id'],
            'municipio_id' => ['nullable', 'exists:municipios,id'],
            'parroquia_id' => ['nullable', 'exists:parroquias,id'],
            'municipio' => ['nullable', 'string', 'max:191'],
            'telefono_hab' => ['nullable', 'string', 'max:50'],
            'telefono_tlf' => ['nullable', 'string', 'max:50'],
            'telefono_otro' => ['nullable', 'string', 'max:50'],
            'status' => ['boolean'],

            // Estado de Salud
            'grupo_sanguineo' => ['nullable', 'string', 'max:10'],
            'condicion_salud' => ['nullable', 'string', 'max:50'],
            'padece_enfermedad' => ['boolean'],
            'enfermedades_cronicas' => ['nullable', 'string'],
            'toma_medicamentos' => ['boolean'],
            'medicamentos_recetados' => ['nullable'],
            'alergias' => ['nullable', 'string', 'max:191'],
            'contacto_emergencia_nombre' => ['nullable', 'string', 'max:191'],
            'contacto_emergencia_telefono' => ['nullable', 'string', 'max:50'],
            'observaciones_salud' => ['nullable', 'string'],
        ]);

        if (! empty($validated['fe_nacimiento'])) {
            $validated['edad'] = Carbon::parse($validated['fe_nacimiento'])->age;
        }

        // Procesar foto si es un string base64 proveniente de la cámara web o drag & drop
        if (! empty($validated['foto']) && str_starts_with($validated['foto'], 'data:image/')) {
            $imageData = $validated['foto'];
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $type = strtolower($type[1]);
                if (! in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                    $type = 'png';
                }
                $imageData = base64_decode($imageData);

                if ($imageData !== false) {
                    $filename = 'pastor_' . preg_replace('/\D/', '', $validated['codigo']) . '_' . time() . '.' . $type;
                    $destinationPath = public_path('pastores');
                    if (! file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    file_put_contents($destinationPath . '/' . $filename, $imageData);
                    $validated['foto'] = $filename;
                }
            }
        }

        $pastor = Pastor::create($validated);

        // Sincronizar cónyuge recíproco si fue seleccionado
        if (! empty($validated['conyuge_id'])) {
            Pastor::where('id', $validated['conyuge_id'])
                ->update(['conyuge_id' => $pastor->id]);
        }

        return redirect()->route('admin.pastores.index')->with('notification', [
            'type' => 'success',
            'message' => __('Pastor registrado exitosamente.'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Pastor $pastore): Response
    {
        $pastore->load(['conyuge', 'estado', 'municipioModel', 'parroquia']);

        $pastoresDisponibles = Pastor::where('status', true)
            ->where('id', '!=', $pastore->id)
            ->select('id', 'nombres', 'apellidos', 'codigo', 'documento', 'genero')
            ->orderBy('nombres', 'asc')
            ->get();

        $estados = Estado::where('activo', true)
            ->select('id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $municipios = Municipio::where('activo', true)
            ->select('id', 'estado_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        $parroquias = Parroquia::where('activo', true)
            ->select('id', 'municipio_id', 'nombre', 'codigo')
            ->orderBy('nombre', 'asc')
            ->get();

        return Inertia::render('admin/Pastores/Edit', [
            'pastor' => $pastore,
            'pastoresDisponibles' => $pastoresDisponibles,
            'estados' => $estados,
            'municipios' => $municipios,
            'parroquias' => $parroquias,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pastor $pastore): RedirectResponse
    {
        if (empty($request->input('codigo')) && ! empty($request->input('documento'))) {
            $request->merge([
                'codigo' => Pastor::generateCodigo($request->input('documento'), $pastore->id),
            ]);
        }

        $validated = $request->validate([
            'codigo' => ['required', 'numeric', 'digits:8', 'unique:pastores,codigo,'.$pastore->id],
            'nombres' => ['required', 'string', 'max:191'],
            'apellidos' => ['required', 'string', 'max:191'],
            'documento' => ['required', 'string', 'max:50', 'unique:pastores,documento,'.$pastore->id],
            'genero' => ['nullable', 'string', 'in:M,F'],
            'edad' => ['nullable', 'integer', 'min:0', 'max:120'],
            'fe_nacimiento' => ['nullable', 'date'],
            'foto' => ['nullable', 'string'],
            'estado_civil' => ['nullable', 'string', 'max:100'],
            'nombre_conyuge' => ['nullable', 'string', 'max:191'],
            'conyuge_id' => ['nullable', 'exists:pastores,id'],

            // Eclesiásticos
            'nivel_ministerial' => ['required', 'in:Colaborador,Laico,Licenciado,Ministro Ordenado'],
            'zona' => ['nullable', 'string', 'max:191'],
            'distrito' => ['nullable', 'string', 'max:191'],
            'ano_promocion' => ['nullable', 'string', 'max:50'],
            'tiempo_colaborando' => ['nullable', 'string', 'max:100'],
            'batizado_espiritu_santo' => ['boolean'],
            'pertenece_ministerio' => ['boolean'],
            'cargo_nacional' => ['nullable', 'string', 'max:191'],
            'mencion' => ['nullable', 'string'],
            'nota' => ['nullable', 'string'],

            // Académicos
            'grado_instruccion' => ['nullable', 'string', 'max:191'],
            'titulo_obtenido' => ['nullable', 'string', 'max:191'],
            'estudio_teologico' => ['boolean'],
            'titulo_teologico' => ['nullable', 'string', 'max:191'],
            'tiempo_de_estudio_teologico' => ['nullable', 'string', 'max:100'],
            'instituto_teologico' => ['nullable', 'string', 'max:191'],

            // Ubicación y Contacto
            'edificio_casa_quinta' => ['nullable', 'string', 'max:191'],
            'piso' => ['nullable', 'string', 'max:50'],
            'apartamento' => ['nullable', 'string', 'max:50'],
            'calle_avenida' => ['nullable', 'string', 'max:191'],
            'urbanizacion' => ['nullable', 'string', 'max:191'],
            'estado_id' => ['nullable', 'exists:estados,id'],
            'municipio_id' => ['nullable', 'exists:municipios,id'],
            'parroquia_id' => ['nullable', 'exists:parroquias,id'],
            'municipio' => ['nullable', 'string', 'max:191'],
            'telefono_hab' => ['nullable', 'string', 'max:50'],
            'telefono_tlf' => ['nullable', 'string', 'max:50'],
            'telefono_otro' => ['nullable', 'string', 'max:50'],
            'status' => ['boolean'],

            // Estado de Salud
            'grupo_sanguineo' => ['nullable', 'string', 'max:10'],
            'condicion_salud' => ['nullable', 'string', 'max:50'],
            'padece_enfermedad' => ['boolean'],
            'enfermedades_cronicas' => ['nullable', 'string'],
            'toma_medicamentos' => ['boolean'],
            'medicamentos_recetados' => ['nullable'],
            'alergias' => ['nullable', 'string', 'max:191'],
            'contacto_emergencia_nombre' => ['nullable', 'string', 'max:191'],
            'contacto_emergencia_telefono' => ['nullable', 'string', 'max:50'],
            'observaciones_salud' => ['nullable', 'string'],
        ]);

        if (! empty($validated['fe_nacimiento'])) {
            $validated['edad'] = Carbon::parse($validated['fe_nacimiento'])->age;
        }

        // Procesar foto si es un string base64 proveniente de la cámara web o drag & drop
        if (! empty($validated['foto']) && str_starts_with($validated['foto'], 'data:image/')) {
            $imageData = $validated['foto'];
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $type = strtolower($type[1]);
                if (! in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                    $type = 'png';
                }
                $imageData = base64_decode($imageData);

                if ($imageData !== false) {
                    $filename = 'pastor_' . preg_replace('/\D/', '', $validated['codigo']) . '_' . time() . '.' . $type;
                    $destinationPath = public_path('pastores');
                    if (! file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    file_put_contents($destinationPath . '/' . $filename, $imageData);
                    $validated['foto'] = $filename;
                }
            }
        }

        $prevConyugeId = $pastore->conyuge_id;

        $pastore->update($validated);

        // Si cambió el cónyuge, desvincular el anterior y vincular el nuevo
        if ($prevConyugeId && $prevConyugeId != $validated['conyuge_id']) {
            Pastor::where('id', $prevConyugeId)->update(['conyuge_id' => null]);
        }

        if (! empty($validated['conyuge_id'])) {
            Pastor::where('id', $validated['conyuge_id'])
                ->update(['conyuge_id' => $pastore->id]);
        }

        return redirect()->route('admin.pastores.index')->with('notification', [
            'type' => 'success',
            'message' => __('Pastor actualizado exitosamente.'),
        ]);
    }

    /**
     * Toggle status.
     */
    public function toggleStatus(Pastor $pastore): RedirectResponse
    {
        $pastore->update(['status' => ! $pastore->status]);

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Estatus del pastor actualizado exitosamente.'),
        ]);
    }

    /**
     * Bulk destroy resources.
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:pastores,id'],
        ]);

        Pastor::whereIn('id', $request->input('ids'))->delete();

        return redirect()->back()->with('notification', [
            'type' => 'success',
            'message' => __('Pastores eliminados exitosamente.'),
        ]);
    }
}
