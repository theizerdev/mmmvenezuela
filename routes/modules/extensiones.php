<?php

use App\Http\Controllers\Admin\ExtensionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/extensiones/dashboard', [ExtensionController::class, 'dashboard'])->name('extensiones.dashboard');
    Route::get('/extensiones', [ExtensionController::class, 'index'])->name('extensiones.index');
    Route::get('/extensiones/create', [ExtensionController::class, 'create'])->name('extensiones.create');
    Route::post('/extensiones', [ExtensionController::class, 'store'])->name('extensiones.store');
    Route::get('/extensiones/{extension}/edit', [ExtensionController::class, 'edit'])->name('extensiones.edit');
    Route::put('/extensiones/{extension}', [ExtensionController::class, 'update'])->name('extensiones.update');
    Route::post('/extensiones/verify-security', [ExtensionController::class, 'verifySecurity'])->name('extensiones.verify-security');
    Route::post('/extensiones/{extension}/documento', [ExtensionController::class, 'uploadDocumento'])->name('extensiones.upload-documento');
    Route::delete('/extensiones/{extension}/documento', [ExtensionController::class, 'deleteDocumento'])->name('extensiones.delete-documento');

    Route::delete('/extensiones/{extension}', [ExtensionController::class, 'destroy'])->name('extensiones.destroy');
    Route::post('/extensiones/bulk-destroy', [ExtensionController::class, 'destroy'])->name('extensiones.bulk-destroy');

    // Aliases para iglesias
    Route::get('/iglesias', [ExtensionController::class, 'index'])->name('iglesias.index');
    Route::get('/iglesias/create', [ExtensionController::class, 'create'])->name('iglesias.create');
});
