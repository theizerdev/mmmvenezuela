<?php

use App\Http\Controllers\Admin\MunicipioController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/municipios', [MunicipioController::class, 'index'])->name('municipios.index');
    Route::post('/municipios', [MunicipioController::class, 'store'])->name('municipios.store');
    Route::put('/municipios/{municipio}', [MunicipioController::class, 'update'])->name('municipios.update');
    Route::post('/municipios/{municipio}/toggle-status', [MunicipioController::class, 'toggleStatus'])->name('municipios.toggle-status');
    Route::post('/municipios/bulk-destroy', [MunicipioController::class, 'bulkDestroy'])->name('municipios.bulk-destroy');
});
