<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencias';

    protected $fillable = [
        'actividad_id',
        'actividad_sesion_id',
        'pastor_id',
        'fecha_registro',
        'metodo',
        'asistio_con_conyuge',
        'nombre_acompanante',
        'comida_entregada',
        'kit_entregado',
        'observaciones',
        'registrado_por_user_id',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'asistio_con_conyuge' => 'boolean',
        'comida_entregada' => 'boolean',
        'kit_entregado' => 'boolean',
    ];

    public function actividad(): BelongsTo
    {
        return $this->belongsTo(Actividad::class);
    }

    public function sesion(): BelongsTo
    {
        return $this->belongsTo(ActividadSesion::class, 'actividad_sesion_id');
    }

    public function pastor(): BelongsTo
    {
        return $this->belongsTo(Pastor::class);
    }

    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_user_id');
    }
}
