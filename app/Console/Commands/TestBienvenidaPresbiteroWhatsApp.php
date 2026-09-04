<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestBienvenidaPresbiteroWhatsApp extends Command
{
    protected $signature = 'test:bienvenida-presbitero {telefono? : Número de teléfono destino de prueba (ej: 584121234567)}';
    protected $description = 'Prueba el envío de mensaje de bienvenida por WhatsApp para un presbítero';

    public function handle(): int
    {
        $targetPhone = $this->argument('telefono');

        $presbitero = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
            })
            ->whereNotNull('telefono')
            ->where('telefono', '!=', '')
            ->first();

        if (!$presbitero) {
            $presbitero = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
            })->first();
        }

        if (!$presbitero) {
            $this->error('No se encontró un usuario con rol de presbítero en la base de datos.');
            return 1;
        }

        $phoneToSend = $targetPhone ?: $presbitero->telefono;

        if (!$phoneToSend) {
            $this->error('Debe indicar un número de teléfono: php artisan test:bienvenida-presbitero <telefono>');
            return 1;
        }

        $empresa = Empresa::first();
        $this->info("Presbítero: {$presbitero->name} ({$presbitero->email})");
        $this->info("Teléfono de envío: {$phoneToSend}");
        $zonasTexto = implode(', ', $presbitero->getZonasList()) ?: 'Sin asignar';
        $distritosTexto = !empty($presbitero->getDistritosList())
            ? implode(', ', array_map(fn ($d) => "Distrito {$d}", $presbitero->getDistritosList()))
            : 'Sin asignar';

        $this->info("Zonas: {$zonasTexto} | Distritos: {$distritosTexto}");

        $loginUrl = 'https://saprcoe.mmmvenezuela.org/login';
        $rawPassword = 'Password123*';

        $mensaje = "👋 *¡Bienvenido al Sistema Ministerial MMM Venezuela!*\n\n"
                 . "Estimado Presbítero *{$presbitero->name}*, se ha creado su cuenta de acceso institucional:\n\n"
                 . "🔐 *Credenciales de acceso:*\n"
                 . "• *Usuario:* {$presbitero->email}\n"
                 . "• *Contraseña:* {$rawPassword}\n"
                 . "• *Enlace de ingreso:* {$loginUrl}\n\n"
                 . "⚠️ *Nota:* Esta cuenta es de uso personal e intransferible. Al ingresar, el sistema le solicitará cambiar su contraseña por motivos de seguridad.";

        $whatsappService = new WhatsAppService($empresa);
        $res = $whatsappService->sendMessage($phoneToSend, $mensaje);

        $this->info("Respuesta: " . json_encode($res));
        return 0;
    }
}
