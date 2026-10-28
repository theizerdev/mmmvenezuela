<?php

namespace App\Services;

use App\Models\Actividad;
use App\Models\Asistencia;
use App\Models\Pastor;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushNotificationService
{
    protected string $expoApiUrl = 'https://exp.host/--/api/v2/push/send';

    /**
     * Enviar una notificación individual o en lote a Expo Push API.
     */
    public function send(string|array $tokens, string $title, string $body, array $data = [], string $sound = 'default'): bool
    {
        $tokenList = is_array($tokens) ? $tokens : [$tokens];
        $validTokens = array_filter($tokenList, fn ($t) => !empty($t) && (str_starts_with($t, 'ExponentPushToken') || str_starts_with($t, 'ExpoPushToken')));

        if (empty($validTokens)) {
            return false;
        }

        $messages = [];
        foreach ($validTokens as $token) {
            $messages[] = [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'sound' => $sound,
                'priority' => 'high',
                'channelId' => 'asistencias-pastorales',
                'data' => $data,
            ];
        }

        try {
            $response = Http::timeout(6)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Accept-Encoding' => 'gzip, deflate',
                    'Content-Type' => 'application/json',
                ])
                ->post($this->expoApiUrl, count($messages) === 1 ? $messages[0] : $messages);

            if ($response->successful()) {
                Log::info('Expo Push Notification enviada exitosamente', [
                    'destinatarios' => count($validTokens),
                    'titulo' => $title,
                ]);
                return true;
            }

            Log::warning('Expo Push Notification retornó error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;
        } catch (\Throwable $e) {
            Log::error('Fallo al conectar con Expo Push Service: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Notificar automáticamente al presbítero cuando un pastor de su zona se acredita.
     */
    public function notificarPresbitero(Pastor $pastor, Asistencia $asistencia, string $extensionNombre, bool $asistioConConyuge): int
    {
        if (empty($pastor->zona)) {
            return 0;
        }

        // Buscar a los presbíteros de esa zona específica
        $presbiteros = User::role(['Presbitero', 'presbitero'])
            ->where(function ($q) use ($pastor) {
                $q->where('zona', $pastor->zona)
                  ->orWhere('zona_2', $pastor->zona);
            })
            ->whereNotNull('expo_push_token')
            ->where('push_notificaciones_activas', true)
            ->where('push_modo_silencioso', false)
            ->get();

        if ($presbiteros->isEmpty()) {
            return 0;
        }

        $titulo = "📍 ¡Pastor Acreditado! — Zona {$pastor->zona}";
        $cuerpo = "{$pastor->nombres} {$pastor->apellidos} ({$extensionNombre}) acaba de registrar su asistencia";
        if ($asistioConConyuge) {
            $cuerpo .= $pastor->nombre_conyuge ? " con su cónyuge {$pastor->nombre_conyuge}." : " con su cónyuge.";
        } else {
            $cuerpo .= ".";
        }

        $data = [
            'tipo' => 'asistencia_pastor',
            'pastor_id' => $pastor->id,
            'zona' => $pastor->zona,
            'asistencia_id' => $asistencia->id,
            'actividad_id' => $asistencia->actividad_id,
            'hora' => $asistencia->fecha_registro?->format('h:i A') ?? now()->format('h:i A'),
        ];

        $tokens = $presbiteros->pluck('expo_push_token')->toArray();
        $this->send($tokens, $titulo, $cuerpo, $data);

        return count($tokens);
    }

    /**
     * Notificar al Supervisor Nacional o Junta sobre hitos relevantes.
     */
    public function notificarHitoSupervisor(string $titulo, string $mensaje, array $data = []): int
    {
        $supervisores = User::role(['Supervisor Nacional', 'supervisor-nacional', 'Super Administrador', 'super-admin'])
            ->whereNotNull('expo_push_token')
            ->where('push_notificaciones_activas', true)
            ->get();

        if ($supervisores->isEmpty()) {
            return 0;
        }

        $tokens = $supervisores->pluck('expo_push_token')->toArray();
        $this->send($tokens, $titulo, $mensaje, array_merge(['tipo' => 'hito_nacional'], $data));

        return count($tokens);
    }
}

