<?php

namespace App\Http\Middleware;

use App\Services\PublicRegistrationStatus;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsurePublicRegistrationIsActive
{
    public function __construct(private PublicRegistrationStatus $status) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->status->isOpen()) {
            return $next($request);
        }

        if ($request->routeIs('registro-pastor.index')) {
            return Inertia::render('Public/RegistroCerrado')->toResponse($request);
        }

        if ($request->expectsJson() || $request->routeIs(
            'registro-pastor.verificar-cedula',
            'registro-pastor.crear-municipio',
            'registro-pastor.crear-parroquia',
        )) {
            return response()->json([
                'message' => 'El período de registro y actualización se encuentra cerrado.',
                'registro_activo' => false,
            ], 503);
        }

        return redirect()->route('registro-pastor.index');
    }
}
