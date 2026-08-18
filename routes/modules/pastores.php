<?php

use App\Http\Controllers\Admin\PastorController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/pastores', [PastorController::class, 'index'])->name('pastores.index');
    Route::get('/pastores/create', [PastorController::class, 'create'])->name('pastores.create');
    Route::post('/pastores', [PastorController::class, 'store'])->name('pastores.store');
    Route::get('/pastores/{pastore}/edit', [PastorController::class, 'edit'])->name('pastores.edit');
    Route::put('/pastores/{pastore}', [PastorController::class, 'update'])->name('pastores.update');
    Route::post('/pastores/{pastore}/toggle-status', [PastorController::class, 'toggleStatus'])->name('pastores.toggle-status');
    Route::post('/pastores/bulk-destroy', [PastorController::class, 'bulkDestroy'])->name('pastores.bulk-destroy');
});
