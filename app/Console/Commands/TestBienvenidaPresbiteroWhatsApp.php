<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestBienvenidaPresbiteroWhatsApp extends Command
{
    protected $signature = 'test:bienvenida-presbitero';
    protected $description = 'Prueba el envío de mensaje de bienvenida por WhatsApp para un presbítero';

    public function handle(): int
    {
        $presbitero = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
            })
            ->whereNotNull('telefono')
            ->where('telefono', '!=', '')
            ->first();

        if (!$presbitero) {
            $this->error('No se encontró un usuario con rol de presbítero y teléfono asignado.');
            return 1;
        }

        $empresa = Empresa::first();
        $this->info("Presbítero: {$presbitero->name} ({$presbitero->email})");
        $this->info("Teléfono: {$presbitero->telefono}");
        $this->info("Zona: {$presbitero->zona} | Distrito: {$presbitero->distrito}");

        $loginUrl = url('/login');
        $rawPassword = 'Password123*';

        $mensaje = "👋 *¡Bienvenido al Sistema Ministerial MMM Venezuela!*\n\n"
                 . "Estimado Presbítero *{$presbitero->name}*,\n\n"
                 . "Se ha creado exitosamente su cuenta de acceso institucional con el rol de *Presbítero*.\n\n"
                 . "📍 *Jurisdicción Asignada:*\n"
                 . "• *Zona:* " . ($presbitero->zona ?: 'Sin asignar') . "\n"
                 . "• *Distrito:* " . ($presbitero->distrito ?: 'Sin asignar') . "\n\n"
                 . "🔐 *Sus credenciales de acceso:*\n"
                 . "• *Usuario / Correo:* {$presbitero->email}\n"
                 . "• *Contraseña:* {$rawPassword}\n\n"
                 . "🌐 *Enlace para ingresar al sistema:*\n"
                 . "{$loginUrl}\n\n"
                 . "Desde su panel administrativo podrá dar seguimiento a las fichas ministeriales de los obreros a su cargo, consultar iglesias y recibir notificaciones automáticas cada vez que un pastor complete su registro.\n\n"
                 . "_Por seguridad, le recomendamos cambiar su contraseña tras el primer inicio de sesión._";

        $whatsappService = new WhatsAppService($empresa);
        $res = $whatsappService->sendMessage($presbitero->telefono, $mensaje);

        $this->info("Respuesta: " . json_encode($res));
        return 0;
    }
}
