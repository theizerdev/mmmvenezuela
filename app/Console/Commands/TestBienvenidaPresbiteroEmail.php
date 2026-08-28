<?php

namespace App\Console\Commands;

use App\Models\Empresa;
use App\Models\User;
use App\Services\MailNotificationService;
use Illuminate\Console\Command;

class TestBienvenidaPresbiteroEmail extends Command
{
    protected $signature = 'test:bienvenida-presbitero-email {email? : Correo destinatario de prueba}';
    protected $description = 'Prueba el envío de correo de bienvenida con credenciales para un presbítero';

    public function handle(): int
    {
        $presbitero = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
            })
            ->whereNotNull('email')
            ->first();

        if (!$presbitero) {
            $presbitero = User::first();
        }

        if (!$presbitero) {
            $this->error('No se encontró ningún usuario en la base de datos.');
            return 1;
        }

        $targetEmail = $this->argument('email') ?: $presbitero->email;
        $this->info("Probando envío de correo de bienvenida a: {$targetEmail}");

        $testUser = clone $presbitero;
        $testUser->email = $targetEmail;

        $empresa = Empresa::first();
        $this->info("Empresa: " . ($empresa?->razon_social ?: 'MMM Venezuela'));
        $this->info("Google SMTP Activo: " . ($empresa?->google_smtp_active ? 'Sí (' . $empresa->google_smtp_email . ')' : 'No'));
        $this->info("Mailgun Activo: " . ($empresa?->mailgun_active ? 'Sí (' . $empresa->mailgun_domain . ')' : 'No'));

        $mailService = new MailNotificationService($empresa);

        $this->info("Intentando enviar correo...");
        $res = $mailService->enviarBienvenidaPresbitero($testUser, 'ClaveTemporal123*');

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
