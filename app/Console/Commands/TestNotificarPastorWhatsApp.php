<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\Pastor;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestNotificarPastorWhatsApp extends Command
{
    protected $signature = 'test:notificar-pastor';
    protected $description = 'Prueba el envío de notificación WhatsApp para el último pastor registrado';

    public function handle(): int
    {
        $pastor = Pastor::latest()->first();
        if (!$pastor) {
            $this->error('No hay pastores registrados en la base de datos.');
            return 1;
        }

        $this->info("Pastor encontrado: {$pastor->nombre_completo} (ID: {$pastor->id}, Cédula: {$pastor->documento})");
        $this->info("Zona: " . ($pastor->zona ?: 'N/A') . " | Distrito: " . ($pastor->distrito ?: 'N/A'));

        $empresa = Empresa::first();
        $this->info("Empresa: " . ($empresa?->razon_social ?? 'N/A'));
        $this->info("WhatsApp Activo: " . ($empresa?->whatsapp_active ? 'SÍ' : 'NO'));
        $this->info("WhatsApp Instancia: " . ($empresa?->whatsapp_instance ?? 'N/A'));

        $zonaPastor = trim($pastor->zona ?? '');
        $distritoPastor = trim($pastor->distrito ?? '');

        $presbiteros = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
            })
            ->where(function ($query) use ($zonaPastor, $distritoPastor) {
                if (!empty($zonaPastor)) {
                    $query->where('zona', $zonaPastor)
                          ->orWhere('zona_2', $zonaPastor);
                }
                if (!empty($distritoPastor)) {
                    $query->orWhere('distrito', $distritoPastor)
                          ->orWhere('distrito_2', $distritoPastor);
                }
            })
            ->whereNotNull('telefono')
            ->where('telefono', '!=', '')
            ->get();

        if ($presbiteros->isEmpty()) {
            $this->warn('No se encontraron presbíteros con esa zona/distrito exacta. Buscando presbíteros generales...');
            $presbiteros = User::whereHas('roles', function ($q) {
                    $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
                })
                ->whereNotNull('telefono')
                ->where('telefono', '!=', '')
                ->limit(2)
                ->get();
        }

        $this->info("Presbíteros encontrados: " . $presbiteros->count());
        foreach ($presbiteros as $presbitero) {
            $zonasInfo = implode(', ', $presbitero->getZonasList()) ?: 'N/A';
            $distritosInfo = implode(', ', $presbitero->getDistritosList()) ?: 'N/A';
            $this->line("- {$presbitero->name} | Tlf: {$presbitero->telefono} | Zonas: {$zonasInfo} | Distritos: {$distritosInfo}");
        }

        if ($presbiteros->isEmpty()) {
            $this->error('No hay presbíteros con número de teléfono configurado para notificar.');
            return 1;
        }

        $whatsappService = new WhatsAppService($empresa);

        $mensaje = "🔔 *MMM Venezuela - Notificación Ministerial*\n\n"
                 . "Estimado Presbítero,\n"
                 . "Se ha completado la ficha de registro ministerial de un obrero a su cargo:\n\n"
                 . "👤 *Pastor:* {$pastor->nombre_completo}\n"
                 . "🆔 *Cédula:* {$pastor->documento}\n"
                 . "🏷️ *Código Asignado:* {$pastor->codigo}\n"
                 . "📜 *Nivel Ministerial:* {$pastor->nivel_ministerial}\n"
                 . "📍 *Zona:* " . ($pastor->zona ?: 'Sin asignar') . "\n"
                 . "🏛️ *Distrito:* " . ($pastor->distrito ?: 'Sin asignar') . "\n"
                 . "📱 *Teléfono:* " . ($pastor->telefono_tlf ?: 'N/A') . "\n"
                 . "📋 *Estado Civil:* " . ($pastor->estado_civil ?: 'N/A') . "\n\n"
                 . "Los datos se encuentran listos en el panel administrativo para su revisión y confirmación oficial.";

        foreach ($presbiteros as $presbitero) {
            $this->info("Enviando mensaje a: {$presbitero->name} ({$presbitero->telefono})...");
            $resultado = $whatsappService->sendMessage($presbitero->telefono, $mensaje);
            $this->line("Respuesta de la API: " . json_encode($resultado));
        }

        return 0;
    }
}
