<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use App\Models\Iglesia;
use App\Models\Pastor;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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

        $generos = [
            'Masculino',
            'Femenino',
        ];

        return Inertia::render('Public/RegistroPastor', [
            'estados' => $estados,
            'gradosMinisteriales' => $gradosMinisteriales,
            'estadosCiviles' => $estadosCiviles,
            'generos' => $generos,
        ]);
    }

    /**
     * Verifica en tiempo real si una cédula ya está registrada.
     * Determina si se trata de una cédula bloqueante o si es un registro previo de cónyuge completable.
     * Retorna también los datos de la extensión previamente cargada por el cónyuge.
     */
    public function verificarCedula(string $cedula)
    {
        $cleaned = trim($cedula);
        if (empty($cleaned)) {
            return response()->json(['existe' => false]);
        }

        $numeric = preg_replace('/[^\d]/', '', $cleaned);
        $pastor = Pastor::with(['conyuge', 'iglesias'])
            ->where('documento', $cleaned)
            ->orWhere('documento', 'LIKE', "%{$numeric}%")
            ->first();

        if (!$pastor) {
            return response()->json(['existe' => false]);
        }

        // Si fue creado automáticamente como cónyuge o aún no tiene fotos completas de perfil/cédula
        $esConyugeVinculado = false;
        if ($pastor->conyuge_id !== null || empty($pastor->foto) || empty($pastor->foto_cedula)) {
            $esConyugeVinculado = true;
        }

        $nombreConyuge = $pastor->nombre_conyuge;
        if (empty($nombreConyuge) && $pastor->conyuge) {
            $nombreConyuge = $pastor->conyuge->nombre_completo;
        }

        // Buscar la extensión cargada por el pastor o por su cónyuge
        $extension = null;
        $iglesia = $pastor->iglesias->first();
        if (!$iglesia && $pastor->conyuge) {
            $iglesia = $pastor->conyuge->iglesias->first();
        }

        if ($iglesia) {
            $extension = [
                'nombre' => $iglesia->nombre,
                'direccion' => $iglesia->direccion,
                'estado_id' => $iglesia->estado_id,
                'zona' => $iglesia->zona,
                'distrito' => $iglesia->distrito,
            ];
        }

        return response()->json([
            'existe' => true,
            'es_conyuge_vinculado' => $esConyugeVinculado,
            'nombre' => $pastor->nombre_completo,
            'nombres' => $pastor->nombres,
            'apellidos' => $pastor->apellidos,
            'genero' => $pastor->genero ?: 'Masculino',
            'fe_nacimiento' => $pastor->fe_nacimiento ? $pastor->fe_nacimiento->format('Y-m-d') : null,
            'edad' => $pastor->edad,
            'codigo' => $pastor->codigo,
            'estado_civil' => $pastor->estado_civil ?: 'Casado(a)',
            'nombre_conyuge' => $nombreConyuge,
            'conyuge_es_pastor' => (bool) $pastor->conyuge_id,
            'documento_conyuge' => $pastor->conyuge ? $pastor->conyuge->documento : null,
            'extension' => $extension,
        ]);
    }

    /**
     * Procesa y guarda la solicitud de registro público del pastor y su extensión.
     */
    public function store(Request $request)
    {
        $cleanedDoc = trim($request->input('documento', ''));
        $numericDoc = preg_replace('/[^\d]/', '', $cleanedDoc);

        // Buscar primero por cédula exacta
        $existingPastor = !empty($cleanedDoc)
            ? Pastor::where('documento', $cleanedDoc)->first()
            : null;

        // Si no hay coincidencia exacta por documento, buscar registro incompleto/cónyuge pre-creado por dígitos numéricos
        if (!$existingPastor && !empty($numericDoc)) {
            $existingPastor = Pastor::where(function ($q) use ($numericDoc) {
                $q->where('documento', 'LIKE', "%{$numericDoc}%")
                    ->orWhere('codigo', 'LIKE', "%{$numericDoc}%");
            })
            ->where(function ($q) {
                $q->whereNotNull('conyuge_id')
                    ->orWhereNull('foto')
                    ->orWhereNull('foto_cedula');
            })
            ->first();
        }

        $docValidationRules = ['required', 'string', 'max:30'];
        if ($existingPastor) {
            $rule = Rule::unique('pastores', 'documento')->ignore($existingPastor->id);
            if ($existingPastor->conyuge_id) {
                $rule->ignore($existingPastor->conyuge_id);
            }
            $docValidationRules[] = $rule;
        } else {
            $docValidationRules[] = Rule::unique('pastores', 'documento');
        }

        $cleanedConyugeDoc = trim($request->input('cedula_conyuge', ''));
        $numericConyugeDoc = preg_replace('/[^\d]/', '', $cleanedConyugeDoc);

        $existingConyugePastor = !empty($cleanedConyugeDoc)
            ? Pastor::where('documento', $cleanedConyugeDoc)->first()
            : null;

        if (!$existingConyugePastor && !empty($numericConyugeDoc)) {
            $existingConyugePastor = Pastor::where(function ($q) use ($numericConyugeDoc) {
                $q->where('documento', 'LIKE', "%{$numericConyugeDoc}%")
                    ->orWhere('codigo', 'LIKE', "%{$numericConyugeDoc}%");
            })->first();
        }

        $cedulaConyugeValidationRules = ['nullable', 'required_if:conyuge_pastorea,true,1', 'string', 'max:30'];
        if ($existingConyugePastor) {
            $ruleConyuge = Rule::unique('pastores', 'documento')
                ->ignore($existingConyugePastor->id);
            if ($existingPastor) {
                $ruleConyuge->ignore($existingPastor->id);
            }
            if ($existingConyugePastor->conyuge_id) {
                $ruleConyuge->ignore($existingConyugePastor->conyuge_id);
            }
            $cedulaConyugeValidationRules[] = $ruleConyuge;
        } else {
            $ruleConyuge = Rule::unique('pastores', 'documento');
            if ($existingPastor) {
                $ruleConyuge->ignore($existingPastor->id);
            }
            $cedulaConyugeValidationRules[] = $ruleConyuge;
        }

        $validated = $request->validate([
            'nombres' => ['required', 'string', 'max:255'],
            'apellidos' => ['required', 'string', 'max:255'],
            'documento' => $docValidationRules,
            'genero' => ['required', 'string', 'in:Masculino,Femenino'],
            'fe_nacimiento' => ['required', 'date'],
            'estado_civil' => ['required', 'string', 'max:50'],
            'nombre_conyuge' => ['nullable', 'required_if:estado_civil,Casado(a)', 'string', 'max:255'],
            'conyuge_pastorea' => ['nullable', 'boolean'],
            'cedula_conyuge' => $cedulaConyugeValidationRules,
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
            'genero.required' => 'Debe seleccionar el género.',
            'cedula_conyuge.required_if' => 'Debe indicar la Cédula de Identidad de su cónyuge si también está pastoreando.',
            'cedula_conyuge.unique' => 'La Cédula de Identidad del cónyuge ya se encuentra registrada en el sistema.',
            'nombre_conyuge.required_if' => 'Si su estado civil es Casado(a), debe indicar el nombre completo de su cónyuge.',
            'foto_cedula.required' => 'La fotografía de la cédula de identidad es obligatoria para validar los datos.',
            'foto.required' => 'La fotografía de perfil (tipo carnet) es obligatoria.',
            'foto_cedula.max' => 'La imagen de la cédula no debe pesar más de 5MB.',
            'foto.max' => 'La imagen de perfil no debe pesar más de 5MB.',
        ]);

        return DB::transaction(function () use ($request, $validated, $existingPastor, $existingConyugePastor) {
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

            // Calcular edad automáticamente a partir de la fecha de nacimiento
            $edadCalculada = Carbon::parse($validated['fe_nacimiento'])->age;

            $pastorData = [
                'empresa_id' => 1,
                'sucursal_id' => 1,
                'nombres' => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
                'documento' => $validated['documento'],
                'genero' => $validated['genero'],
                'fe_nacimiento' => $validated['fe_nacimiento'],
                'edad' => $edadCalculada,
                'estado_civil' => $validated['estado_civil'],
                'nombre_conyuge' => $validated['nombre_conyuge'] ?? null,
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
            ];

            if ($existingPastor) {
                // Si el pastor ya existía (por ejemplo, creado como cónyuge), actualizamos su registro
                $existingPastor->update($pastorData);
                $pastor = $existingPastor;
            } else {
                // Generar Código Único de Pastor Principal
                $codigo = Pastor::generateCodigo(
                    $validated['documento'],
                    $validated['zona'] ?? null,
                    $validated['distrito'] ?? null
                );
                $pastorData['codigo'] = $codigo;
                $pastor = Pastor::create($pastorData);
            }

            $pastorConyuge = null;

            // Si es Casado(a) Y conyuge_pastorea es verdadero o ya estaba previamente vinculado
            if ($validated['estado_civil'] === 'Casado(a)' && ($request->boolean('conyuge_pastorea') || $pastor->conyuge_id !== null) && !empty($validated['nombre_conyuge'])) {
                $nombreCompleto = trim($validated['nombre_conyuge']);
                $partesNombre = array_values(array_filter(explode(' ', $nombreCompleto)));

                $nombresConyuge = count($partesNombre) > 1 ? array_shift($partesNombre) : ($partesNombre[0] ?? 'Cónyuge');
                $apellidosConyuge = !empty($partesNombre) ? implode(' ', $partesNombre) : 'Pastor';

                $docConyuge = !empty($validated['cedula_conyuge'])
                    ? trim($validated['cedula_conyuge'])
                    : 'C-' . preg_replace('/\D/', '', $validated['documento']);

                // Inferir género del cónyuge opuesto
                $generoConyuge = $validated['genero'] === 'Masculino' ? 'Femenino' : 'Masculino';

                if ($existingConyugePastor) {
                    $existingConyugePastor->update([
                        'empresa_id' => 1,
                        'sucursal_id' => 1,
                        'nombres' => $nombresConyuge,
                        'apellidos' => $apellidosConyuge,
                        'genero' => $generoConyuge,
                        'nombre_conyuge' => $pastor->nombre_completo,
                        'conyuge_id' => $pastor->id,
                        'telefono_tlf' => $validated['telefono_tlf'],
                    ]);
                    $pastorConyuge = $existingConyugePastor;
                } else if ($pastor->conyuge) {
                    $pastorConyuge = $pastor->conyuge;
                } else {
                    $codigoConyuge = Pastor::generateCodigo(
                        $docConyuge,
                        $validated['zona'] ?? null,
                        $validated['distrito'] ?? null
                    );

                    $pastorConyuge = Pastor::create([
                        'codigo' => $codigoConyuge,
                        'empresa_id' => 1,
                        'sucursal_id' => 1,
                        'nombres' => $nombresConyuge,
                        'apellidos' => $apellidosConyuge,
                        'documento' => $docConyuge,
                        'genero' => $generoConyuge,
                        'estado_civil' => 'Casado(a)',
                        'nombre_conyuge' => $pastor->nombre_completo,
                        'conyuge_id' => $pastor->id,
                        'nivel_ministerial' => $validated['nivel_ministerial'],
                        'zona' => $validated['zona'] ?? null,
                        'distrito' => $validated['distrito'] ?? null,
                        'estado_id' => $validated['estado_id'],
                        'telefono_tlf' => $validated['telefono_tlf'],
                        'status' => true,
                    ]);
                }

                // Match bidireccional entre ambos pastores
                $pastor->update(['conyuge_id' => $pastorConyuge->id]);
            }

            // Buscar si ya existe una iglesia / extensión creada por el cónyuge o por este pastor
            $iglesia = $pastor->iglesias()->first()
                ?? ($pastorConyuge ? $pastorConyuge->iglesias()->first() : null);

            if ($iglesia) {
                // Actualizar datos de la extensión si ya existía
                $iglesia->update([
                    'empresa_id' => 1,
                    'sucursal_id' => 1,
                    'nombre' => $validated['nombre_extension'],
                    'direccion' => $validated['direccion_extension'],
                    'estado_id' => $validated['estado_id'],
                    'zona' => $validated['zona'] ?? null,
                    'distrito' => $validated['distrito'] ?? null,
                    'activa' => true,
                ]);
            } else {
                // Crear registro de Extensión / Iglesia
                $iglesia = Iglesia::create([
                    'empresa_id' => 1,
                    'sucursal_id' => 1,
                    'nombre' => $validated['nombre_extension'],
                    'direccion' => $validated['direccion_extension'],
                    'estado_id' => $validated['estado_id'],
                    'zona' => $validated['zona'] ?? null,
                    'distrito' => $validated['distrito'] ?? null,
                    'pastor_id' => $pastor->id,
                    'activa' => true,
                ]);
            }

            // Relacionar a los pastores con la extensión en la tabla pivote iglesia_pastor
            $idsPastoresExtension = [$pastor->id];
            if ($pastorConyuge) {
                $idsPastoresExtension[] = $pastorConyuge->id;
            }

            $iglesia->pastores()->syncWithoutDetaching($idsPastoresExtension);

            return back()->with('success', [
                'codigo' => $pastor->codigo,
                'nombre' => $pastor->nombre_completo,
                'mensaje' => '¡Registro completado exitosamente! Los datos han sido recibidos para su validación.',
            ]);
        });
    }
}
