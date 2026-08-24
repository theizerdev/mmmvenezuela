<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\User;
use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestBienvenidaUsuarioGeneralWhatsApp extends Command
{
    protected $signature = 'test:bienvenida-usuario';
    protected $description = 'Prueba el envío de mensaje de bienvenida por WhatsApp para un usuario general';

    public function handle(): int
    {
        $user = User::whereNotNull('telefono')->where('telefono', '!=', '')->first();
        if (!$user) {
            $this->error('No hay usuarios con teléfono.');
            return 1;
        }

        $empresa = Empresa::first();
        $user->load(['roles', 'empresa', 'sucursal']);
        $rolesList = $user->roles->pluck('name')->implode(', ');
        $loginUrl = url('/login');
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
        $res = $whatsappService->sendMessage($user->telefono, $mensaje);

        $this->info("Mensaje enviado a {$user->name} ({$user->telefono}): " . json_encode($res));
        return 0;
    }
}
