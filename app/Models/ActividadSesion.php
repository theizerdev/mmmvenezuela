<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActividadSesion extends Model
{
    use HasFactory;

    protected $table = 'actividad_sesiones';

    protected $fillable = [
        'actividad_id',
        'nombre',
        'fecha_hora_inicio',
        'fecha_hora_fin',
        'es_obligatoria',
        'tipo_comida',
        'orden',
    ];

    protected $casts = [
        'fecha_hora_inicio' => 'datetime',
        'fecha_hora_fin' => 'datetime',
        'es_obligatoria' => 'boolean',
        'orden' => 'integer',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class);
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class);
    }
}
