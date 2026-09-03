<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Pais;
use App\Models\Sucursal;
use App\Models\User;
use App\Services\WhatsAppService;
use App\Services\MailNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $roleName = $request->input('role');
        $empresaId = $request->input('empresa_id');
        $perPage = $request->input('perPage', 10);

        $query = User::with(['empresa', 'sucursal', 'roles', 'paisTelefono']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%")
                    ->orWhere('telefono', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($empresaId) {
            $query->where('empresa_id', $empresaId);
        }

        if ($roleName) {
            $query->role($roleName);
        }

        $users = $query->latest()->paginate($perPage)->withQueryString();

        $stats = [
            'total' => User::count(),
            'activos' => User::where('status', 'activo')->count(),
            'inactivos' => User::where('status', 'inactivos')->count(),
        ];

        return inertia('admin/Usuarios/Index', [
            'users' => $users,
            'stats' => $stats,
            'roles' => Role::all(['id', 'name']),
            'empresas' => Empresa::where('status', true)->orderBy('razon_social')->get(['id', 'razon_social']),
            'sucursales' => Sucursal::where('status', true)->orderBy('nombre')->get(['id', 'nombre', 'empresa_id']),
            'paises' => Pais::where('activo', true)
                ->orderBy('nombre')
                ->get(['id', 'nombre', 'codigo_iso2', 'codigo_telefonico']),
            'filters' => $request->only(['search', 'status', 'role', 'empresa_id', 'perPage']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'nullable|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:12',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&._\-])[A-Za-z\d@$!%*#?&._\-]{8,12}$/',
            ],
            'telefono' => 'nullable|string|max:255',
            'pais_telefono_id' => 'nullable|exists:pais,id',
            'status' => ['required', Rule::in(['activo', 'inactivo', 'suspendido'])],
            'empresa_id' => 'nullable|exists:empresas,id',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'zona' => 'nullable|string|max:255',
            'distrito' => 'nullable|string|max:255',
            'zona_2' => 'nullable|string|max:255',
            'distrito_2' => 'nullable|string|max:255',
            'roles' => 'array',
        ], [
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede superar los 12 caracteres.',
            'password.regex' => 'La contraseña debe tener entre 8 y 12 caracteres, incluir al menos una mayúscula, una minúscula, un número y un símbolo (@, $, !, %, *, #, ?, &, ., _, -).',
        ]);

        try {
            $rawPassword = $validated['password'];
            $validated['password'] = Hash::make($validated['password']);
            $validated['must_change_password'] = true;
            $user = User::create($validated);

            if (isset($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            }

            // Enviar mensaje de bienvenida por WhatsApp si tiene teléfono
            $this->notificarBienvenidaWhatsApp($user, $rawPassword);

            // Enviar correo de bienvenida con credenciales
            $this->notificarBienvenidaEmail($user, $rawPassword);

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('User created successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error('Error al crear usuario: '.$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error creating the user. Please try again.'),
            ]);
        }
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'max:12',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&._\-])[A-Za-z\d@$!%*#?&._\-]{8,12}$/',
            ],
            'telefono' => 'nullable|string|max:255',
            'pais_telefono_id' => 'nullable|exists:pais,id',
            'status' => ['required', Rule::in(['activo', 'inactivo', 'suspendido'])],
            'empresa_id' => 'nullable|exists:empresas,id',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'zona' => 'nullable|string|max:255',
            'distrito' => 'nullable|string|max:255',
            'zona_2' => 'nullable|string|max:255',
            'distrito_2' => 'nullable|string|max:255',
            'roles' => 'array',
        ], [
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede superar los 12 caracteres.',
            'password.regex' => 'La contraseña debe tener entre 8 y 12 caracteres, incluir al menos una mayúscula, una minúscula, un número y un símbolo (@, $, !, %, *, #, ?, &, ., _, -).',
        ]);

        try {
            if (! empty($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            } else {
                unset($validated['password']);
            }

            $user->update($validated);

            if (isset($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            }

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('User updated successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error("Error al actualizar usuario {$user->id}: ".$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error updating the user. Please try again.'),
            ]);
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('User deleted successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error("Error al eliminar usuario {$user->id}: ".$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error deleting the user. Please try again.'),
            ]);
        }
    }

    public function toggleStatus(User $user)
    {
        try {
            $user->status = $user->status === 'activo' ? 'inactivo' : 'activo';
            $user->save();

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Status updated successfully.'),
            ]);
        } catch (\Exception $e) {
            Log::error("Error al cambiar estado de usuario {$user->id}: ".$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('There was an error updating the status. Please try again.'),
            ]);
        }
    }

    /**
     * Reenvía el mensaje de bienvenida institucional por WhatsApp a un usuario.
     */
    public function sendWelcomeWhatsApp(User $user)
    {
        try {
            $user->load(['roles', 'empresa', 'sucursal']);

            if (empty($user->telefono)) {
                return back()->with('notification', [
                    'type' => 'error',
                    'message' => 'El usuario no tiene un número telefónico registrado.',
                ]);
            }

            $empresa = $user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first();
            if (! $empresa || ! $empresa->whatsapp_active) {
                return back()->with('notification', [
                    'type' => 'error',
                    'message' => 'El servicio de WhatsApp se encuentra desactivado en la empresa.',
                ]);
            }

            $this->notificarBienvenidaWhatsApp($user);

            return back()->with('notification', [
                'type' => 'success',
                'message' => "Mensaje de bienvenida enviado exitosamente al WhatsApp de {$user->name}.",
            ]);
        } catch (\Exception $e) {
            Log::error("Error al enviar WhatsApp a usuario {$user->id}: ".$e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => 'Ocurrió un error al enviar el mensaje por WhatsApp.',
            ]);
        }
    }

    /**
     * Envía mensaje de bienvenida por WhatsApp al usuario creado.
     */
    private function notificarBienvenidaWhatsApp(User $user, ?string $rawPassword = null): void
    {
        try {
            if (empty($user->telefono)) {
                return;
            }

            $empresa = $user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first();
            if (!$empresa || !$empresa->whatsapp_active) {
                return;
            }

            $user->load(['roles', 'empresa', 'sucursal']);
            $rolesList = $user->roles->pluck('name')->implode(', ');
            $isPresbitero = $user->hasAnyRole(['Presbitero', 'Presbítero', 'presbitero']);

            $loginUrl = request()->root() ? request()->root() . '/login' : url('/login');

            if ($isPresbitero) {
                $zonasTexto = $user->zona ?: 'Sin asignar';
                if (!empty($user->zona_2)) {
                    $zonasTexto .= ", {$user->zona_2}";
                }

                $distritosTexto = $user->distrito ? "Distrito {$user->distrito}" : 'Sin asignar';
                if (!empty($user->distrito_2)) {
                    $distritosTexto .= ", Distrito {$user->distrito_2}";
                }

                $variables = [
                    'nombre' => $user->name,
                    'zonas' => $zonasTexto,
                    'distritos' => $distritosTexto,
                    'email' => $user->email,
                    'password_line' => $rawPassword ? "• *Contraseña:* {$rawPassword}\n" : "",
                    'login_url' => $loginUrl,
                    'empresa' => $empresa->razon_social ?? 'MMM Venezuela',
                ];

                $whatsappService = new WhatsAppService($empresa);
                $whatsappService->sendTemplate($user->telefono, 'Bienvenida de Presbítero al Sistema', $variables);
            } else {
                $variables = [
                    'nombre' => $user->name,
                    'rol' => $rolesList ?: 'Usuario del Sistema',
                    'email' => $user->email,
                    'password_line' => $rawPassword ? "• *Contraseña:* {$rawPassword}\n" : "",
                    'login_url' => $loginUrl,
                    'empresa' => $empresa->razon_social ?? 'MMM Venezuela',
                ];

                $whatsappService = new WhatsAppService($empresa);
                $whatsappService->sendTemplate($user->telefono, 'Bienvenida de Usuario al Sistema', $variables);
            }
        } catch (\Throwable $e) {
            Log::error('Error al enviar WhatsApp de bienvenida a usuario: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Reenvía el correo de bienvenida institucional a un usuario.
     */
    public function sendWelcomeEmail(User $user)
    {
        try {
            $user->loadMissing(['roles', 'empresa', 'sucursal']);

            if (empty($user->email)) {
                return back()->with('notification', [
                    'type' => 'error',
                    'message' => 'El usuario no tiene una dirección de correo electrónico registrada.',
                ]);
            }

            $empresa = $user->empresa ?: ($user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first());
            if (! $empresa || (! $empresa->google_smtp_active && ! $empresa->mailgun_active && ! $empresa->mailpit_active)) {
                return back()->with('notification', [
                    'type' => 'error',
                    'message' => 'No hay ningún servicio de correo (Google SMTP o Mailgun) activo en la configuración.',
                ]);
            }

            $mailService = new MailNotificationService($empresa);
            $isPresbitero = $user->hasAnyRole(['Presbitero', 'Presbítero', 'presbitero']);

            $enviado = $isPresbitero
                ? $mailService->enviarBienvenidaPresbitero($user)
                : $mailService->enviarBienvenidaUsuario($user);

            if ($enviado) {
                return back()->with('notification', [
                    'type' => 'success',
                    'message' => "Correo de bienvenida enviado exitosamente a {$user->email}.",
                ]);
            }

            $errorMsg = $mailService->getLastError() ?: 'No se pudo entregar el correo.';
            return back()->with('notification', [
                'type' => 'error',
                'message' => "Ocurrió un error al enviar el correo: {$errorMsg}",
            ]);
        } catch (\Exception $e) {
            Log::error("Error al enviar correo a usuario {$user->id}: " . $e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => 'Ocurrió un error inesperado al enviar el correo de bienvenida.',
            ]);
        }
    }

    /**
     * Envía y/o regenera credenciales de acceso al usuario por Correo y/o WhatsApp.
     */
    public function sendCredentials(Request $request, User $user)
    {
        $validated = $request->validate([
            'reset_password' => 'required|boolean',
            'password' => [
                'nullable',
                'string',
                'min:8',
                'max:12',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&._\-])[A-Za-z\d@$!%*#?&._\-]{8,12}$/',
                'required_if:reset_password,true,1',
            ],
            'send_email' => 'required|boolean',
            'send_whatsapp' => 'required|boolean',
        ], [
            'password.required_if' => 'Debe ingresar o generar una contraseña temporal.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.max' => 'La contraseña no puede superar los 12 caracteres.',
            'password.regex' => 'La contraseña debe tener entre 8 y 12 caracteres, incluir al menos una mayúscula, una minúscula, un número y un símbolo (@, $, !, %, *, #, ?, &, ., _, -).',
        ]);

        if (! $validated['send_email'] && ! $validated['send_whatsapp']) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => 'Debe seleccionar al menos un canal de envío (Correo o WhatsApp).',
            ]);
        }

        try {
            $rawPassword = null;

            if ($validated['reset_password'] && ! empty($validated['password'])) {
                $rawPassword = $validated['password'];
                $user->password = Hash::make($rawPassword);
                $user->must_change_password = true;
                $user->save();
            }

            $user->loadMissing(['roles', 'empresa', 'sucursal']);
            $empresa = $user->empresa ?: ($user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first());

            $canalesEnviados = [];
            $errores = [];

            // 1. Envío por Correo Electrónico
            if ($validated['send_email']) {
                if (empty($user->email)) {
                    $errores[] = 'El usuario no tiene correo electrónico registrado.';
                } elseif (! $empresa || (! $empresa->google_smtp_active && ! $empresa->mailgun_active && ! $empresa->mailpit_active)) {
                    $errores[] = 'No hay ningún servicio de correo activo (Google SMTP o Mailgun).';
                } else {
                    $mailService = new MailNotificationService($empresa);
                    $isPresbitero = $user->hasAnyRole(['Presbitero', 'Presbítero', 'presbitero']);

                    $enviado = $isPresbitero
                        ? $mailService->enviarBienvenidaPresbitero($user, $rawPassword)
                        : $mailService->enviarBienvenidaUsuario($user, $rawPassword);

                    if ($enviado) {
                        $canalesEnviados[] = 'Correo Electrónico';
                    } else {
                        $errores[] = 'Fallo en envío de correo: ' . ($mailService->getLastError() ?: 'Error desconocido');
                    }
                }
            }

            // 2. Envío por WhatsApp
            if ($validated['send_whatsapp']) {
                if (empty($user->telefono)) {
                    $errores[] = 'El usuario no tiene número telefónico registrado.';
                } elseif (! $empresa || ! $empresa->whatsapp_active) {
                    $errores[] = 'El servicio de WhatsApp se encuentra desactivado.';
                } else {
                    $this->notificarBienvenidaWhatsApp($user, $rawPassword);
                    $canalesEnviados[] = 'WhatsApp';
                }
            }

            if (! empty($canalesEnviados)) {
                $mensaje = 'Credenciales enviadas exitosamente por ' . implode(' y ', $canalesEnviados) . '.';
                if (! empty($errores)) {
                    $mensaje .= ' (Nota: ' . implode(' | ', $errores) . ')';
                }

                return back()->with('notification', [
                    'type' => 'success',
                    'message' => $mensaje,
                ]);
            }

            return back()->with('notification', [
                'type' => 'error',
                'message' => 'No se pudo enviar por los canales seleccionados: ' . implode(' | ', $errores),
            ]);
        } catch (\Throwable $e) {
            Log::error("Error en sendCredentials para usuario {$user->id}: " . $e->getMessage());

            return back()->with('notification', [
                'type' => 'error',
                'message' => 'Ocurrió un error inesperado al procesar las credenciales.',
            ]);
        }
    }

    /**
     * Envía correo de bienvenida con credenciales al usuario creado.
     */
    private function notificarBienvenidaEmail(User $user, ?string $rawPassword = null): void
    {
        try {
            if (empty($user->email)) {
                return;
            }

            $user->loadMissing(['roles', 'empresa']);
            $empresa = $user->empresa ?: ($user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first());
            $isPresbitero = $user->hasAnyRole(['Presbitero', 'Presbítero', 'presbitero']);

            $mailService = new MailNotificationService($empresa);

            if ($isPresbitero) {
                $mailService->enviarBienvenidaPresbitero($user, $rawPassword);
            } else {
                $mailService->enviarBienvenidaUsuario($user, $rawPassword);
            }
        } catch (\Throwable $e) {
            Log::error('Error al enviar correo de bienvenida a usuario: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
