<?php

namespace App\Models;

use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Actividad extends Model
{
    use HasFactory, Multitenantable;

    protected $table = 'actividades';

    protected $attributes = [
        'empresa_id' => 1,
        'sucursal_id' => 1,
        'estado' => 'planificada',
        'tipo' => 'Convención',
        'permite_conyuge' => true,
        'controla_comida' => false,
    ];

    protected $fillable = [
        'empresa_id',
        'sucursal_id',
        'nombre',
        'descripcion',
        'tipo',
        'fecha_inicio',
        'fecha_fin',
        'lugar',
        'zona',
        'distrito',
        'estado',
        'permite_conyuge',
        'controla_comida',
        'capacidad_maxima',
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'permite_conyuge' => 'boolean',
        'controla_comida' => 'boolean',
        'capacidad_maxima' => 'integer',
    ];

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class);
    }

    public function sesiones(): HasMany
    {
        return $this->hasMany(ActividadSesion::class)->orderBy('orden')->orderBy('fecha_hora_inicio');
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class);
    }

    /**
     * Total de pastores únicos que han registrado asistencia a la actividad
     */
    public function totalAsistentesUnicos(): int
    {
        return $this->asistencias()->distinct('pastor_id')->count('pastor_id');
    }
}
