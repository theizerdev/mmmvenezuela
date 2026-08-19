<?php

namespace App\Models;

use App\Traits\HasSpanishActivityLog;
use App\Traits\Multitenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Iglesia extends Model
{
    use HasFactory, HasSpanishActivityLog, LogsActivity, Multitenantable;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nombre', 'direccion', 'telefono', 'email', 'pastor_id', 'zona', 'distrito', 'activa', 'miembros_activos'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => static::getSpanishDescription($eventName));
    }

    protected $table = 'iglesias';

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'email',
        'pastor_id',
        'ciudad_id',
        'estado_id',
        'municipio_id',
        'parroquia_id',
        'tipo_local_id',
        'latitud',
        'longitud',
        'zona',
        'distrito',
        'fecha_fundacion',
        'anios_activa',
        'descripcion',
        'activa',
        'miembros_activos',
        'cantidad_campos_blancos',
        'miembro_probante',
        'logros_obtenidos',
        'tiempo_trabajo',
        'sector',
        'calle',
        'avenida',
        'iglesias_fundadas',
        'pastores_ministerio',
        'posee_medio_comunicacion',
        'medio_comunicacion',
        'nombre_medio_comunicacion',
        'donde_medio_comunicacion',
        'documento_path',
        'documento_nombre',
        'documento_size',
        'documento_mime',
        'documento_updated_at',
        'empresa_id',
        'sucursal_id',
        'usuario_registro_id',
    ];

    protected $appends = [
        'documento_url',
    ];

    public function getDocumentoUrlAttribute(): ?string
    {
        if (!$this->documento_path) {
            return null;
        }
        return Storage::url($this->documento_path);
    }

    protected $casts = [
        'activa' => 'boolean',
        'posee_medio_comunicacion' => 'boolean',
        'fecha_fundacion' => 'date',
        'latitud' => 'float',
        'longitud' => 'float',
        'miembros_activos' => 'integer',
        'cantidad_campos_blancos' => 'integer',
        'miembro_probante' => 'integer',
        'iglesias_fundadas' => 'integer',
        'pastores_ministerio' => 'integer',
        'anios_activa' => 'integer',
    ];

    /**
     * Pastor Principal de la Iglesia / Extensión
     */
    public function pastor(): BelongsTo
    {
        return $this->belongsTo(Pastor::class, 'pastor_id');
    }

    /**
     * Estado geográfico
     */
    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'estado_id');
    }

    /**
     * Municipio geográfico
     */
    public function municipio(): BelongsTo
    {
        return $this->belongsTo(Municipio::class, 'municipio_id');
    }

    /**
     * Parroquia geográfica
     */
    public function parroquia(): BelongsTo
    {
        return $this->belongsTo(Parroquia::class, 'parroquia_id');
    }

    /**
     * Empresa / Sede institucional
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    /**
     * Sucursal institucional
     */
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursal::class, 'sucursal_id');
    }

    /**
     * Tipo de Local (Propio, Alquilado, etc.)
     */
    public function tipoLocal(): BelongsTo
    {
        return $this->belongsTo(TipoLocal::class, 'tipo_local_id');
    }

    /**
     * Pastores asociados a la iglesia (Relación M a M)
     */
    public function pastores(): BelongsToMany
    {
        return $this->belongsToMany(Pastor::class, 'iglesia_pastor', 'iglesia_id', 'pastor_id')
                    ->withTimestamps();
    }
}