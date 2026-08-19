<?php

use App\Http\Controllers\Admin\ActivityMonitoringController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/monitoring/activities', [ActivityMonitoringController::class, 'index'])
        ->name('monitoring.activities.index')
        ->can('monitoreo.activities');
});
