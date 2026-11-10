<?php

namespace App\Models;

use App\Traits\HasSpanishActivityLog;
use App\Traits\Multitenantable;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Empresa extends Model
{
    use HasSpanishActivityLog, LogsActivity, Multitenantable;

    protected $table = 'empresas';

    /**
     * Atributos sensibles que no deben exponerse al serializar el modelo a JSON/Inertia.
     *
     * @var list<string>
     */
    protected $hidden = [
        'jaak_api_key',
        'google_smtp_password',
        'mailgun_secret',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logExcept(['jaak_api_key', 'google_smtp_password', 'mailgun_secret'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => static::getSpanishDescription($eventName));
    }

    protected $fillable = [
        'pais_id',
        'razon_social',
        'nombre_comercial',
        'documento',
        'pais_telefono_id',
        'zona_horaria',
        'logo',
        'logo_mini',
        'direccion',
        'latitud',
        'longitud',
        'representante_legal',
        'curp_representante_legal',
        'telefono',
        'email',
        'status',
        'api_key',
        'whatsapp_api_key',
        'whatsapp_api_url',
        'whatsapp_instance',
        'whatsapp_rate_limit',
        'whatsapp_warmup_mode',
        'whatsapp_working_hours_enabled',
        'whatsapp_working_hours_start',
        'whatsapp_working_hours_end',
        'whatsapp_proxy_url',
        'whatsapp_active',
        'whatsapp_phone',
        'whatsapp_status',
        'whatsapp_last_connected',
        'mapbox_api_key',
        'mapbox_active',
        'google_maps_api_key',
        'google_maps_active',
        'control_acceso_base_url',
        'control_acceso_app_token',
        'control_acceso_user_token',
        'control_acceso_active',
        'jaak_api_key',
        'jaak_environment',
        'jaak_active',
        'google_smtp_host',
        'google_smtp_port',
        'google_smtp_encryption',
        'google_smtp_email',
        'google_smtp_password',
        'google_smtp_from_address',
        'google_smtp_from_name',
        'google_smtp_active',
        'mailgun_domain',
        'mailgun_secret',
        'mailgun_endpoint',
        'mailgun_from_address',
        'mailgun_from_name',
        'mailgun_active',
        'mailpit_host',
        'mailpit_port',
        'mailpit_from_address',
        'mailpit_from_name',
        'mailpit_web_port',
        'mailpit_active',
    ];

    protected $casts = [
        'whatsapp_warmup_mode' => 'boolean',
        'whatsapp_working_hours_enabled' => 'boolean',
        'whatsapp_active' => 'boolean',
        'mailpit_active' => 'boolean',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:8',
            'longitud' => 'decimal:8',
            'status' => 'boolean',
            'whatsapp_active' => 'boolean',
            'whatsapp_rate_limit' => 'integer',
            'whatsapp_last_connected' => 'datetime',
            'mapbox_active' => 'boolean',
            'google_maps_active' => 'boolean',
            'control_acceso_active' => 'boolean',
            'jaak_api_key' => 'encrypted',
            'jaak_active' => 'boolean',
            'google_smtp_port' => 'integer',
            'google_smtp_password' => 'encrypted',
            'google_smtp_active' => 'boolean',
            'mailgun_secret' => 'encrypted',
            'mailgun_active' => 'boolean',
            'mailpit_port' => 'integer',
            'mailpit_web_port' => 'integer',
            'mailpit_active' => 'boolean',
        ];
    }

    /**
     * Desencripta atributos cifrados de forma segura sin lanzar error 500
     * si la base de datos fue importada desde otro entorno con distinto APP_KEY.
     *
     * @param  string  $value
     * @return mixed
     */
    public function fromEncryptedString($value)
    {
        if ($value === null || $value === '') {
            return $value;
        }

        try {
            return static::currentEncrypter()->decrypt($value, false);
        } catch (DecryptException) {
            return null;
        }
    }

    /**
     * Get the pais that this empresa belongs to.
     */
    public function pais(): BelongsTo
    {
        return $this->belongsTo(Pais::class);
    }
}
