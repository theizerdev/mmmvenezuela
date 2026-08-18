<?php

use App\Http\Controllers\Admin\EstadoController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/estados', [EstadoController::class, 'index'])->name('estados.index');
    Route::post('/estados', [EstadoController::class, 'store'])->name('estados.store');
    Route::put('/estados/{estado}', [EstadoController::class, 'update'])->name('estados.update');
    Route::post('/estados/{estado}/toggle-status', [EstadoController::class, 'toggleStatus'])->name('estados.toggle-status');
    Route::post('/estados/bulk-destroy', [EstadoController::class, 'bulkDestroy'])->name('estados.bulk-destroy');
});
