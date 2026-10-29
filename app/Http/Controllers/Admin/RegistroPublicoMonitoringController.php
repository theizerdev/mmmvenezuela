<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PublicRegistrationStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistroPublicoMonitoringController extends Controller
{
    public function index(PublicRegistrationStatus $status): Response
    {
        return Inertia::render('admin/monitoring/registration/index', [
            'is_active' => $status->isOpen(),
            'registration_url' => url('/registro'),
        ]);
    }

    public function update(Request $request, PublicRegistrationStatus $status): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $isActive = (bool) $validated['is_active'];
        $status->setOpen($isActive);

        return back()->with('notification', [
            'type' => 'success',
            'message' => $isActive
                ? 'El registro público de pastores está activo.'
                : 'El registro público de pastores se cerró correctamente.',
        ]);
    }
}
