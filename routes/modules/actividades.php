<?php

use App\Http\Controllers\Admin\ActividadController;
use App\Http\Controllers\Admin\AsistenciaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Rutas de gestión de Actividades
    Route::get('/actividades', [ActividadController::class, 'index'])->name('actividades.index');
    Route::get('/actividades/create', [ActividadController::class, 'create'])->name('actividades.create');
    Route::post('/actividades', [ActividadController::class, 'store'])->name('actividades.store');
    Route::get('/actividades/{actividad}/edit', [ActividadController::class, 'edit'])->name('actividades.edit');
    Route::put('/actividades/{actividad}', [ActividadController::class, 'update'])->name('actividades.update');
    Route::delete('/actividades/{actividad}', [ActividadController::class, 'destroy'])->name('actividades.destroy');

    // Monitor y Estadísticas en Vivo
    Route::get('/actividades/{actividad}/monitor', [ActividadController::class, 'monitor'])->name('actividades.monitor');
    Route::get('/actividades/{actividad}/exportar-asistencia', [AsistenciaController::class, 'export'])->name('asistencias.export');
});
