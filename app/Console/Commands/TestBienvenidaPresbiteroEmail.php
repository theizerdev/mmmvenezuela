<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\User;
use App\Services\MailNotificationService;
use Illuminate\Console\Command;

class TestBienvenidaPresbiteroEmail extends Command
{
    protected $signature = 'test:bienvenida-presbitero-email {email? : Correo destinatario de prueba} {--mailpit : Forzar envío a través de Mailpit local} {--tipo=presbitero : Tipo de bienvenida (presbitero o usuario)}';
    protected $description = 'Prueba el envío de correo de bienvenida con credenciales (presbítero o usuario general)';

    public function handle(): int
    {
        $tipo = strtolower($this->option('tipo') ?: 'presbitero');

        $user = User::whereNotNull('email')->first();

        if (!$user) {
            $this->error('No se encontró ningún usuario en la base de datos.');
            return 1;
        }

        $targetEmail = $this->argument('email') ?: $user->email;
        $this->info("Probando envío de correo de bienvenida ({$tipo}) a: {$targetEmail}");

        $testUser = clone $user;
        $testUser->email = $targetEmail;

        $empresa = Empresa::first();

        if ($this->option('mailpit') && $empresa) {
            $empresa->mailpit_active = true;
            $empresa->mailpit_host = '127.0.0.1';
            $empresa->mailpit_port = 1025;
            $empresa->save();
        }

        $this->info("Empresa: " . ($empresa?->razon_social ?: 'MMM Venezuela'));
        $this->info("Google SMTP Activo: " . ($empresa?->google_smtp_active ? 'Sí (' . $empresa->google_smtp_email . ')' : 'No'));
        $this->info("Mailgun Activo: " . ($empresa?->mailgun_active ? 'Sí (' . $empresa->mailgun_domain . ')' : 'No'));
        $this->info("Mailpit (Local) Activo: " . ($empresa?->mailpit_active ? 'Sí (' . ($empresa->mailpit_host ?: '127.0.0.1') . ':' . ($empresa->mailpit_port ?: 1025) . ')' : 'No'));

        $mailService = new MailNotificationService($empresa);

        $copyEmail = 'oficina@mmmvenezuela.org';
        $this->info("Copia del correo (CC) a: {$copyEmail}");

        $this->info("Intentando enviar correo...");
        $res = ($tipo === 'usuario')
            ? $mailService->enviarBienvenidaUsuario($testUser, 'ClaveTemporal123*', $copyEmail)
            : $mailService->enviarBienvenidaPresbitero($testUser, 'ClaveTemporal123*', $copyEmail);

        if ($res) {
            $this->info('✓ Correo de bienvenida enviado exitosamente.');
            return 0;
        } else {
            $this->error('✗ No se pudo enviar el correo.');
            if ($mailService->getLastError()) {
                $this->error('Detalle: ' . $mailService->getLastError());
            }
            return 1;
        }
    }
}
