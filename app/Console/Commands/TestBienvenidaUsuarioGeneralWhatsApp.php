<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestBienvenidaUsuarioGeneralWhatsApp extends Command
{
    protected $signature = 'test:bienvenida-usuario {telefono? : Número de teléfono destino de prueba (ej: 584121234567)}';
    protected $description = 'Prueba el envío de mensaje de bienvenida por WhatsApp para un usuario general';

    public function handle(): int
    {
        $targetPhone = $this->argument('telefono');

        $user = User::whereNotNull('telefono')->where('telefono', '!=', '')->first();
        if (!$user) {
            $user = User::first();
        }

        if (!$user) {
            $this->error('No se encontró ningún usuario registrado en la base de datos.');
            return 1;
        }

        $phoneToSend = $targetPhone ?: $user->telefono;

        if (!$phoneToSend) {
            $this->error('Debe indicar un número de teléfono: php artisan test:bienvenida-usuario <telefono>');
            return 1;
        }

        $empresa = Empresa::first();
        $user->load(['roles', 'empresa', 'sucursal']);
        $rolesList = $user->roles->pluck('name')->implode(', ');
        $loginUrl = 'https://saprcoe.mmmvenezuela.org/login';
        $rawPassword = 'ClaveTemporal2026*';

        $mensaje = "👋 *¡Bienvenido a la Plataforma MMM Venezuela!*\n\n"
                 . "Estimado(a) *{$user->name}*,\n\n"
                 . "Se ha configurado su cuenta de acceso institucional a la plataforma administrativa.\n\n"
                 . "📋 *Detalles de su cuenta:*\n"
                 . "• *Rol asignado:* " . ($rolesList ?: 'Usuario del Sistema') . "\n"
                 . ($empresa ? "• *Institución:* {$empresa->razon_social}\n" : "") . "\n"
                 . "🔐 *Sus credenciales de acceso:*\n"
                 . "• *Usuario / Correo:* {$user->email}\n"
                 . "• *Contraseña:* {$rawPassword}\n\n"
                 . "🌐 *Enlace para ingresar al sistema:*\n"
                 . "{$loginUrl}\n\n"
                 . "Ya puede ingresar para acceder a los módulos y herramientas correspondientes a sus funciones.\n\n"
                 . "_Por seguridad, le recomendamos mantener sus credenciales en resguardo y cambiar su contraseña periódicamente._";

        $whatsappService = new WhatsAppService($empresa);
        $res = $whatsappService->sendMessage($phoneToSend, $mensaje);

        $this->info("Mensaje enviado a {$user->name} ({$phoneToSend}): " . json_encode($res));
        return 0;
    }
}
