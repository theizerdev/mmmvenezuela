<?php

namespace App\Http\Controllers;

use App\Models\Empresa;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function handleIncoming(Request $request)
    {
        $event = $request->input('event');
        $instanceName = $request->input('instanceName');
        $data = $request->input('data', []);

        Log::info("📥 Webhook WhatsApp Recibido [{$event}]:", [
            'instance' => $instanceName,
            'event' => $event,
            'data' => $data,
        ]);

        // 🛑 1. Manejo Automático de Bajas (Opt-Out)
        if ($event === 'contact.opt_out') {
            $phone = $data['phone'] ?? null;
            if ($phone) {
                $cleanDigits = preg_replace('/\D/', '', $phone);
                $lastDigits = substr($cleanDigits, -10);

                // Marcar al usuario en Laravel como desuscrito
                User::where(function ($query) use ($cleanDigits, $lastDigits) {
                    $query->where('telefono', 'like', "%{$lastDigits}%")
                        ->orWhere('telefono', 'like', "%{$cleanDigits}%");
                })->update([
                    'whatsapp_opt_out' => true,
                    'whatsapp_unsubscribed_at' => now(),
                ]);

                // Registrar en la blacklist del servicio
                $empresa = Empresa::where('whatsapp_instance', $instanceName)->first();
                $whatsapp = new WhatsAppService($empresa);
                $whatsapp->addToBlacklist($phone, 'OPT_OUT_WEBHOOK', $instanceName);

                Log::alert("🛑 Usuario desuscrito de WhatsApp: {$phone} (Instancia: {$instanceName})");
            }

            return response()->json(['status' => 'opt_out_recorded']);
        }

        // 💬 2. Mensajes Normales Recibidos
        if ($event === 'message.received') {
            $from = $data['from'] ?? '';
            $body = trim($data['body'] ?? '');

            Log::info("💬 Mensaje WhatsApp recibido de {$from}: {$body}");

            // Registrar mensaje entrante si existe modelo WhatsAppMessage
            try {
                \App\Models\WhatsAppMessage::create([
                    'message_id' => $data['id'] ?? $data['key']['id'] ?? null,
                    'recipient_phone' => preg_replace('/\D/', '', $from),
                    'message_content' => $body,
                    'status' => 'delivered',
                    'direction' => 'inbound',
                    'sent_at' => now(),
                ]);
            } catch (\Throwable $e) {
                // Silencioso si falla
            }

            // Respuestas automáticas / Menú básico
            if (strtolower($body) === 'menu') {
                $empresa = Empresa::where('whatsapp_instance', $instanceName)->first();
                $whatsapp = new WhatsAppService($empresa);
                $whatsapp->sendText(
                    $from,
                    "{Hola|Buen día}, gracias por comunicarte con nosotros. ¿En qué podemos ayudarte?",
                    [],
                    false,
                    $instanceName
                );
            }
        }

        // 📊 3. Actualización de Estados de Entrega y Lectura (ACKs)
        if (in_array($event, ['message.ack', 'message.status', 'message.update'])) {
            $messageId = $data['id'] ?? $data['key']['id'] ?? $data['messageId'] ?? null;
            $status = $data['status'] ?? $data['ack'] ?? null;

            if ($messageId && $status) {
                $statusMap = [
                    1 => 'pending',
                    2 => 'sent',
                    3 => 'delivered',
                    4 => 'read',
                    'pending' => 'pending',
                    'sent' => 'sent',
                    'delivered' => 'delivered',
                    'read' => 'read',
                    'failed' => 'failed',
                ];

                $normalizedStatus = $statusMap[$status] ?? null;

                if ($normalizedStatus) {
                    $updateData = ['status' => $normalizedStatus];
                    if ($normalizedStatus === 'delivered') {
                        $updateData['delivered_at'] = now();
                    } elseif ($normalizedStatus === 'read') {
                        $updateData['read_at'] = now();
                    }

                    \App\Models\WhatsAppMessage::where('message_id', $messageId)->update($updateData);
                }
            }
        }

        return response()->json(['status' => 'success']);
    }
}
