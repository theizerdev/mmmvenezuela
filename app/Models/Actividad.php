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
     * Obtener la sesión actualmente activa de la actividad.
     * Prioridad:
     * 1. Sesión marcada explícitamente con `is_activa = true`
     * 2. Sesión dentro del rango de hora actual (+/- 2 horas)
     * 3. Primera sesión por orden
     */
    public function getSesionActivaAttribute(): ?ActividadSesion
    {
        $sesiones = $this->relationLoaded('sesiones') ? $this->sesiones : $this->sesiones()->get();

        $marcada = $sesiones->firstWhere('is_activa', true);
        if ($marcada) {
            return $marcada;
        }

        $now = now();
        $porHorario = $sesiones->filter(function ($s) use ($now) {
            $inicio = \Carbon\Carbon::parse($s->fecha_hora_inicio)->subHours(2);
            $fin = \Carbon\Carbon::parse($s->fecha_hora_fin)->addHours(2);
            return $now->between($inicio, $fin);
        })->first();

        return $porHorario ?? $sesiones->first();
    }

    /**
     * Total de pastores únicos que han registrado asistencia a la actividad
     */
    public function totalAsistentesUnicos(): int
    {
        return $this->asistencias()->distinct('pastor_id')->count('pastor_id');
    }
}
