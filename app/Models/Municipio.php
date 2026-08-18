<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Municipio extends Model
{
    use HasFactory;

    protected $table = 'municipios';

    protected $fillable = [
        'estado_id',
        'nombre',
        'codigo',
        'capital',
        'latitud',
        'longitud',
        'activo',
    ];

    protected $casts = [
        'latitud' => 'float',
        'longitud' => 'float',
        'activo' => 'boolean',
    ];

    /**
     * Get the estado that owns the municipio.
     */
    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }
}
