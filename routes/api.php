<?php

use App\Http\Controllers\Api\AsistenciaApiController;
use App\Http\Controllers\Api\PresbiterioApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema de Asistencia y Liderazgo MMM Venezuela
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // ----------------------------------------------------------------------
    // 1. ZONA PÚBLICA (KIOSCO OPERATIVO: ES CANEO QR Y BÚSQUEDA MANUAL)
    // ----------------------------------------------------------------------
    Route::get('/actividades/activas', [AsistenciaApiController::class, 'actividadesActivas']);
    Route::get('/actividades', [AsistenciaApiController::class, 'actividadesActivas']);
    Route::get('/pastores/buscar', [AsistenciaApiController::class, 'buscarPastor']);
    Route::post('/asistencias/registrar', [AsistenciaApiController::class, 'registrarAsistencia']);
    Route::get('/actividades/{actividad}/ultimos-escaneos', [AsistenciaApiController::class, 'ultimosEscaneos']);

    // ----------------------------------------------------------------------
    // 2. AUTENTICACIÓN PARA LIDERAZGO (PRESBÍTEROS Y SUPERVISORES)
    // ----------------------------------------------------------------------
    Route::post('/auth/login', [PresbiterioApiController::class, 'login']);

    // ----------------------------------------------------------------------
    // 3. RUTAS PROTEGIDAS CON SANCTUM (DASHBOARDS EJECUTIVOS Y PUSH TOKENS)
    // ----------------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [PresbiterioApiController::class, 'logout']);
        Route::post('/auth/push-settings', [PresbiterioApiController::class, 'updatePushSettings']);

        // Dashboard para Presbíteros (filtrado por su zona con lista de presentes y ausentes)
        Route::get('/presbitero/dashboard', [PresbiterioApiController::class, 'presbiteroDashboard']);

        // Dashboard para Supervisor Nacional (resumen consolidado país y ranking de zonas)
        Route::get('/supervisor/dashboard', [PresbiterioApiController::class, 'supervisorDashboard']);
    });
});
