<?php

namespace App\Services;

use App\Models\Empresa;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MailNotificationService
{
    protected ?Empresa $empresa;
    protected ?string $lastError = null;

    public function __construct(?Empresa $empresa = null)
    {
        $this->empresa = $empresa ?: Empresa::first();
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    /**
     * Envía correo de bienvenida con credenciales a un usuario Presbítero.
     */
    public function enviarBienvenidaPresbitero(User $user, ?string $rawPassword = null, ?string $ccEmail = null): bool
    {
        if (empty($user->email) || !filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            Log::warning("No se puede enviar correo de bienvenida: email inválido o vacío para el usuario ID {$user->id}");
            return false;
        }

        $empresa = $this->empresa ?: ($user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first());

        $zonasTexto = $user->zona ?: '';
        if (!empty($user->zona_2)) {
            $zonasTexto .= ($zonasTexto ? ", " : "") . $user->zona_2;
        }

        $distritosTexto = $user->distrito ? "Distrito {$user->distrito}" : '';
        if (!empty($user->distrito_2)) {
            $distritosTexto .= ($distritosTexto ? ", " : "") . "Distrito {$user->distrito_2}";
        }

        $loginUrl = request()->root() ? request()->root() . '/login' : url('/login');
        $subject = 'Bienvenida al Sistema Automatizado de Registro Pastoral | Credenciales de acceso';

        $logoUrl = 'https://mmmvenezuela.org/templates/mmmvenezuela/images/LOGO.png';

        $cocogooseBoldPath = base_path('cocogoose/Cocogoose-Pro-Bold-trial.ttf');
        $cocogooseBoldB64 = file_exists($cocogooseBoldPath)
            ? 'data:font/truetype;base64,' . base64_encode(file_get_contents($cocogooseBoldPath))
            : null;

        $cocogooseRegularPath = base_path('cocogoose/Cocogoose-Pro-Regular-trial.ttf');
        $cocogooseRegularB64 = file_exists($cocogooseRegularPath)
            ? 'data:font/truetype;base64,' . base64_encode(file_get_contents($cocogooseRegularPath))
            : null;

        $footerPath = public_path('image/footer_correo.jpeg');
        if (file_exists($footerPath)) {
            $footerDataUri = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($footerPath));
        } else {
            $footerDataUri = url('/image/footer_correo.jpeg');
        }

        $data = [
            'nombre' => mb_convert_case($user->name, MB_CASE_TITLE, 'UTF-8'),
            'email' => $user->email,
            'password' => $rawPassword,
            'zonas' => $zonasTexto ?: 'Sin asignar',
            'distritos' => $distritosTexto ?: 'Sin asignar',
            'loginUrl' => $loginUrl,
            'telefonoContacto' => $empresa?->telefono ?: '+58 (Oficina Nacional)',
            'emailContacto' => $empresa?->email ?: ($empresa?->google_smtp_from_address ?: 'contacto@mmmvenezuela.org'),
            'empresaNombre' => $empresa?->razon_social ?: 'Movimiento Misionero Mundial Venezuela',
            'logoUrl' => $logoUrl,
            'fechaFormal' => now()->translatedFormat('d \d\e F \d\e Y'),
            'cocogooseBoldB64' => $cocogooseBoldB64,
            'cocogooseRegularB64' => $cocogooseRegularB64,
            'footerImageUrl' => $footerDataUri,
        ];

        $htmlContent = view('emails.bienvenida_presbitero', $data)->render();
        $plainTextContent = $this->buildPlainTextContent($data);

        return $this->sendHtmlEmail($user->email, $user->name, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
    }

    /**
     * Envía correo de bienvenida con credenciales a cualquier usuario del sistema.
     */
    public function enviarBienvenidaUsuario(User $user, ?string $rawPassword = null, ?string $ccEmail = null): bool
    {
        if (empty($user->email) || !filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            Log::warning("No se puede enviar correo de bienvenida: email inválido o vacío para el usuario ID {$user->id}");
            return false;
        }

        $empresa = $this->empresa ?: ($user->empresa_id ? Empresa::find($user->empresa_id) : Empresa::first());

        $user->loadMissing(['roles', 'sucursal']);
        $rolesList = $user->roles->pluck('name')->implode(', ') ?: 'Usuario del Sistema';

        $zonasTexto = $user->zona ?: '';
        if (!empty($user->zona_2)) {
            $zonasTexto .= ($zonasTexto ? ", " : "") . $user->zona_2;
        }

        $distritosTexto = $user->distrito ? "Distrito {$user->distrito}" : '';
        if (!empty($user->distrito_2)) {
            $distritosTexto .= ($distritosTexto ? ", " : "") . "Distrito {$user->distrito_2}";
        }

        $loginUrl = request()->root() ? request()->root() . '/login' : url('/login');
        $subject = 'Bienvenida al Sistema Automatizado de Registro Pastoral | Credenciales de acceso';

        $logoUrl = 'https://mmmvenezuela.org/logo.png';

        $cocogooseBoldPath = base_path('cocogoose/Cocogoose-Pro-Bold-trial.ttf');
        $cocogooseBoldB64 = file_exists($cocogooseBoldPath)
            ? 'data:font/truetype;base64,' . base64_encode(file_get_contents($cocogooseBoldPath))
            : null;

        $cocogooseRegularPath = base_path('cocogoose/Cocogoose-Pro-Regular-trial.ttf');
        $cocogooseRegularB64 = file_exists($cocogooseRegularPath)
            ? 'data:font/truetype;base64,' . base64_encode(file_get_contents($cocogooseRegularPath))
            : null;

        $footerPath = public_path('image/footer_correo.jpeg');
        if (file_exists($footerPath)) {
            $footerDataUri = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($footerPath));
        } else {
            $footerDataUri = url('/image/footer_correo.jpeg');
        }

        $data = [
            'nombre' => mb_convert_case($user->name, MB_CASE_TITLE, 'UTF-8'),
            'email' => $user->email,
            'password' => $rawPassword,
            'rol' => $rolesList,
            'zonas' => $zonasTexto,
            'distritos' => $distritosTexto,
            'loginUrl' => $loginUrl,
            'telefonoContacto' => $empresa?->telefono ?: '+58 (Oficina Nacional)',
            'emailContacto' => $empresa?->email ?: ($empresa?->google_smtp_from_address ?: 'contacto@mmmvenezuela.org'),
            'empresaNombre' => $empresa?->razon_social ?: 'Movimiento Misionero Mundial Venezuela',
            'logoUrl' => $logoUrl,
            'fechaFormal' => now()->translatedFormat('d \d\e F \d\e Y'),
            'cocogooseBoldB64' => $cocogooseBoldB64,
            'cocogooseRegularB64' => $cocogooseRegularB64,
            'footerImageUrl' => $footerDataUri,
        ];

        $htmlContent = view('emails.bienvenida_usuario', $data)->render();
        $plainTextContent = $this->buildPlainTextContentUsuario($data);

        return $this->sendHtmlEmail($user->email, $user->name, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
    }

    /**
     * Envía un correo utilizando el proveedor que esté activo (Google SMTP o Mailgun).
     * Si ambos están inactivos, utiliza Mailpit si está activo, o el mailer por defecto.
     */
    public function sendHtmlEmail(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlContent,
        string $plainTextContent = '',
        ?Empresa $empresa = null,
        ?string $ccEmail = null
    ): bool {
        $empresa = $empresa ?: $this->empresa;

        // 1. Google SMTP si está activo y tiene credenciales
        if ($empresa && $empresa->google_smtp_active && !empty($empresa->google_smtp_email)) {
            Log::info("Enviando correo vía Google SMTP activo a {$toEmail} con asunto: '{$subject}'");
            return $this->sendViaGoogleSmtp($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
        }

        // 2. Mailgun si está activo y tiene credenciales
        if ($empresa && $empresa->mailgun_active && !empty($empresa->mailgun_domain)) {
            Log::info("Enviando correo vía Mailgun activo a {$toEmail} con asunto: '{$subject}'");
            return $this->sendViaMailgun($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
        }

        // 3. Mailpit si está activo (entorno local de pruebas cuando ni Google ni Mailgun están activos)
        if ($empresa && $empresa->mailpit_active) {
            Log::info("Enviando correo vía Mailpit activo a {$toEmail} con asunto: '{$subject}'");
            return $this->sendViaMailpit($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
        }

        // 4. Fallback: Mailer por defecto de Laravel
        Log::info("Enviando correo vía Mailer por defecto a {$toEmail} con asunto: '{$subject}'");
        return $this->sendViaDefaultMailer($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
    }

    /**
     * Envío a través de Mailpit (SMTP Local).
     */
    protected function sendViaMailpit(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlContent,
        string $plainTextContent,
        Empresa $empresa,
        ?string $ccEmail = null
    ): bool {
        try {
            $rawHost = $empresa->mailpit_host ?: '127.0.0.1';
            $host = preg_replace('#^https?://#i', '', $rawHost);
            $host = explode(':', $host)[0];
            $host = rtrim($host, '/');
            $host = $host ?: '127.0.0.1';

            $port = (int) ($empresa->mailpit_port ?: 1025);
            $fromAddress = $empresa->mailpit_from_address ?: 'no-reply@mmmvenezuela.org';
            $fromName = $empresa->mailpit_from_name ?: ($empresa->razon_social ?: 'MMM Venezuela');

            config([
                'mail.mailers.mailpit_dynamic' => [
                    'transport' => 'smtp',
                    'host' => $host,
                    'port' => $port,
                    'encryption' => null,
                    'timeout' => 5,
                ],
            ]);

            Mail::mailer('mailpit_dynamic')->send([], [], function ($message) use ($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $fromAddress, $fromName, $ccEmail) {
                $message->from($fromAddress, $fromName)
                    ->to($toEmail, $toName)
                    ->subject($subject)
                    ->html($htmlContent);

                if (!empty($ccEmail) && strtolower($toEmail) !== strtolower($ccEmail)) {
                    $message->cc($ccEmail);
                }

                if (!empty($plainTextContent)) {
                    $message->text($plainTextContent);
                }
            });

            Log::info("Correo enviado exitosamente vía Mailpit a {$toEmail} ({$subject})");
            return true;
        } catch (\Throwable $e) {
            $this->lastError = "Mailpit Error: " . $e->getMessage();
            Log::error("Error al enviar correo vía Mailpit a {$toEmail}: " . $e->getMessage());

            // Fallback a Google SMTP si está configurado
            if ($empresa->google_smtp_active && !empty($empresa->google_smtp_email)) {
                return $this->sendViaGoogleSmtp($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
            }

            return false;
        }
    }

    /**
     * Envío a través de Google SMTP dinámico.
     */
    protected function sendViaGoogleSmtp(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlContent,
        string $plainTextContent,
        Empresa $empresa,
        ?string $ccEmail = null
    ): bool {
        try {
            $host = $empresa->google_smtp_host ?: 'smtp.gmail.com';
            $port = (int) ($empresa->google_smtp_port ?: 587);
            $encryption = $empresa->google_smtp_encryption === 'none' ? null : ($empresa->google_smtp_encryption ?: 'tls');
            $username = $empresa->google_smtp_email;
            $password = $empresa->google_smtp_password;
            $fromAddress = $empresa->google_smtp_from_address ?: $empresa->google_smtp_email;
            $fromName = $empresa->google_smtp_from_name ?: ($empresa->razon_social ?: 'MMM Venezuela');

            config([
                'mail.mailers.google_smtp_dynamic' => [
                    'transport' => 'smtp',
                    'host' => $host,
                    'port' => $port,
                    'encryption' => $encryption,
                    'username' => $username,
                    'password' => $password,
                    'timeout' => 15,
                ],
            ]);

            Mail::mailer('google_smtp_dynamic')->send([], [], function ($message) use ($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $fromAddress, $fromName, $ccEmail) {
                $message->from($fromAddress, $fromName)
                    ->to($toEmail, $toName)
                    ->subject($subject)
                    ->html($htmlContent);

                if (!empty($ccEmail) && strtolower($toEmail) !== strtolower($ccEmail)) {
                    $message->cc($ccEmail);
                }

                if (!empty($plainTextContent)) {
                    $message->text($plainTextContent);
                }
            });

            Log::info("Correo enviado exitosamente vía Google SMTP a {$toEmail} ({$subject})");
            return true;
        } catch (\Throwable $e) {
            $this->lastError = "Google SMTP Error: " . $e->getMessage();
            Log::error("Error al enviar correo vía Google SMTP a {$toEmail}: " . $e->getMessage());

            // 1. Fallback a Mailgun si está configurado
            if ($empresa->mailgun_active && !empty($empresa->mailgun_domain) && !empty($empresa->mailgun_secret)) {
                Log::info("Intentando envío de respaldo vía Mailgun a {$toEmail}");
                return $this->sendViaMailgun($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
            }

            // 2. Fallback al mailer del sistema si es diferente
            if (config('mail.default') !== 'google_smtp_dynamic') {
                return $this->sendViaDefaultMailer($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
            }

            return false;
        }
    }

    /**
     * Envío a través de la API oficial de Mailgun.
     */
    protected function sendViaMailgun(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlContent,
        string $plainTextContent,
        Empresa $empresa,
        ?string $ccEmail = null
    ): bool {
        try {
            $domain = trim($empresa->mailgun_domain);
            $secret = trim($empresa->mailgun_secret);
            $endpoint = $empresa->mailgun_endpoint ?: 'api.mailgun.net';
            $endpoint = rtrim(str_replace(['https://', 'http://'], '', $endpoint), '/');

            $fromName = $empresa->mailgun_from_name ?: ($empresa->razon_social ?: 'MMM Venezuela');
            $fromEmail = $empresa->mailgun_from_address ?: ("postmaster@" . $domain);
            $from = "{$fromName} <{$fromEmail}>";

            $url = "https://{$endpoint}/v3/{$domain}/messages";

            $postData = [
                'from' => $from,
                'to' => "{$toName} <{$toEmail}>",
                'subject' => $subject,
                'html' => $htmlContent,
                'text' => $plainTextContent,
            ];

            if (!empty($ccEmail) && strtolower($toEmail) !== strtolower($ccEmail)) {
                $postData['cc'] = $ccEmail;
            }

            $response = Http::asForm()
                ->withBasicAuth('api', $secret)
                ->timeout(15)
                ->post($url, $postData);

            if ($response->successful()) {
                Log::info("Correo enviado exitosamente vía Mailgun a {$toEmail} ({$subject})");
                return true;
            }

            $this->lastError = "Mailgun Error ({$response->status()}): " . ($response->json('message') ?? $response->body());
            Log::error("Fallo envío Mailgun a {$toEmail}: " . $response->body());

            // Fallback a Google SMTP si está configurado
            if (!empty($empresa->google_smtp_email) && !empty($empresa->google_smtp_password)) {
                Log::info("Intentando envío de respaldo vía Google SMTP a {$toEmail}");
                return $this->sendViaGoogleSmtp($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
            }

            return false;
        } catch (\Throwable $e) {
            $this->lastError = "Mailgun Exception: " . $e->getMessage();
            Log::error("Error al enviar correo vía Mailgun a {$toEmail}: " . $e->getMessage());

            // Fallback a Google SMTP si está configurado
            if (!empty($empresa->google_smtp_email) && !empty($empresa->google_smtp_password)) {
                Log::info("Intentando envío de respaldo vía Google SMTP a {$toEmail}");
                return $this->sendViaGoogleSmtp($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $empresa, $ccEmail);
            }

            return false;
        }
    }

    /**
     * Envío a través del Mailer configurado por defecto en Laravel.
     */
    protected function sendViaDefaultMailer(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlContent,
        string $plainTextContent,
        ?Empresa $empresa = null,
        ?string $ccEmail = null
    ): bool {
        try {
            $fromAddress = $empresa?->google_smtp_from_address ?: ($empresa?->mailgun_from_address ?: config('mail.from.address'));
            $fromName = $empresa?->razon_social ?: config('mail.from.name');

            Mail::send([], [], function ($message) use ($toEmail, $toName, $subject, $htmlContent, $plainTextContent, $fromAddress, $fromName, $ccEmail) {
                $message->from($fromAddress, $fromName)
                    ->to($toEmail, $toName)
                    ->subject($subject)
                    ->html($htmlContent);

                if (!empty($ccEmail) && strtolower($toEmail) !== strtolower($ccEmail)) {
                    $message->cc($ccEmail);
                }

                if (!empty($plainTextContent)) {
                    $message->text($plainTextContent);
                }
            });

            Log::info("Correo enviado vía default mailer a {$toEmail}");
            return true;
        } catch (\Throwable $e) {
            $this->lastError = "Default Mailer Error: " . $e->getMessage();
            Log::error("Error al enviar correo vía default mailer a {$toEmail}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Construye versión texto plano del correo para clientes que no soportan HTML (Presbítero).
     */
    protected function buildPlainTextContent(array $data): string
    {
        $passwordLine = !empty($data['password']) ? "• Contraseña temporal: {$data['password']}\n" : "";

        return <<<TEXT
IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA
MOVIMIENTO MISIONERO MUNDIAL

Estimado Presbítero {$data['nombre']}:

El Movimiento Misionero Mundial Venezuela le informa que se ha creado exitosamente su cuenta de acceso institucional al Sistema Automatizado de Registro Pastoral con el rol oficial de Presbítero.

📍 JURISDICCIÓN ASIGNADA:
• Zona(s): {$data['zonas']}
• Distrito(s): {$data['distritos']}

🔐 CREDENCIALES DE ACCESO:
• Usuario / Correo: {$data['email']}
{$passwordLine}
🔗 ENLACE DE ACCESO:
{$data['loginUrl']}

Desde su panel administrativo podrá dar seguimiento a las fichas ministeriales de los pastores a su cargo, consultar las iglesias bajo su cobertura y recibir balances y notificaciones automáticas.

⚠️ RECOMENDACIÓN DE SEGURIDAD:
Esta cuenta es de uso personal e intransferible. Al ingresar por primera vez, el sistema le solicitará cambiar su contraseña obligatoriamente por motivos de seguridad.

Para mayor información o asistencia, comuníquese con la Oficina Nacional al {$data['telefonoContacto']}.

Atentamente,
Movimiento Misionero Mundial Venezuela
Oficina Nacional
TEXT;
    }

    /**
     * Construye versión texto plano del correo para clientes que no soportan HTML (Usuario General).
     */
    protected function buildPlainTextContentUsuario(array $data): string
    {
        $passwordLine = !empty($data['password']) ? "• Contraseña temporal: {$data['password']}\n" : "";
        $zonasLine = !empty($data['zonas']) ? "• Zona(s): {$data['zonas']}\n" : "";
        $distritosLine = !empty($data['distritos']) ? "• Distrito(s): {$data['distritos']}\n" : "";

        return <<<TEXT
IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA
MOVIMIENTO MISIONERO MUNDIAL

Estimado(a) {$data['nombre']}:

El Movimiento Misionero Mundial Venezuela le informa que se ha creado exitosamente su cuenta de acceso institucional a SAPRCOE (Sistema Automatizado de Registro y Control de Obreros y Extensiones).

📋 ROL ASIGNADO:
• Rol: {$data['rol']}
{$zonasLine}{$distritosLine}
🔐 CREDENCIALES DE ACCESO:
• Usuario / Correo: {$data['email']}
{$passwordLine}
🔗 ENLACE DE ACCESO:
{$data['loginUrl']}

Desde su panel administrativo podrá acceder a los módulos autorizados y recibir balances y notificaciones oficiales.

⚠️ RECOMENDACIÓN DE SEGURIDAD:
Esta cuenta es de uso personal e intransferible. Al ingresar por primera vez, le sugerimos cambiar su contraseña temporal por motivos de seguridad.

Para mayor información o asistencia, comuníquese con la Oficina Nacional al {$data['telefonoContacto']}.

Atentamente,
Movimiento Misionero Mundial Venezuela
Oficina Nacional
TEXT;
    }
}
