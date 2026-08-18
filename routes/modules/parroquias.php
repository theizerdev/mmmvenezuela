<?php

use App\Http\Controllers\Admin\ParroquiaController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/parroquias', [ParroquiaController::class, 'index'])->name('parroquias.index');
    Route::post('/parroquias', [ParroquiaController::class, 'store'])->name('parroquias.store');
    Route::put('/parroquias/{parroquia}', [ParroquiaController::class, 'update'])->name('parroquias.update');
    Route::post('/parroquias/{parroquia}/toggle-status', [ParroquiaController::class, 'toggleStatus'])->name('parroquias.toggle-status');
    Route::post('/parroquias/bulk-destroy', [ParroquiaController::class, 'bulkDestroy'])->name('parroquias.bulk-destroy');
});
