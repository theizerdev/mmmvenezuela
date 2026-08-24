<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            $exemptRoutes = [
                'password.change.form',
                'password.change.update',
                'logout',
                'profile.layout.update',
                'appearance.edit',
            ];

            $currentRouteName = $request->route() ? $request->route()->getName() : null;

            if ($currentRouteName && in_array($currentRouteName, $exemptRoutes, true)) {
                return $next($request);
            }

            if ($request->is(
                'cambiar-contrasena-obligatoria*',
                'logout',
                'locale',
                'settings/layout*',
                'user/two-factor*',
                'two-factor*',
                'passkeys*',
                '.well-known/passkey*',
                'user/confirm-password*',
                'user/confirmed-password-status'
            )) {
                return $next($request);
            }

            return redirect()->route('password.change.form');
        }

        return $next($request);
    }
}
