<?php

namespace App\Models;

use App\Traits\HasSpanishActivityLog;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Pastor extends Model
{
    use HasFactory, HasSpanishActivityLog, LogsActivity, Multitenantable;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => static::getSpanishDescription($eventName));
    }

    protected $table = 'pastores';

    protected $attributes = [
        'empresa_id' => 1,
        'sucursal_id' => 1,
        'status' => true,
    ];

    protected $fillable = [
        'codigo',
        'empresa_id',
        'sucursal_id',
        'nombres',
        'apellidos',
        'documento',
        'genero',
        'edad',
        'fe_nacimiento',
        'foto',
        'foto_cedula',
        'email',
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

    protected $appends = ['nombre_completo', 'nombre_carnet', 'foto_url', 'foto_cedula_url', 'extension_nombre', 'extension_estado'];

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

        $numericZona = ltrim(preg_replace('/\D/', '', (string)$zona) ?: '0', '0') ?: '0';
        $numericDist = ltrim(preg_replace('/\D/', '', (string)$distrito) ?: '0', '0') ?: '0';

        if (!$id) {
            $id = (int) self::max('id') + 1;
        }

        $idFormatted = sprintf('%04d', $id);

        return $numericDoc . $numericZona . $numericDist . $idFormatted;
    }

    /**
     * Mutador para asegurar que la zona se almacene como entero sin ceros a la izquierda (ej. 01 -> 1).
     */
    public function setZonaAttribute($value): void
    {
        if ($value === null || trim((string) $value) === '') {
            $this->attributes['zona'] = null;
        } else {
            $clean = preg_replace('/\D/', '', (string) $value);
            $this->attributes['zona'] = $clean !== '' ? (string) (int) $clean : trim((string) $value);
        }
    }

    /**
     * Obtenedor del nombre completo.
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim("{$this->nombres} {$this->apellidos}");
    }

    /**
     * Obtenedor del nombre optimizado y formateado para el carnet ministerial oficial.
     */
    public function getNombreCarnetAttribute(): string
    {
        return \App\Services\CarnetService::formatearNombreCarnet($this->nombres, $this->apellidos);
    }

    /**
     * URL pública de la foto del pastor para vistas e impresiones.
     */
    public function getFotoUrlAttribute(): ?string
    {
        if (!$this->foto) {
            return null;
        }

        $trimmed = trim($this->foto);
        if (!$trimmed) {
            return null;
        }

        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        // Si viene con prefijo storage/pastores, normalizar a /pastores/
        if (str_starts_with($trimmed, 'storage/pastores/')) {
            $trimmed = substr($trimmed, strlen('storage/'));
        } elseif (str_starts_with($trimmed, '/storage/pastores/')) {
            $trimmed = substr($trimmed, strlen('/storage/'));
        }

        if (str_starts_with($trimmed, 'storage/')) {
            return '/' . $trimmed;
        }

        if (str_starts_with($trimmed, 'pastores/')) {
            return '/' . $trimmed;
        }

        if (str_starts_with($trimmed, '/')) {
            return $trimmed;
        }

        // Por defecto para archivos guardados en public/pastores/
        $cleanName = basename($trimmed);

        // Si el archivo exacto no existe en disco, buscar coincidencias por código o cédula
        $directPath = public_path('pastores/' . $cleanName);
        if (!file_exists($directPath)) {
            $cleanCodigo = preg_replace('/\D/', '', (string)($this->codigo ?? ''));
            $cleanDoc = preg_replace('/\D/', '', (string)($this->documento ?? ''));
            $patterns = array_filter([
                $cleanCodigo ? public_path("pastores/pastor_{$cleanCodigo}_*") : null,
                $cleanDoc ? public_path("pastores/pastor_{$cleanDoc}_*") : null,
            ]);
            foreach ($patterns as $pattern) {
                $matches = glob($pattern);
                if ($matches && count($matches) > 0) {
                    usort($matches, fn($a, $b) => filemtime($b) <=> filemtime($a));
                    return '/pastores/' . basename($matches[0]);
                }
            }
        }

        return '/pastores/' . $cleanName;
    }

    /**
     * URL pública de la foto de la cédula del pastor.
     */
    public function getFotoCedulaUrlAttribute(): ?string
    {
        if (!$this->foto_cedula) {
            return null;
        }

        $trimmed = trim($this->foto_cedula);
        if (!$trimmed) {
            return null;
        }

        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'http://') || str_starts_with($trimmed, 'https://')) {
            return $trimmed;
        }

        if (str_starts_with($trimmed, 'storage/')) {
            return '/' . $trimmed;
        }

        if (str_starts_with($trimmed, 'pastores_cedulas/')) {
            if (file_exists(public_path($trimmed))) {
                return '/' . $trimmed;
            }
            return '/storage/' . $trimmed;
        }

        if (str_starts_with($trimmed, '/')) {
            return $trimmed;
        }

        if (file_exists(public_path('pastores_cedulas/' . $trimmed))) {
            return '/pastores_cedulas/' . $trimmed;
        }

        return '/storage/pastores_cedulas/' . $trimmed;
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

    /**
     * Nombre de la extensión / iglesia donde labora el pastor (para credenciales y visualización).
     */
    public function getExtensionNombreAttribute(): ?string
    {
        // 1. Iglesia donde figura como pastor titular o principal
        $principal = $this->relationLoaded('iglesiasPrincipales')
            ? $this->iglesiasPrincipales->first()
            : $this->iglesiasPrincipales()->first();

        if ($principal && !empty($principal->nombre)) {
            return trim($principal->nombre);
        }

        // 2. Iglesia asignada a través de la tabla pivote (iglesia_pastor)
        $pivot = $this->relationLoaded('iglesias')
            ? $this->iglesias->first()
            : $this->iglesias()->first();

        if ($pivot && !empty($pivot->nombre)) {
            return trim($pivot->nombre);
        }

        // 3. Heredada del cónyuge ministerial
        if ($this->conyuge_id) {
            $conyuge = $this->relationLoaded('conyuge')
                ? $this->conyuge
                : $this->conyuge()->with(['iglesiasPrincipales', 'iglesias'])->first();

            if ($conyuge) {
                $cPrincipal = $conyuge->relationLoaded('iglesiasPrincipales')
                    ? $conyuge->iglesiasPrincipales->first()
                    : $conyuge->iglesiasPrincipales()->first();

                if ($cPrincipal && !empty($cPrincipal->nombre)) {
                    return trim($cPrincipal->nombre);
                }

                $cPivot = $conyuge->relationLoaded('iglesias')
                    ? $conyuge->iglesias->first()
                    : $conyuge->iglesias()->first();

                if ($cPivot && !empty($cPivot->nombre)) {
                    return trim($cPivot->nombre);
                }
            }
        }

        return null;
    }

    /**
     * Nombre del Estado al que pertenece la extensión / iglesia donde labora el pastor.
     */
    public function getExtensionEstadoAttribute(): ?string
    {
        // 1. Obtener la iglesia principal o asignada del pastor
        $iglesia = null;
        if ($this->relationLoaded('iglesiasPrincipales') ? $this->iglesiasPrincipales->isNotEmpty() : $this->iglesiasPrincipales()->exists()) {
            $iglesia = $this->relationLoaded('iglesiasPrincipales') ? $this->iglesiasPrincipales->first() : $this->iglesiasPrincipales()->first();
        }
        if (!$iglesia) {
            if ($this->relationLoaded('iglesias') ? $this->iglesias->isNotEmpty() : $this->iglesias()->exists()) {
                $iglesia = $this->relationLoaded('iglesias') ? $this->iglesias->first() : $this->iglesias()->first();
            }
        }
        if (!$iglesia && $this->conyuge_id) {
            $conyuge = $this->relationLoaded('conyuge') ? $this->conyuge : $this->conyuge()->with(['iglesiasPrincipales', 'iglesias'])->first();
            if ($conyuge) {
                $iglesia = ($conyuge->relationLoaded('iglesiasPrincipales') && $conyuge->iglesiasPrincipales->isNotEmpty())
                    ? $conyuge->iglesiasPrincipales->first()
                    : ($conyuge->relationLoaded('iglesias') && $conyuge->iglesias->isNotEmpty()
                        ? $conyuge->iglesias->first()
                        : ($conyuge->iglesiasPrincipales()->first() ?? $conyuge->iglesias()->first()));
            }
        }

        if ($iglesia) {
            // Verificar si la dirección física indica explícitamente el Estado (evita desajustes de geocodificación)
            $dir = $iglesia->direccion ?? '';
            if (!empty($dir)) {
                if (preg_match('/Estado\s+([^,]+)/i', $dir, $matches)) {
                    $candidate = trim($matches[1]);
                    if (stripos($candidate, 'Vargas') !== false) {
                        return 'La Guaira';
                    }
                    $estadoEncontrado = Estado::where('nombre', 'like', $candidate)->first();
                    if ($estadoEncontrado) {
                        return $estadoEncontrado->nombre;
                    }
                }
                if (stripos($dir, 'Distrito Capital') !== false || stripos($dir, 'Caracas') !== false) {
                    return 'Distrito Capital';
                }
            }

            // Si la iglesia tiene relación estado cargada
            if ($iglesia->relationLoaded('estado') && $iglesia->estado) {
                return $iglesia->estado->nombre;
            } elseif ($iglesia->estado_id) {
                $est = Estado::find($iglesia->estado_id);
                if ($est) {
                    return $est->nombre;
                }
            }
        }

        // Fallback al estado del pastor
        if ($this->relationLoaded('estado') && $this->estado) {
            return $this->estado->nombre;
        } elseif ($this->estado_id) {
            $est = Estado::find($this->estado_id);
            if ($est) {
                return $est->nombre;
            }
        }

        return null;
    }

    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class);
    }
}
