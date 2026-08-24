<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\VisitaAccesoController;
use App\Http\Controllers\Auth\ForgotPasswordOtpController;
use App\Http\Controllers\SolicitudDemoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Admin\PastorCarnetController;
use App\Http\Controllers\Public\PastorRegistroPublicoController;

// Landing page pública
Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

// Ruta pública de verificación del carnet mediante escaneo de Código QR
Route::get('/validar-credencial/{codigo}', [PastorCarnetController::class, 'validarCredencial'])->name('pastores.validar-credencial');

// Ruta pública de registro de Pastores y Extensiones (Wizard)
Route::get('/registro', [PastorRegistroPublicoController::class, 'index'])->name('registro-pastor.index');
Route::post('/registro', [PastorRegistroPublicoController::class, 'store'])->name('registro-pastor.store');
Route::get('/registro/verificar-cedula/{cedula}', [PastorRegistroPublicoController::class, 'verificarCedula'])->name('registro-pastor.verificar-cedula');
Route::redirect('/registro-pastor', '/registro');


Route::middleware(['guest'])->group(function () {
    Route::get('/forgot-password', [ForgotPasswordOtpController::class, 'show'])->name('password.request');
    Route::post('/forgot-password/send-otp', [ForgotPasswordOtpController::class, 'sendOtp'])->name('password.send-otp');
    Route::post('/forgot-password/verify-otp', [ForgotPasswordOtpController::class, 'verifyOtp'])->name('password.verify-otp');
    Route::post('/forgot-password/reset', [ForgotPasswordOtpController::class, 'resetPassword'])->name('password.otp-reset');
});

Route::post('locale', function (Request $request) {
    $request->validate([
        'locale' => 'required|in:en,es',
    ]);

    session(['locale' => $request->locale]);

    return back();
})->name('locale.update');

use App\Http\Controllers\Auth\ForceChangePasswordController;

Route::middleware(['auth'])->group(function () {
    Route::get('/cambiar-contrasena-obligatoria', [ForceChangePasswordController::class, 'show'])->name('password.change.form');
    Route::post('/cambiar-contrasena-obligatoria', [ForceChangePasswordController::class, 'update'])->name('password.change.update');
});

Route::middleware(['auth','verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')->can('dashboard.view');
});


if (file_exists(__DIR__.'/larareact-settings.php')) {
    require __DIR__.'/larareact-settings.php';
}
