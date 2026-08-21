<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use App\Models\Iglesia;
use App\Models\Pastor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PastorRegistroPublicoController extends Controller
{
    /**
     * Muestra el formulario público de registro de pastores.
     */
    public function index(): Response
    {
        $estados = Estado::select('id', 'nombre')
            ->where('activo', true)
            ->orderBy('nombre')
            ->get();

        $gradosMinisteriales = [
            'Colaborador',
            'Laico',
            'Licenciado',
            'Ministro Ordenado',
        ];

        $estadosCiviles = [
            'Soltero(a)',
            'Casado(a)',
            'Viudo(a)',
            'Divorciado(a)',
        ];

        return Inertia::render('Public/RegistroPastor', [
            'estados' => $estados,
            'gradosMinisteriales' => $gradosMinisteriales,
            'estadosCiviles' => $estadosCiviles,
        ]);
    }

    /**
     * Procesa y guarda la solicitud de registro público del pastor y su extensión.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'documento' => ['required', 'string', 'max:30', 'unique:pastores,documento'],
            'fe_nacimiento' => ['required', 'date'],
            'estado_civil' => ['required', 'string', 'max:50'],
            'telefono_tlf' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],

            'nivel_ministerial' => ['required', 'string', 'in:Colaborador,Laico,Licenciado,Ministro Ordenado'],
            'ano_promocion' => ['nullable', 'string', 'max:20'],

            'nombre_extension' => ['required', 'string', 'max:255'],
            'direccion_extension' => ['required', 'string'],
            'estado_id' => ['required', 'exists:estados,id'],
            'zona' => ['nullable', 'string', 'max:50'],
            'distrito' => ['nullable', 'string', 'max:50'],

            'foto_cedula' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'foto' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ], [
            'documento.unique' => 'Esta cédula de identidad ya se encuentra registrada en el sistema.',
            'foto_cedula.required' => 'La fotografía de la cédula de identidad es obligatoria para validar los datos.',
            'foto.required' => 'La fotografía de perfil (tipo carnet) es obligatoria.',
            'foto_cedula.max' => 'La imagen de la cédula no debe pesar más de 5MB.',
            'foto.max' => 'La imagen de perfil no debe pesar más de 5MB.',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            // Guardar imagen de la Cédula
            $fotoCedulaPath = null;
            if ($request->hasFile('foto_cedula')) {
                $fotoCedulaPath = $request->file('foto_cedula')->store('pastores_cedulas', 'public');
            }

            // Guardar Foto tipo Carnet / Perfil
            $fotoPerfilPath = null;
            if ($request->hasFile('foto')) {
                $fotoPerfilPath = $request->file('foto')->store('pastores', 'public');
            }

            // Generar Código Único de Pastor
            $codigo = Pastor::generateCodigo(
                $validated['documento'],
                $validated['zona'] ?? null,
                $validated['distrito'] ?? null
            );

            // Crear registro de Pastor
            $pastor = Pastor::create([
                'codigo' => $codigo,
                'nombres' => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
                'documento' => $validated['documento'],
                'fe_nacimiento' => $validated['fe_nacimiento'],
                'estado_civil' => $validated['estado_civil'],
                'telefono_tlf' => $validated['telefono_tlf'],
                'email' => $validated['email'] ?? null,
                'nivel_ministerial' => $validated['nivel_ministerial'],
                'ano_promocion' => $validated['ano_promocion'] ?? null,
                'zona' => $validated['zona'] ?? null,
                'distrito' => $validated['distrito'] ?? null,
                'estado_id' => $validated['estado_id'],
                'foto_cedula' => $fotoCedulaPath,
                'foto' => $fotoPerfilPath,
                'status' => true,
            ]);

            // Crear registro de Extensión / Iglesia
            $iglesia = Iglesia::create([
                'nombre' => $validated['nombre_extension'],
                'direccion' => $validated['direccion_extension'],
                'estado_id' => $validated['estado_id'],
                'zona' => $validated['zona'] ?? null,
                'distrito' => $validated['distrito'] ?? null,
                'pastor_id' => $pastor->id,
                'activa' => true,
            ]);

            // Asociar Pastor e Iglesia en la tabla pivote
            $pastor->iglesias()->attach($iglesia->id);

            return back()->with('success', [
                'codigo' => $pastor->codigo,
                'nombre' => $pastor->nombre_completo,
                'mensaje' => '¡Registro completado exitosamente! Los datos han sido recibidos para su validación.',
            ]);
        });
    }
}
