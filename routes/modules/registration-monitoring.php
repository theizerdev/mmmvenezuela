<?php

use App\Http\Controllers\Admin\RegistroPublicoMonitoringController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'can:monitoreo.view'])->group(function () {
    Route::get('/monitoring/registration', [RegistroPublicoMonitoringController::class, 'index'])
        ->name('monitoring.registration.index');
    Route::put('/monitoring/registration', [RegistroPublicoMonitoringController::class, 'update'])
        ->name('monitoring.registration.update');
});
