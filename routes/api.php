<?php

use App\Http\Controllers\Api\AsistenciaApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Terminal de Asistencia Móvil (Público / Sin Login)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // 1. Obtener actividades activas y sesiones
    Route::get('/actividades/activas', [AsistenciaApiController::class, 'actividadesActivas']);

    // 2. Buscar pastor por cédula o código QR (con detalles de extensión y cónyuge)
    Route::get('/pastores/buscar', [AsistenciaApiController::class, 'buscarPastor']);

    // 3. Registrar asistencia (Modo QR o Modo Manual con switch de cónyuge)
    Route::post('/asistencias/registrar', [AsistenciaApiController::class, 'registrarAsistencia']);

    // 4. Obtener últimos escaneos de la actividad
    Route::get('/actividades/{actividad}/ultimos-escaneos', [AsistenciaApiController::class, 'ultimosEscaneos']);
});

