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
        'grupo_sanguineo',
        'condicion_salud',
        'padece_enfermedad',
        'enfermedades_cronicas',
        'toma_medicamentos',
        'medicamentos_recetados',
        'alergias',
        'contacto_emergencia_nombre',
        'contacto_emergencia_telefono',
        'observaciones_salud',
    ];

    protected $casts = [
        'status' => 'boolean',
        'batizado_espiritu_santo' => 'boolean',
        'pertenece_ministerio' => 'boolean',
        'estudio_teologico' => 'boolean',
        'padece_enfermedad' => 'boolean',
        'toma_medicamentos' => 'boolean',
        'medicamentos_recetados' => 'array',
        'fe_nacimiento' => 'date',
        'edad' => 'integer',
    ];

    protected $appends = ['nombre_completo'];

    /**
     * Generar código de pastor (11 a 15 dígitos):
     * Cédula (sólo números) + Zona (sólo números) + Distrito (sólo números) + ID rellenado a 4 dígitos.
     * Ejemplo: 25212293 + 1 + 1 + 0824 => 25212293110824
     */
    public static function generateCodigo(string $documento, ?string $zona = null, ?string $distrito = null, ?int $id = null): string
    {
        $numericDoc = preg_replace('/\D/', '', $documento);
        if (empty($numericDoc)) {
            $numericDoc = '00000000';
        }

        $numericZona = preg_replace('/\D/', '', (string)$zona) ?: '0';
        $numericDist = preg_replace('/\D/', '', (string)$distrito) ?: '0';

        if (!$id) {
            $id = (int) self::max('id') + 1;
        }

        $idFormatted = sprintf('%04d', $id);

        return $numericDoc . $numericZona . $numericDist . $idFormatted;
    }

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

    public function esConyuge(): bool
    {
        return ! empty($this->conyuge_id);
    }

    public function pastorPrincipal(): BelongsTo
    {
        return $this->belongsTo(Pastor::class, 'conyuge_id');
    }

    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
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

    /**
     * Iglesias / Extensiones asociadas al pastor (o a través del pivot iglesia_pastor).
     */
    public function iglesias()
    {
        return $this->belongsToMany(Iglesia::class, 'iglesia_pastor', 'pastor_id', 'iglesia_id')
                    ->withTimestamps();
    }

    /**
     * Iglesias donde figura como pastor principal en la tabla iglesias.
     */
    public function iglesiasPrincipales()
    {
        return $this->hasMany(Iglesia::class, 'pastor_id');
    }
}
