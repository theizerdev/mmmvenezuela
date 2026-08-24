<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Estado;
use App\Models\Iglesia;
use App\Models\Municipio;
use App\Models\Parroquia;
use App\Models\Pastor;
use App\Models\User;
use App\Services\WhatsAppService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PastorRegistroPublicoController extends Controller
{
    /**
     * Muestra el formulario público de registro de pastores (Wizard de 5 Pasos).
     */
    public function index(): Response
    {
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

        $pastoresDisponibles = Pastor::where('status', true)
            ->select('id', 'nombres', 'apellidos', 'codigo', 'documento', 'genero')
            ->orderBy('nombres', 'asc')
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
            'municipios' => $municipios,
            'parroquias' => $parroquias,
            'pastoresDisponibles' => $pastoresDisponibles,
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
            ->when(!empty($numeric), function ($q) use ($numeric) {
                $q->orWhere('documento', 'LIKE', "%{$numeric}%")
                  ->orWhere('codigo', 'LIKE', "%{$numeric}%");
            })
            ->first();

        if (!$pastor) {
            return response()->json(['existe' => false]);
        }

        $nombreConyuge = $pastor->nombre_conyuge;
        if (empty($nombreConyuge) && $pastor->conyuge) {
            $nombreConyuge = $pastor->conyuge->nombre_completo;
        }

        $cedulaConyuge = $pastor->conyuge ? $pastor->conyuge->documento : null;

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
                'miembros_activos' => $iglesia->miembros_activos,
                'cantidad_campos_blancos' => $iglesia->cantidad_campos_blancos,
                'miembro_probante' => $iglesia->miembro_probante,
                'tiempo_trabajo' => $iglesia->tiempo_trabajo,
                'iglesias_fundadas' => $iglesia->iglesias_fundadas,
                'pastores_ministerio' => $iglesia->pastores_ministerio,
            ];
        }

        return response()->json([
            'existe' => true,
            'nombre' => $pastor->nombre_completo,
            'pastor' => [
                'id' => $pastor->id,
                'codigo' => $pastor->codigo,
                'nombres' => $pastor->nombres,
                'apellidos' => $pastor->apellidos,
                'documento' => $pastor->documento,
                'genero' => $pastor->genero ?: 'Masculino',
                'fe_nacimiento' => $pastor->fe_nacimiento ? $pastor->fe_nacimiento->format('Y-m-d') : '',
                'edad' => $pastor->edad ? (string)$pastor->edad : '',
                'estado_civil' => $pastor->estado_civil ?: 'Casado(a)',
                'nombre_conyuge' => $nombreConyuge ?: '',
                'cedula_conyuge' => $cedulaConyuge ?: '',
                'conyuge_pastorea' => (bool)$pastor->conyuge_id,
                'conyuge_id' => $pastor->conyuge_id ? (string)$pastor->conyuge_id : '',
                'telefono_tlf' => $pastor->telefono_tlf ?: '',
                'telefono_hab' => $pastor->telefono_hab ?: '',
                'telefono_otro' => $pastor->telefono_otro ?: '',
                'email' => $pastor->email ?: '',
                'estado_id' => $pastor->estado_id ? (string)$pastor->estado_id : '',
                'municipio_id' => $pastor->municipio_id ? (string)$pastor->municipio_id : '',
                'parroquia_id' => $pastor->parroquia_id ? (string)$pastor->parroquia_id : '',
                'municipio' => $pastor->municipio ?: '',
                'edificio_casa_quinta' => $pastor->edificio_casa_quinta ?: '',
                'piso' => $pastor->piso ?: '',
                'apartamento' => $pastor->apartamento ?: '',
                'calle_avenida' => $pastor->calle_avenida ?: '',
                'urbanizacion' => $pastor->urbanizacion ?: '',
                'grado_instruccion' => $pastor->grado_instruccion ?: 'Universitario',
                'titulo_obtenido' => $pastor->titulo_obtenido ?: '',
                'estudio_teologico' => (bool)$pastor->estudio_teologico,
                'titulo_teologico' => $pastor->titulo_teologico ?: '',
                'tiempo_de_estudio_teologico' => $pastor->tiempo_de_estudio_teologico ?: '',
                'instituto_teologico' => $pastor->instituto_teologico ?: '',
                'nivel_ministerial' => $pastor->nivel_ministerial ?: 'Ministro Ordenado',
                'zona' => $pastor->zona ?: '',
                'distrito' => $pastor->distrito ?: '',
                'ano_promocion' => $pastor->ano_promocion ?: '',
                'tiempo_colaborando' => $pastor->tiempo_colaborando ?: '',
                'batizado_espiritu_santo' => (bool)$pastor->batizado_espiritu_santo,
                'pertenece_ministerio' => (bool)$pastor->pertenece_ministerio,
                'cargo_nacional' => $pastor->cargo_nacional ?: '',
                'mencion' => $pastor->mencion ?: '',
                'nota' => $pastor->nota ?: '',
                'grupo_sanguineo' => $pastor->grupo_sanguineo ?: 'O+',
                'condicion_salud' => $pastor->condicion_salud ?: 'Buena',
                'padece_enfermedad' => (bool)$pastor->padece_enfermedad,
                'enfermedades_cronicas' => $pastor->enfermedades_cronicas ?: '',
                'toma_medicamentos' => (bool)$pastor->toma_medicamentos,
                'medicamentos_recetados' => $pastor->medicamentos_recetados ?: '',
                'alergias' => $pastor->alergias ?: '',
                'contacto_emergencia_nombre' => $pastor->contacto_emergencia_nombre ?: '',
                'contacto_emergencia_telefono' => $pastor->contacto_emergencia_telefono ?: '',
                'observaciones_salud' => $pastor->observaciones_salud ?: '',
                'foto' => $pastor->foto ?: '',
                'foto_cedula' => $pastor->foto_cedula ?: '',
            ],
            'extension' => $extension,
        ]);
    }

    /**
     * Procesa y guarda la solicitud de registro público del pastor (Wizard de 5 Pasos).
     * Si el pastor ya existe por su cédula, actualiza su ficha; si no existe, lo crea.
     */
    public function store(Request $request)
    {
        $cleanedDoc = trim($request->input('documento', ''));
        $numericDoc = preg_replace('/[^\d]/', '', $cleanedDoc);

        // Buscar primero por coincidencia exacta o numérica
        $existingPastor = Pastor::where('documento', $cleanedDoc)
            ->when(!empty($numericDoc), function ($q) use ($numericDoc) {
                $q->orWhere('documento', 'LIKE', "%{$numericDoc}%")
                  ->orWhere('codigo', 'LIKE', "%{$numericDoc}%");
            })
            ->first();

        $validated = $request->validate([
            // Paso 1: Personales, Ubicación y Contacto
            'codigo' => ['nullable', 'string', 'max:50'],
            'nombres' => ['required', 'string', 'max:191'],
            'apellidos' => ['required', 'string', 'max:191'],
            'documento' => ['required', 'string', 'max:50'],
            'genero' => ['nullable', 'string', 'in:M,F,Masculino,Femenino'],
            'fe_nacimiento' => ['nullable', 'date'],
            'edad' => ['nullable', 'integer', 'min:0', 'max:120'],
            'estado_civil' => ['nullable', 'string', 'max:100'],
            'nombre_conyuge' => ['nullable', 'string', 'max:191'],
            'cedula_conyuge' => ['nullable', 'string', 'max:50'],
            'conyuge_pastorea' => ['nullable', 'boolean'],
            'conyuge_id' => ['nullable', 'exists:pastores,id'],
            'telefono_hab' => ['nullable', 'string', 'max:50'],
            'telefono_tlf' => ['nullable', 'string', 'max:50'],
            'telefono_otro' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:191'],
            'edificio_casa_quinta' => ['nullable', 'string', 'max:191'],
            'piso' => ['nullable', 'string', 'max:50'],
            'apartamento' => ['nullable', 'string', 'max:50'],
            'calle_avenida' => ['nullable', 'string', 'max:191'],
            'urbanizacion' => ['nullable', 'string', 'max:191'],
            'estado_id' => ['nullable', 'exists:estados,id'],
            'municipio_id' => ['nullable', 'exists:municipios,id'],
            'parroquia_id' => ['nullable', 'exists:parroquias,id'],
            'municipio' => ['nullable', 'string', 'max:191'],

            // Paso 2: Académicos
            'grado_instruccion' => ['nullable', 'string', 'max:191'],
            'titulo_obtenido' => ['nullable', 'string', 'max:191'],
            'estudio_teologico' => ['nullable', 'boolean'],
            'titulo_teologico' => ['nullable', 'string', 'max:191'],
            'tiempo_de_estudio_teologico' => ['nullable', 'string', 'max:100'],
            'instituto_teologico' => ['nullable', 'string', 'max:191'],

            // Paso 3: Eclesiásticos
            'nivel_ministerial' => ['required', 'string', 'in:Colaborador,Laico,Licenciado,Ministro Ordenado'],
            'zona' => ['nullable', 'string', 'max:191'],
            'distrito' => ['nullable', 'string', 'max:191'],
            'ano_promocion' => ['nullable', 'string', 'max:50'],
            'tiempo_colaborando' => ['nullable', 'string', 'max:100'],
            'batizado_espiritu_santo' => ['nullable', 'boolean'],
            'pertenece_ministerio' => ['nullable', 'boolean'],
            'cargo_nacional' => ['nullable', 'string', 'max:191'],
            'mencion' => ['nullable', 'string'],
            'nota' => ['nullable', 'string'],

            // Paso 4: Salud
            'grupo_sanguineo' => ['nullable', 'string', 'max:10'],
            'condicion_salud' => ['nullable', 'string', 'max:50'],
            'padece_enfermedad' => ['nullable', 'boolean'],
            'enfermedades_cronicas' => ['nullable', 'string'],
            'toma_medicamentos' => ['nullable', 'boolean'],
            'medicamentos_recetados' => ['nullable'],
            'alergias' => ['nullable', 'string', 'max:191'],
            'contacto_emergencia_nombre' => ['nullable', 'string', 'max:191'],
            'contacto_emergencia_telefono' => ['nullable', 'string', 'max:50'],
            'observaciones_salud' => ['nullable', 'string'],

            // Paso 5: Fotografías
            'foto' => ['nullable'],
            'foto_cedula' => ['nullable'],
        ], [
            'documento.required' => 'La Cédula de Identidad es obligatoria.',
            'nombres.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'El apellido es obligatorio.',
            'nivel_ministerial.required' => 'El grado ministerial es obligatorio.',
        ]);

        return DB::transaction(function () use ($request, $validated, $existingPastor) {
            // Procesar foto de perfil
            $fotoPath = null;
            if ($request->hasFile('foto')) {
                $fotoPath = $request->file('foto')->store('pastores', 'public');
            } elseif ($request->filled('foto') && str_starts_with($request->input('foto'), 'data:image/')) {
                $imageData = $request->input('foto');
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                    $imageData = substr($imageData, strpos($imageData, ',') + 1);
                    $type = strtolower($type[1]);
                    if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                        $type = 'png';
                    }
                    $imageData = base64_decode($imageData);
                    if ($imageData !== false) {
                        $filename = 'pastor_' . preg_replace('/\D/', '', $validated['documento'] ?? 'foto') . '_' . time() . '.' . $type;
                        $destinationPath = public_path('pastores');
                        if (!file_exists($destinationPath)) {
                            mkdir($destinationPath, 0755, true);
                        }
                        file_put_contents($destinationPath . '/' . $filename, $imageData);
                        $fotoPath = $filename;
                    }
                }
            } elseif ($existingPastor && $existingPastor->foto) {
                $fotoPath = $existingPastor->foto;
            }

            // Procesar foto de la cédula
            $fotoCedulaPath = null;
            if ($request->hasFile('foto_cedula')) {
                $fotoCedulaPath = $request->file('foto_cedula')->store('pastores_cedulas', 'public');
            } elseif ($request->filled('foto_cedula') && str_starts_with($request->input('foto_cedula'), 'data:image/')) {
                $imageData = $request->input('foto_cedula');
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                    $imageData = substr($imageData, strpos($imageData, ',') + 1);
                    $type = strtolower($type[1]);
                    if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                        $type = 'png';
                    }
                    $imageData = base64_decode($imageData);
                    if ($imageData !== false) {
                        $filename = 'cedula_' . preg_replace('/\D/', '', $validated['documento'] ?? 'doc') . '_' . time() . '.' . $type;
                        $destinationPath = public_path('pastores_cedulas');
                        if (!file_exists($destinationPath)) {
                            mkdir($destinationPath, 0755, true);
                        }
                        file_put_contents($destinationPath . '/' . $filename, $imageData);
                        $fotoCedulaPath = $filename;
                    }
                }
            } elseif ($existingPastor && $existingPastor->foto_cedula) {
                $fotoCedulaPath = $existingPastor->foto_cedula;
            }

            // Calcular edad automáticamente
            if (!empty($validated['fe_nacimiento'])) {
                $validated['edad'] = Carbon::parse($validated['fe_nacimiento'])->age;
            }

            // Normalizar género a 'M' o 'F'
            $genero = $validated['genero'] ?? 'M';
            if ($genero === 'Masculino') $genero = 'M';
            if ($genero === 'Femenino') $genero = 'F';

            $pastorData = [
                'empresa_id' => 1,
                'sucursal_id' => 1,
                'nombres' => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
                'documento' => $validated['documento'],
                'genero' => $genero,
                'fe_nacimiento' => $validated['fe_nacimiento'] ?? null,
                'edad' => $validated['edad'] ?? null,
                'estado_civil' => $validated['estado_civil'] ?? 'Casado',
                'nombre_conyuge' => $validated['nombre_conyuge'] ?? null,
                'conyuge_id' => !empty($validated['conyuge_id']) ? (int)$validated['conyuge_id'] : null,
                'telefono_hab' => $validated['telefono_hab'] ?? null,
                'telefono_tlf' => $validated['telefono_tlf'] ?? null,
                'telefono_otro' => $validated['telefono_otro'] ?? null,
                'email' => $validated['email'] ?? null,
                'edificio_casa_quinta' => $validated['edificio_casa_quinta'] ?? null,
                'piso' => $validated['piso'] ?? null,
                'apartamento' => $validated['apartamento'] ?? null,
                'calle_avenida' => $validated['calle_avenida'] ?? null,
                'urbanizacion' => $validated['urbanizacion'] ?? null,
                'estado_id' => !empty($validated['estado_id']) ? (int)$validated['estado_id'] : null,
                'municipio_id' => !empty($validated['municipio_id']) ? (int)$validated['municipio_id'] : null,
                'parroquia_id' => !empty($validated['parroquia_id']) ? (int)$validated['parroquia_id'] : null,
                'municipio' => $validated['municipio'] ?? null,

                'grado_instruccion' => $validated['grado_instruccion'] ?? null,
                'titulo_obtenido' => $validated['titulo_obtenido'] ?? null,
                'estudio_teologico' => filter_var($validated['estudio_teologico'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'titulo_teologico' => $validated['titulo_teologico'] ?? null,
                'tiempo_de_estudio_teologico' => $validated['tiempo_de_estudio_teologico'] ?? null,
                'instituto_teologico' => $validated['instituto_teologico'] ?? null,

                'nivel_ministerial' => $validated['nivel_ministerial'],
                'zona' => $validated['zona'] ?? null,
                'distrito' => $validated['distrito'] ?? null,
                'ano_promocion' => $validated['ano_promocion'] ?? null,
                'tiempo_colaborando' => $validated['tiempo_colaborando'] ?? null,
                'batizado_espiritu_santo' => filter_var($validated['batizado_espiritu_santo'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'pertenece_ministerio' => filter_var($validated['pertenece_ministerio'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'cargo_nacional' => $validated['cargo_nacional'] ?? null,
                'mencion' => $validated['mencion'] ?? null,
                'nota' => $validated['nota'] ?? null,

                'grupo_sanguineo' => $validated['grupo_sanguineo'] ?? 'O+',
                'condicion_salud' => $validated['condicion_salud'] ?? 'Buena',
                'padece_enfermedad' => filter_var($validated['padece_enfermedad'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'enfermedades_cronicas' => $validated['enfermedades_cronicas'] ?? null,
                'toma_medicamentos' => filter_var($validated['toma_medicamentos'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'medicamentos_recetados' => $validated['medicamentos_recetados'] ?? null,
                'alergias' => $validated['alergias'] ?? null,
                'contacto_emergencia_nombre' => $validated['contacto_emergencia_nombre'] ?? null,
                'contacto_emergencia_telefono' => $validated['contacto_emergencia_telefono'] ?? null,
                'observaciones_salud' => $validated['observaciones_salud'] ?? null,

                'foto' => $fotoPath,
                'foto_cedula' => $fotoCedulaPath,
                'status' => true,
            ];

            if ($existingPastor) {
                $existingPastor->update($pastorData);
                $pastor = $existingPastor;
            } else {
                if (empty($validated['codigo'])) {
                    $nextId = (int) Pastor::max('id') + 1;
                    $pastorData['codigo'] = Pastor::generateCodigo(
                        $validated['documento'],
                        $validated['zona'] ?? null,
                        $validated['distrito'] ?? null,
                        $nextId
                    );
                } else {
                    $pastorData['codigo'] = $validated['codigo'];
                }
                $pastor = Pastor::create($pastorData);
            }

            // Lógica de Vinculación y Creación de Cónyuge
            $esCasado = str_contains(strtolower($validated['estado_civil'] ?? ''), 'casad');
            $cedulaConyuge = trim($request->input('cedula_conyuge', ''));
            $conyugeId = !empty($validated['conyuge_id']) ? (int)$validated['conyuge_id'] : null;
            $conyugePastorea = $request->boolean('conyuge_pastorea');

            if ($esCasado) {
                $pastorConyuge = null;

                // 1. Si se seleccionó un conyuge_id existente
                if ($conyugeId) {
                    $pastorConyuge = Pastor::find($conyugeId);
                }

                // 2. Si no hay conyugeId pero se ingresó la cédula del cónyuge
                if (!$pastorConyuge && !empty($cedulaConyuge)) {
                    $numericConyugeDoc = preg_replace('/[^\d]/', '', $cedulaConyuge);
                    $pastorConyuge = Pastor::where('documento', $cedulaConyuge)
                        ->orWhere('documento', 'LIKE', "%{$numericConyugeDoc}%")
                        ->first();
                }

                // 3. Si se encontró el pastor cónyuge existente
                if ($pastorConyuge) {
                    $pastorConyuge->update([
                        'conyuge_id' => $pastor->id,
                        'nombre_conyuge' => $pastor->nombre_completo,
                    ]);
                    $pastor->update([
                        'conyuge_id' => $pastorConyuge->id,
                        'nombre_conyuge' => $pastorConyuge->nombre_completo,
                    ]);
                }
                // 4. Si no existe pero se indicó nombre y cédula (o pastorea), crearlo como cónyuge
                elseif (!empty($validated['nombre_conyuge']) && (!empty($cedulaConyuge) || $conyugePastorea)) {
                    $nombreCompleto = trim($validated['nombre_conyuge']);
                    $partesNombre = array_values(array_filter(explode(' ', $nombreCompleto)));
                    $nombresConyuge = count($partesNombre) > 1 ? array_shift($partesNombre) : ($partesNombre[0] ?? 'Cónyuge');
                    $apellidosConyuge = !empty($partesNombre) ? implode(' ', $partesNombre) : 'Pastor';

                    $docConyuge = !empty($cedulaConyuge)
                        ? $cedulaConyuge
                        : 'C-' . preg_replace('/\D/', '', $validated['documento']);

                    $generoConyuge = ($genero === 'M') ? 'F' : 'M';
                    $codigoConyuge = Pastor::generateCodigo(
                        $docConyuge,
                        $validated['zona'] ?? null,
                        $validated['distrito'] ?? null
                    );

                    $nuevoConyuge = Pastor::create([
                        'codigo' => $codigoConyuge,
                        'empresa_id' => 1,
                        'sucursal_id' => 1,
                        'nombres' => $nombresConyuge,
                        'apellidos' => $apellidosConyuge,
                        'documento' => $docConyuge,
                        'genero' => $generoConyuge,
                        'estado_civil' => 'Casado',
                        'nombre_conyuge' => $pastor->nombre_completo,
                        'conyuge_id' => $pastor->id,
                        'nivel_ministerial' => $validated['nivel_ministerial'] ?? 'Colaborador',
                        'zona' => $validated['zona'] ?? null,
                        'distrito' => $validated['distrito'] ?? null,
                        'estado_id' => $validated['estado_id'] ?? null,
                        'telefono_tlf' => $validated['telefono_tlf'] ?? null,
                        'status' => true,
                    ]);

                    $pastor->update([
                        'conyuge_id' => $nuevoConyuge->id,
                    ]);
                }
            }

            // Notificar al Presbítero de la misma zona / distrito por WhatsApp
            $this->notificarPresbiteroWhatsApp($pastor);

            return back()->with('success', [
                'codigo' => $pastor->codigo,
                'nombre' => $pastor->nombre_completo,
                'mensaje' => '¡Registro completado exitosamente! Los datos han sido recibidos para su validación oficial.',
            ]);
        });
    }

    /**
     * Envía notificación por WhatsApp al presbítero asignado a la misma zona o distrito.
     */
    private function notificarPresbiteroWhatsApp(Pastor $pastor): void
    {
        try {
            $empresa = Empresa::first();
            if (!$empresa || !$empresa->whatsapp_active) {
                return;
            }

            // Buscar presbíteros que tengan asignada la misma zona o distrito
            $zonaPastor = trim($pastor->zona ?? '');
            $distritoPastor = trim($pastor->distrito ?? '');

            $presbiteros = User::whereHas('roles', function ($q) {
                    $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
                })
                ->where(function ($query) use ($zonaPastor, $distritoPastor) {
                    if (!empty($zonaPastor)) {
                        $query->where('zona', $zonaPastor);
                    }
                    if (!empty($distritoPastor)) {
                        $query->orWhere('distrito', $distritoPastor);
                    }
                })
                ->whereNotNull('telefono')
                ->where('telefono', '!=', '')
                ->get();

            // Si no hay presbítero asignado con esa zona exacta, notificar a presbíteros con teléfono configurado
            if ($presbiteros->isEmpty()) {
                $presbiteros = User::whereHas('roles', function ($q) {
                        $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
                    })
                    ->whereNotNull('telefono')
                    ->where('telefono', '!=', '')
                    ->limit(2)
                    ->get();
            }

            if ($presbiteros->isEmpty()) {
                return;
            }

            $whatsappService = new WhatsAppService($empresa);

            $mensaje = "🔔 *MMM Venezuela - Notificación Ministerial*\n\n"
                     . "Estimado Presbítero,\n"
                     . "Se ha completado la ficha de registro ministerial de un obrero a su cargo:\n\n"
                     . "👤 *Pastor:* {$pastor->nombre_completo}\n"
                     . "🆔 *Cédula:* {$pastor->documento}\n"
                     . "🏷️ *Código Asignado:* {$pastor->codigo}\n"
                     . "📜 *Grado Ministerial:* {$pastor->nivel_ministerial}\n"
                     . "📍 *Zona:* " . ($pastor->zona ?: 'Sin asignar') . "\n"
                     . "🏛️ *Distrito:* " . ($pastor->distrito ?: 'Sin asignar') . "\n"
                     . "📱 *Teléfono:* " . ($pastor->telefono_tlf ?: 'N/A') . "\n"
                     . "📋 *Estado Civil:* " . ($pastor->estado_civil ?: 'N/A') . "\n\n"
                     . "Los datos se encuentran listos en el panel administrativo para su revisión y confirmación oficial.";

            foreach ($presbiteros as $presbitero) {
                if (!empty($presbitero->telefono)) {
                    $whatsappService->sendMessage($presbitero->telefono, $mensaje);
                }
            }
        } catch (\Throwable $e) {
            Log::error('Error al enviar WhatsApp a presbítero: ' . $e->getMessage(), [
                'pastor_id' => $pastor->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
