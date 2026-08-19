<?php

use App\Http\Controllers\Admin\ActivityMonitoringController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/monitoring/activities', [ActivityMonitoringController::class, 'index'])
        ->name('monitoring.activities.index')
        ->can('monitoreo.activities');

    Route::get('/monitoring/activities/export', [ActivityMonitoringController::class, 'export'])
        ->name('monitoring.activities.export')
        ->can('monitoreo.activities');

    Route::delete('/monitoring/activities/clear', [ActivityMonitoringController::class, 'clear'])
        ->name('monitoring.activities.clear')
        ->can('monitoreo.activities');
});
