<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Estado extends Model
{
    protected $table = 'estados';

    protected $fillable = [
        'pais_id',
        'nombre',
        'codigo',
        'capital',
        'latitud',
        'longitud',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'float',
            'longitud' => 'float',
            'activo' => 'boolean',
        ];
    }

    /**
     * Get the country that the state belongs to.
     */
    public function pais(): BelongsTo
    {
        return $this->belongsTo(Pais::class, 'pais_id');
    }

    /**
     * Get the municipios for the estado.
     */
    public function municipios(): HasMany
    {
        return $this->hasMany(Municipio::class, 'estado_id');
    }
}
