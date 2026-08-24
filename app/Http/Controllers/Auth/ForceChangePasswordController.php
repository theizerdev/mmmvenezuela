<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ForceChangePasswordController extends Controller
{
    /**
     * Muestra la pantalla obligatoria de cambio de contraseña.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Si el usuario ya actualizó su contraseña, redirigir al panel principal
        if (!$user || !$user->must_change_password) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/ForceChangePassword', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
            ],
            'status' => session('status'),
        ]);
    }

    /**
     * Procesa y valida el cambio obligatorio de contraseña.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $request->validate([
            'password' => [
                'required',
                'string',
                'min:8',
                'max:12',
                'confirmed',
                // Al menos una mayúscula, una minúscula, un número y un símbolo especial
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&._\-])[A-Za-z\d@$!%*#?&._\-]{8,12}$/',
            ],
        ], [
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener un mínimo de 8 caracteres.',
            'password.max' => 'La contraseña no puede exceder los 12 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
            'password.regex' => 'La contraseña debe tener entre 8 y 12 caracteres, e incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial (@, $, !, %, *, #, ?, &, ., _, -).',
        ]);

        $user->update([
            'password' => Hash::make($request->password),
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('notification', [
            'type' => 'success',
            'message' => '¡Contraseña actualizada exitosamente! Bienvenido a su panel.',
        ]);
    }
}
