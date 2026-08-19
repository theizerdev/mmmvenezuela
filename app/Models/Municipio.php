<?php

namespace App\Models;

use App\Traits\HasSpanishActivityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Municipio extends Model
{
    use HasFactory, HasSpanishActivityLog, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => static::getSpanishDescription($eventName));
    }

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

    /**
     * Get the parroquias for the municipio.
     */
    public function parroquias(): HasMany
    {
        return $this->hasMany(Parroquia::class, 'municipio_id');
    }
}
