<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Pais;
use App\Models\Sucursal;
use App\Models\User;
use App\Services\WhatsAppService;
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
            'password' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:255',
            'pais_telefono_id' => 'nullable|exists:pais,id',
            'status' => ['required', Rule::in(['activo', 'inactivo', 'suspendido'])],
            'empresa_id' => 'nullable|exists:empresas,id',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'zona' => 'nullable|string|max:255',
            'distrito' => 'nullable|string|max:255',
            'roles' => 'array',
        ]);

        try {
            $rawPassword = $validated['password'];
            $validated['password'] = Hash::make($validated['password']);
            $user = User::create($validated);

            if (isset($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            }

            // Enviar mensaje de bienvenida por WhatsApp si tiene teléfono
            $this->notificarBienvenidaWhatsApp($user, $rawPassword);

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
            'password' => 'nullable|string|min:8',
            'telefono' => 'nullable|string|max:255',
            'pais_telefono_id' => 'nullable|exists:pais,id',
            'status' => ['required', Rule::in(['activo', 'inactivo', 'suspendido'])],
            'empresa_id' => 'nullable|exists:empresas,id',
            'sucursal_id' => 'nullable|exists:sucursales,id',
            'zona' => 'nullable|string|max:255',
            'distrito' => 'nullable|string|max:255',
            'roles' => 'array',
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
                $mensaje = "👋 *¡Bienvenido al Sistema Ministerial MMM Venezuela!*\n\n"
                         . "Estimado Presbítero *{$user->name}*,\n\n"
                         . "Se ha configurado exitosamente su cuenta de acceso institucional con el rol de *Presbítero*.\n\n"
                         . "📍 *Asignación:*\n"
                         . "• *Zona:* " . ($user->zona ?: 'Sin asignar') . "\n"
                         . "• *Distrito:* " . ($user->distrito ?: 'Sin asignar') . "\n\n"
                         . "🔐 *Sus credenciales de acceso:*\n"
                         . "• *Usuario / Correo:* {$user->email}\n"
                         . ($rawPassword ? "• *Contraseña:* {$rawPassword}\n" : "") . "\n"
                         . "🌐 *Enlace para ingresar al sistema:*\n"
                         . "{$loginUrl}\n\n"
                         . "Desde su panel administrativo podrá dar seguimiento a las fichas ministeriales de los obreros a su cargo, consultar iglesias y recibir notificaciones automáticas cada vez que un pastor complete su registro.\n\n"
                         . "_Por seguridad, le recomendamos cambiar su contraseña tras el primer inicio de sesión._";
            } else {
                $mensaje = "👋 *¡Bienvenido a la Plataforma MMM Venezuela!*\n\n"
                         . "Estimado(a) *{$user->name}*,\n\n"
                         . "Se ha configurado su cuenta de acceso institucional a la plataforma administrativa.\n\n"
                         . "📋 *Detalles de su cuenta:*\n"
                         . "• *Rol asignado:* " . ($rolesList ?: 'Usuario del Sistema') . "\n"
                         . ($user->empresa ? "• *Institución:* {$user->empresa->razon_social}\n" : "")
                         . ($user->sucursal ? "• *Sede:* {$user->sucursal->nombre}\n" : "") . "\n"
                         . "🔐 *Sus credenciales de acceso:*\n"
                         . "• *Usuario / Correo:* {$user->email}\n"
                         . ($rawPassword ? "• *Contraseña:* {$rawPassword}\n" : "") . "\n"
                         . "🌐 *Enlace para ingresar al sistema:*\n"
                         . "{$loginUrl}\n\n"
                         . "Ya puede ingresar para acceder a los módulos y herramientas correspondientes a sus funciones.\n\n"
                         . "_Por seguridad, le recomendamos mantener sus credenciales en resguardo y cambiar su contraseña periódicamente._";
            }

            $whatsappService = new WhatsAppService($empresa);
            $whatsappService->sendMessage($user->telefono, $mensaje);
        } catch (\Throwable $e) {
            Log::error('Error al enviar WhatsApp de bienvenida a usuario: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

            $whatsappService = new WhatsAppService($empresa);
            $whatsappService->sendMessage($user->telefono, $mensaje);
        } catch (\Throwable $e) {
            Log::error('Error al enviar WhatsApp de bienvenida a usuario: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
