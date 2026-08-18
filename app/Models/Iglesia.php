<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\Multitenantable;

class Iglesia extends Model
{
    use HasFactory, LogsActivity, Multitenantable;

    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'email',
        'pastor_id',
        'empresa_id',
        'sucursal_id',
        'ciudad_id',
        'estado_id',
        'municipio_id',
        'parroquia_id',
        'tipo_local_id',
        'latitud',
        'longitud',
        'zona',
        'distrito',
        'sector',
        'calle',
        'avenida',
        'fecha_fundacion',
        'anios_activa',
        'descripcion',
        'activa',
        'miembros_activos',
        'cantidad_campos_blancos',
        'miembro_probante',
        'logros_obtenidos',
        'tiempo_trabajo',
        'iglesias_fundadas',
        'pastores_ministerio',
        'posee_medio_comunicacion',
        'medio_comunicacion',
        'nombre_medio_comunicacion',
        'donde_medio_comunicacion',
        'usuario_registro_id',
    ];

    protected $casts = [
        'activa' => 'boolean',
        'posee_medio_comunicacion' => 'boolean',
        'fecha_fundacion' => 'date',
        'latitud' => 'decimal:8',
        'longitud' => 'decimal:8',
        'miembros_activos' => 'integer',
        'cantidad_campos_blancos' => 'integer',
        'miembro_probante' => 'integer',
        'iglesias_fundadas' => 'integer',
        'pastores_ministerio' => 'integer',
        'anios_activa' => 'integer',
        'medio_comunicacion' => 'array',
    ];

    /**
     * Relación con tipo de local
     */
    public function tipoLocal()
    {
        return $this->belongsTo(TipoLocal::class);
    }

    /**
     * Relación con el pastor principal
     */
    public function pastor()
    {
        return $this->belongsTo(Pastor::class);
    }

    /**
     * Relación con empresa
     */
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    /**
     * Relación con sucursal
     */
    public function sucursal()
    {
        return $this->belongsTo(Sucursal::class);
    }

    /**
     * Relación con ciudad
     */
    public function ciudad()
    {
        return $this->belongsTo(Ciudad::class);
    }

    /**
     * Relación con estado
     */
    public function estado()
    {
        return $this->belongsTo(Estado::class);
    }

    /**
     * Relación con municipio
     */
    public function municipio()
    {
        return $this->belongsTo(Municipio::class);
    }

    /**
     * Relación con parroquia
     */
    public function parroquia()
    {
        return $this->belongsTo(Parroquia::class);
    }

    /**
     * Relación con el usuario que registró la iglesia
     */
    public function usuarioRegistro()
    {
        return $this->belongsTo(User::class, 'usuario_registro_id');
    }

    /**
     * Relación con documentos de la iglesia
     */
    public function documentos()
    {
        return $this->hasMany(DocumentoIglesia::class);
    }

    /**
     * Relación con inventario de la iglesia
     */
    public function inventario()
    {
        return $this->hasMany(InventarioIglesia::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Mutador para calcular automáticamente los años activa
     * cuando se establece la fecha de fundación
     */
    public function setFechaFundacionAttribute($value)
    {
        $this->attributes['fecha_fundacion'] = $value;
        
        if ($value) {
            $fechaFundacion = \Carbon\Carbon::parse($value);
            
            // Asegurarse de que la fecha no sea futura
            if ($fechaFundacion->isFuture()) {
                $this->attributes['anios_activa'] = 0;
                return;
            }
            
            $anios = (int) $fechaFundacion->diffInYears(\Carbon\Carbon::now());
            $this->attributes['anios_activa'] = abs($anios); // Valor absoluto para asegurar positivo
        } else {
            $this->attributes['anios_activa'] = null;
        }
    }

    /**
     * Accesor para obtener los años activa con formato
     */
    public function getAniosActivaFormateadoAttribute()
    {
        if (!$this->anios_activa) {
            return '0';
        }
        
        return (string) $this->anios_activa;
    }
}