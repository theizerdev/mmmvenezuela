<?php

namespace App\Jobs;

use App\Models\Empresa;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $phone;

    public string $template;

    public array $variables;

    public ?int $empresaId;

    public ?string $mediaUrl;

    public ?string $caption;

    /**
     * Número de reintentos
     */
    public int $tries = 2;

    public function __construct(string $phone, string $template, array $variables = [], ?int $empresaId = null, ?string $mediaUrl = null, ?string $caption = null)
    {
        $this->phone = $phone;
        $this->template = $template;
        $this->variables = $variables;
        $this->empresaId = $empresaId;
        $this->mediaUrl = $mediaUrl;
        $this->caption = $caption;
    }

    public function handle(): void
    {
        $empresa = $this->empresaId ? Empresa::find($this->empresaId) : null;
        $whatsapp = new WhatsAppService($empresa);

        // 1. Validar si el número existe en WhatsApp
        $check = $whatsapp->checkNumber($this->phone);
        if ($check && isset($check['exists']) && ! $check['exists']) {
            Log::warning("⚠️ Número {$this->phone} no registrado en WhatsApp. Envío omitido.");

            return;
        }

        // 2. Enviar con Spintax y encolado seguro en el motor de WhatsApp
        if ($this->mediaUrl) {
            $result = $whatsapp->sendMedia(
                $this->phone,
                $this->mediaUrl,
                $this->caption ?? $this->template,
                $this->variables,
                false
            );
        } else {
            $result = $whatsapp->sendText(
                $this->phone,
                $this->template,
                $this->variables,
                false
            );
        }

        Log::info('📨 Notificación WhatsApp procesada vía Job:', [
            'to' => $this->phone,
            'result' => $result,
        ]);
    }
}
