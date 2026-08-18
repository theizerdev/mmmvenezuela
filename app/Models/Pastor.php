<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pastor extends Model
{
    use HasFactory;

    protected $table = 'pastores';

    protected $fillable = [
        'codigo',
        'nombres',
        'apellidos',
        'documento',
        'genero',
        'edad',
        'fe_nacimiento',
        'foto',
        'estado_civil',
        'nombre_conyuge',
        'conyuge_id',
        'nivel_ministerial',
        'zona',
        'distrito',
        'ano_promocion',
        'tiempo_colaborando',
        'batizado_espiritu_santo',
        'pertenece_ministerio',
        'cargo_nacional',
        'mencion',
        'nota',
        'grado_instruccion',
        'titulo_obtenido',
        'estudio_teologico',
        'titulo_teologico',
        'tiempo_de_estudio_teologico',
        'instituto_teologico',
        'edificio_casa_quinta',
        'piso',
        'apartamento',
        'calle_avenida',
        'urbanizacion',
        'estado_id',
        'municipio_id',
        'parroquia_id',
        'municipio',
        'telefono_hab',
        'telefono_tlf',
        'telefono_otro',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'batizado_espiritu_santo' => 'boolean',
        'pertenece_ministerio' => 'boolean',
        'estudio_teologico' => 'boolean',
        'fe_nacimiento' => 'date',
        'edad' => 'integer',
    ];

    protected $appends = ['nombre_completo'];

    /**
     * Obtenedor del nombre completo.
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombres} {$this->apellidos}");
    }

    /**
     * Relación con el cónyuge pastor (si aplica).
     */
    public function conyuge(): BelongsTo
    {
        return $this->belongsTo(Pastor::class, 'conyuge_id');
    }

    /**
     * Relaciones Territoriales.
     */
    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    public function municipioModel(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    public function parroquia(): BelongsTo
    {
        return $this->belongsTo(Parroquia::class, 'parroquia_id');
    }
}
