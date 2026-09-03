<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Pais;
use App\Models\Pastor;
use App\Models\User;
use App\Models\WhatsAppMessage;
use App\Models\WhatsAppTemplate;
use App\Services\ControlAccesoService;
use App\Services\JaakService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

class IntegrationController extends Controller
{
    /**
     * Muestra el panel de integraciones para la empresa del usuario.
     */
    public function index(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return redirect()->route('dashboard')->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        // Obtener el estado actual de WhatsApp
        $whatsappService = new WhatsAppService($empresa);
        $status = $whatsappService->getStatus();
        $whatsappConnected = false;
        if ($status && isset($status['isConnected'])) {
            $whatsappConnected = (bool) $status['isConnected'];
        }

        return inertia('admin/integrations/index', [
            'mapbox_api_key' => $empresa->mapbox_api_key,
            'mapbox_active' => (bool) $empresa->mapbox_active,
            'google_maps_api_key' => $empresa->google_maps_api_key,
            'google_maps_active' => (bool) $empresa->google_maps_active,
            'google_smtp_host' => $empresa->google_smtp_host ?? 'smtp.gmail.com',
            'google_smtp_port' => (int) ($empresa->google_smtp_port ?? 587),
            'google_smtp_encryption' => $empresa->google_smtp_encryption ?? 'tls',
            'google_smtp_email' => $empresa->google_smtp_email,
            'google_smtp_password' => $empresa->google_smtp_password,
            'google_smtp_from_address' => $empresa->google_smtp_from_address,
            'google_smtp_from_name' => $empresa->google_smtp_from_name,
            'google_smtp_active' => (bool) $empresa->google_smtp_active,
            'mailgun_domain' => $empresa->mailgun_domain,
            'mailgun_secret' => $empresa->mailgun_secret,
            'mailgun_endpoint' => $empresa->mailgun_endpoint ?? 'api.mailgun.net',
            'mailgun_from_address' => $empresa->mailgun_from_address,
            'mailgun_from_name' => $empresa->mailgun_from_name,
            'mailgun_active' => (bool) $empresa->mailgun_active,
            'mailpit_host' => $empresa->mailpit_host ?? '127.0.0.1',
            'mailpit_port' => (int) ($empresa->mailpit_port ?? 1025),
            'mailpit_from_address' => $empresa->mailpit_from_address,
            'mailpit_from_name' => $empresa->mailpit_from_name,
            'mailpit_web_port' => (int) ($empresa->mailpit_web_port ?? 8025),
            'mailpit_active' => (bool) $empresa->mailpit_active,
            'whatsapp_active' => (bool) $empresa->whatsapp_active,
            'whatsapp_connected' => $whatsappConnected,
            'control_acceso_base_url' => $empresa->control_acceso_base_url,
            'control_acceso_app_token' => $empresa->control_acceso_app_token,
            'control_acceso_user_token' => $empresa->control_acceso_user_token,
            'control_acceso_active' => (bool) $empresa->control_acceso_active,
        ]);
    }

    /**
     * Muestra la página de navegación Mapbox.
     */
    public function mapboxMap(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return redirect()->route('dashboard')->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        return inertia('admin/integrations/map', [
            'mapbox_api_key' => $empresa->mapbox_api_key,
            'mapbox_active' => (bool) $empresa->mapbox_active,
            'google_maps_api_key' => $empresa->google_maps_api_key,
            'google_maps_active' => (bool) $empresa->google_maps_active,
        ]);
    }

    /**
     * Muestra la pantalla de navegación en tiempo real.
     */
    public function mapboxNavigation(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return redirect()->route('dashboard')->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        return inertia('admin/integrations/navigation', [
            'mapbox_api_key' => $empresa->mapbox_api_key,
            'mapbox_active' => (bool) $empresa->mapbox_active,
            'google_maps_api_key' => $empresa->google_maps_api_key,
            'google_maps_active' => (bool) $empresa->google_maps_active,
        ]);
    }

    /**
     * Actualiza la configuración de Mapbox de la empresa del usuario.
     */
    public function updateMapbox(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'mapbox_api_key' => 'nullable|string|max:255',
            'mapbox_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];
        if ($request->has('mapbox_active')) {
            $updateData['mapbox_active'] = $validated['mapbox_active'];
        }
        if ($request->has('mapbox_api_key')) {
            $updateData['mapbox_api_key'] = $validated['mapbox_api_key'];
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Mapbox integration settings updated successfully.'),
        ]);
    }

    /**
     * Actualiza la configuración de Google Maps de la empresa del usuario.
     */
    public function updateGoogleMaps(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'google_maps_api_key' => 'nullable|string|max:255',
            'google_maps_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];
        if ($request->has('google_maps_active')) {
            $updateData['google_maps_active'] = $validated['google_maps_active'];
        }
        if ($request->has('google_maps_api_key')) {
            $updateData['google_maps_api_key'] = $validated['google_maps_api_key'];
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Google Maps integration settings updated successfully.'),
        ]);
    }

    /**
     * Actualiza la configuración de Google SMTP de la empresa del usuario.
     */
    public function updateGoogleSmtp(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'google_smtp_host' => 'nullable|string|max:255',
            'google_smtp_port' => 'nullable|integer|min:1|max:65535',
            'google_smtp_encryption' => 'nullable|string|in:tls,ssl,none,starttls',
            'google_smtp_email' => 'nullable|email|max:255',
            'google_smtp_password' => 'nullable|string|max:255',
            'google_smtp_from_address' => 'nullable|email|max:255',
            'google_smtp_from_name' => 'nullable|string|max:255',
            'google_smtp_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];

        if ($request->has('google_smtp_active')) {
            $updateData['google_smtp_active'] = $validated['google_smtp_active'];
        }

        if ($request->has('google_smtp_host')) {
            $updateData['google_smtp_host'] = $validated['google_smtp_host'] ?: 'smtp.gmail.com';
        }

        if ($request->has('google_smtp_port')) {
            $updateData['google_smtp_port'] = $validated['google_smtp_port'] ?: 587;
        }

        if ($request->has('google_smtp_encryption')) {
            $updateData['google_smtp_encryption'] = $validated['google_smtp_encryption'] ?: 'tls';
        }

        if ($request->has('google_smtp_email')) {
            $updateData['google_smtp_email'] = $validated['google_smtp_email'];
        }

        if ($request->has('google_smtp_from_address')) {
            $updateData['google_smtp_from_address'] = $validated['google_smtp_from_address'];
        }

        if ($request->has('google_smtp_from_name')) {
            $updateData['google_smtp_from_name'] = $validated['google_smtp_from_name'];
        }

        if (array_key_exists('google_smtp_password', $validated) && $validated['google_smtp_password'] !== null && $validated['google_smtp_password'] !== '') {
            $updateData['google_smtp_password'] = $validated['google_smtp_password'];
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Google SMTP settings updated successfully.'),
        ]);
    }

    /**
     * Prueba el envío de correo con la configuración de Google SMTP.
     */
    public function googleSmtpTest(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        if (empty($empresa->google_smtp_email) || empty($empresa->google_smtp_password)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please configure and save your Google Email and App Password before testing the connection.'),
            ]);
        }

        $recipientEmail = $request->input('test_email', $request->user()->email);

        if (! filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please provide a valid recipient email address.'),
            ]);
        }

        try {
            $host = $empresa->google_smtp_host ?: 'smtp.gmail.com';
            $port = (int) ($empresa->google_smtp_port ?: 587);
            $encryption = $empresa->google_smtp_encryption === 'none' ? null : ($empresa->google_smtp_encryption ?: 'tls');
            $username = $empresa->google_smtp_email;
            $password = $empresa->google_smtp_password;
            $fromAddress = $empresa->google_smtp_from_address ?: $empresa->google_smtp_email ?: config('mail.from.address');
            $fromName = $empresa->google_smtp_from_name ?: $empresa->razon_social ?: config('mail.from.name');

            config([
                'mail.mailers.google_smtp_test' => [
                    'transport' => 'smtp',
                    'host' => $host,
                    'port' => $port,
                    'encryption' => $encryption,
                    'username' => $username,
                    'password' => $password,
                    'timeout' => 15,
                ],
            ]);

            $companyName = $empresa->razon_social ?: 'MMM Venezuela';

            Mail::mailer('google_smtp_test')->raw(
                "¡Hola!\n\nEste es un mensaje de prueba enviado desde {$companyName} para verificar que la integración de Google SMTP está funcionando correctamente.\n\nFecha y hora: ".now()->translatedFormat('d/m/Y h:i A')."\n\nAtentamente,\nEquipo de {$companyName}",
                function ($message) use ($recipientEmail, $fromAddress, $fromName, $companyName) {
                    $message->from($fromAddress, $fromName)
                        ->to($recipientEmail)
                        ->subject("Prueba de Integración Google SMTP - {$companyName}");
                }
            );

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Test email sent successfully to :email', ['email' => $recipientEmail]),
            ]);
        } catch (\Throwable $e) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Google SMTP test failed: ').$e->getMessage(),
            ]);
        }
    }

    /**
     * Actualiza la configuración de Mailgun de la empresa del usuario.
     */
    public function updateMailgun(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'mailgun_domain' => 'nullable|string|max:255',
            'mailgun_secret' => 'nullable|string|max:255',
            'mailgun_endpoint' => 'nullable|string|max:100',
            'mailgun_from_address' => 'nullable|email|max:255',
            'mailgun_from_name' => 'nullable|string|max:255',
            'mailgun_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];

        if ($request->has('mailgun_active')) {
            $updateData['mailgun_active'] = $validated['mailgun_active'];
        }

        if ($request->has('mailgun_domain')) {
            $updateData['mailgun_domain'] = $validated['mailgun_domain'] ? trim($validated['mailgun_domain']) : null;
        }

        if ($request->has('mailgun_endpoint')) {
            $updateData['mailgun_endpoint'] = $validated['mailgun_endpoint'] ?: 'api.mailgun.net';
        }

        if ($request->has('mailgun_from_address')) {
            $updateData['mailgun_from_address'] = $validated['mailgun_from_address'];
        }

        if ($request->has('mailgun_from_name')) {
            $updateData['mailgun_from_name'] = $validated['mailgun_from_name'];
        }

        if (array_key_exists('mailgun_secret', $validated) && $validated['mailgun_secret'] !== null && $validated['mailgun_secret'] !== '') {
            $updateData['mailgun_secret'] = trim($validated['mailgun_secret']);
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Mailgun settings updated successfully.'),
        ]);
    }

    /**
     * Prueba el envío de correo a través de la API oficial de Mailgun.
     */
    public function mailgunTest(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        if (empty($empresa->mailgun_domain) || empty($empresa->mailgun_secret)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please configure and save your Mailgun Domain and API Key before testing the connection.'),
            ]);
        }

        $recipientEmail = $request->input('test_email', $request->user()->email);

        if (! filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please provide a valid recipient email address.'),
            ]);
        }

        try {
            $domain = trim($empresa->mailgun_domain);
            $secret = trim($empresa->mailgun_secret);
            $endpoint = $empresa->mailgun_endpoint ?: 'api.mailgun.net';
            $endpoint = rtrim(str_replace(['https://', 'http://'], '', $endpoint), '/');

            $fromName = $empresa->mailgun_from_name ?: $empresa->razon_social ?: config('mail.from.name');
            $fromEmail = $empresa->mailgun_from_address ?: ("postmaster@".$domain);
            $from = "{$fromName} <{$fromEmail}>";

            $companyName = $empresa->razon_social ?: 'MMM Venezuela';
            $url = "https://{$endpoint}/v3/{$domain}/messages";

            $response = \Illuminate\Support\Facades\Http::asForm()
                ->withBasicAuth('api', $secret)
                ->timeout(15)
                ->post($url, [
                    'from' => $from,
                    'to' => $recipientEmail,
                    'subject' => "Prueba de Integración Mailgun - {$companyName}",
                    'text' => "¡Hola!\n\nEste es un mensaje de prueba enviado desde {$companyName} para verificar que la integración de Mailgun API está funcionando correctamente.\n\nFecha y hora: ".now()->translatedFormat('d/m/Y h:i A')."\n\nAtentamente,\nEquipo de {$companyName}",
                ]);

            if ($response->successful()) {
                return back()->with('notification', [
                    'type' => 'success',
                    'message' => __('Test email sent successfully to :email via Mailgun.', ['email' => $recipientEmail]),
                ]);
            }

            $errorBody = $response->json('message') ?? $response->body();

            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Mailgun test failed (:status): :error', [
                    'status' => $response->status(),
                    'error' => $errorBody,
                ]),
            ]);
        } catch (\Throwable $e) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Mailgun test failed: ').$e->getMessage(),
            ]);
        }
    }

    /**
     * Actualiza la configuración de Mailpit de la empresa del usuario.
     */
    public function updateMailpit(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'mailpit_host' => 'nullable|string|max:255',
            'mailpit_port' => 'nullable|integer|min:1|max:65535',
            'mailpit_from_address' => 'nullable|email|max:255',
            'mailpit_from_name' => 'nullable|string|max:255',
            'mailpit_web_port' => 'nullable|integer|min:1|max:65535',
            'mailpit_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];

        if ($request->has('mailpit_active')) {
            $updateData['mailpit_active'] = $validated['mailpit_active'];
        }

        if ($request->has('mailpit_host')) {
            $rawHost = $validated['mailpit_host'] ? trim($validated['mailpit_host']) : '127.0.0.1';
            $cleanHost = preg_replace('#^https?://#i', '', $rawHost);
            $cleanHost = explode(':', $cleanHost)[0];
            $cleanHost = rtrim($cleanHost, '/');
            $updateData['mailpit_host'] = $cleanHost ?: '127.0.0.1';
        }

        if ($request->has('mailpit_port')) {
            $updateData['mailpit_port'] = $validated['mailpit_port'] ?? 1025;
        }

        if ($request->has('mailpit_from_address')) {
            $updateData['mailpit_from_address'] = $validated['mailpit_from_address'] ? trim($validated['mailpit_from_address']) : null;
        }

        if ($request->has('mailpit_from_name')) {
            $updateData['mailpit_from_name'] = $validated['mailpit_from_name'] ? trim($validated['mailpit_from_name']) : null;
        }

        if ($request->has('mailpit_web_port')) {
            $updateData['mailpit_web_port'] = $validated['mailpit_web_port'] ?? 8025;
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Mailpit settings updated successfully.'),
        ]);
    }

    /**
     * Envía un correo de prueba a través de Mailpit.
     */
    public function mailpitTest(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $recipientEmail = $request->input('test_email', $request->user()->email);

        if (! $recipientEmail || ! filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please provide a valid recipient email address.'),
            ]);
        }

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
                'mail.mailers.mailpit_test' => [
                    'transport' => 'smtp',
                    'host' => $host,
                    'port' => $port,
                    'encryption' => null,
                    'timeout' => 5,
                ],
            ]);

            $companyName = $empresa->razon_social ?: 'MMM Venezuela';

            \Illuminate\Support\Facades\Mail::mailer('mailpit_test')->raw(
                "¡Hola!\n\nEste es un mensaje de prueba enviado desde {$companyName} para verificar que la integración de Mailpit (SMTP Local) está funcionando correctamente.\n\nFecha y hora: ".now()->translatedFormat('d/m/Y h:i A')."\n\nAtentamente,\nEquipo de {$companyName}",
                function ($message) use ($recipientEmail, $fromAddress, $fromName, $companyName) {
                    $message->from($fromAddress, $fromName)
                        ->to($recipientEmail)
                        ->subject("Prueba de Integración Mailpit - {$companyName}");
                }
            );

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Test email sent successfully to :email via Mailpit.', ['email' => $recipientEmail]),
            ]);
        } catch (\Throwable $e) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Mailpit test failed: ').$e->getMessage(),
            ]);
        }
    }

    /**
     * Actualiza la configuración del middleware de Control de Acceso de la empresa del usuario.
     */
    public function updateControlAcceso(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'control_acceso_base_url' => 'nullable|url|max:255',
            'control_acceso_app_token' => 'nullable|string|max:255',
            'control_acceso_user_token' => 'nullable|string|max:255',
            'control_acceso_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];

        if ($request->has('control_acceso_active')) {
            $updateData['control_acceso_active'] = $validated['control_acceso_active'];
        }

        if ($request->has('control_acceso_base_url')) {
            $updateData['control_acceso_base_url'] = $validated['control_acceso_base_url'] ? rtrim($validated['control_acceso_base_url'], '/') : null;
        }

        if ($request->has('control_acceso_app_token')) {
            $updateData['control_acceso_app_token'] = $validated['control_acceso_app_token'];
        }

        if ($request->has('control_acceso_user_token')) {
            $updateData['control_acceso_user_token'] = $validated['control_acceso_user_token'];
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Access Control middleware settings updated successfully.'),
        ]);
    }

    /**
     * Prueba la conexión con el middleware de Control de Acceso usando las credenciales guardadas.
     */
    public function controlAccesoTest(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        if (empty($empresa->control_acceso_base_url) || empty($empresa->control_acceso_app_token) || empty($empresa->control_acceso_user_token)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please configure and save the Base URL and both tokens before testing the connection.'),
            ]);
        }

        $result = (new ControlAccesoService($empresa))->testConnection();

        return back()->with('notification', [
            'type' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
        ]);
    }

    /**
     * Muestra la documentación técnica interactiva de la API de WhatsApp.
     */
    public function whatsappDocs(Request $request)
    {
        $empresa = $request->user()?->empresa ?? Empresa::find(1);

        $currentLocale = app()->getLocale();
        $translations = file_exists($path = base_path('lang/'.$currentLocale.'.json'))
            ? json_decode(file_get_contents($path) ?: '{}', true)
            : [];

        return inertia('admin/integrations/docs', [
            'empresa_id' => $empresa?->id ?? 1,
            'empresa_nombre' => $empresa?->razon_social ?? $empresa?->name ?? 'MMM Venezuela',
            'whatsapp_api_url' => $empresa?->whatsapp_api_url ?? config('whatsapp.api_url', 'http://localhost:3000'),
            'whatsapp_instance' => $empresa?->whatsapp_instance ?? 'empresa_1',
            'whatsapp_api_key' => $empresa?->whatsapp_api_key ?? 'my_secret_key_123',
            'locale' => $currentLocale,
            'translations' => $translations,
        ]);
    }

    /**
     * Muestra la interfaz de configuración y estado de WhatsApp.
     */
    public function whatsappIndex(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return redirect()->route('dashboard')->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $whatsappService = new WhatsAppService($empresa);
        $status = $whatsappService->getStatus();

        // Sincronizar estado local en DB con estado en vivo
        $this->syncLocalWhatsAppStatus($empresa, $status);

        $queueStats = $whatsappService->getQueueStats();

        $currentLocale = app()->getLocale();
        $translations = file_exists($path = base_path('lang/'.$currentLocale.'.json'))
            ? json_decode(file_get_contents($path) ?: '{}', true)
            : [];

        // Obtener lista de países activos para el selector de teléfono
        $paises = Pais::where('activo', true)
            ->orderBy('nombre', 'asc')
            ->get(['id', 'nombre', 'codigo_iso2', 'codigo_telefonico']);

        $templates = WhatsAppTemplate::where('empresa_id', $empresa->id)
            ->where('activo', true)
            ->orderBy('categoria')
            ->orderBy('nombre')
            ->get();

        return inertia('admin/integrations/whatsapp', [
            'paises' => $paises,
            'templates' => $templates,
            'empresa_id' => $empresa->id,
            'empresa_nombre' => $empresa->razon_social ?? $empresa->name ?? 'Empresa',
            'whatsapp_api_key' => $empresa->whatsapp_api_key,
            'whatsapp_api_url' => $empresa->whatsapp_api_url ?? config('whatsapp.api_url', 'http://localhost:3000'),
            'whatsapp_instance' => $empresa->whatsapp_instance ?? ('empresa_'.$empresa->id),
            'whatsapp_rate_limit' => (int) ($empresa->whatsapp_rate_limit ?? 300),
            'whatsapp_warmup_mode' => (bool) ($empresa->whatsapp_warmup_mode ?? true),
            'whatsapp_working_hours_enabled' => (bool) ($empresa->whatsapp_working_hours_enabled ?? true),
            'whatsapp_working_hours_start' => $empresa->whatsapp_working_hours_start ?? '08:00',
            'whatsapp_working_hours_end' => $empresa->whatsapp_working_hours_end ?? '20:00',
            'whatsapp_proxy_url' => $empresa->whatsapp_proxy_url ?? '',
            'whatsapp_active' => (bool) $empresa->whatsapp_active,
            'whatsapp_phone' => $empresa->whatsapp_phone,
            'whatsapp_status' => $empresa->whatsapp_status,
            'live_status' => $status,
            'queue_stats' => $queueStats,
            'locale' => $currentLocale,
            'translations' => $translations,
        ]);
    }

    /**
     * Devuelve el estado en tiempo real (JSON) para polling del QR y conexión.
     */
    public function whatsappStatus(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return response()->json(['success' => false, 'error' => 'No active company found.'], 404);
        }

        $whatsappService = new WhatsAppService($empresa);
        $status = $whatsappService->getStatus();

        // Sincronizar estado local en DB con estado en vivo
        $this->syncLocalWhatsAppStatus($empresa, $status);
        $queueStats = $whatsappService->getQueueStats();

        return response()->json([
            'success' => true,
            'status' => $status,
            'whatsapp_status' => $empresa->whatsapp_status,
            'whatsapp_phone' => $empresa->whatsapp_phone,
            'queue_stats' => $queueStats,
        ]);
    }

    /**
     * Actualiza la configuración local de la empresa para WhatsApp.
     */
    public function whatsappUpdate(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'whatsapp_api_url' => 'nullable|url|max:255',
            'whatsapp_instance' => 'nullable|string|max:100',
            'whatsapp_api_key' => 'nullable|string|max:255',
            'whatsapp_active' => 'required|boolean',
            'whatsapp_rate_limit' => 'required|integer|min:1|max:1000',
        ]);

        $empresa->update([
            'whatsapp_api_url' => $validated['whatsapp_api_url'],
            'whatsapp_instance' => $validated['whatsapp_instance'],
            'whatsapp_api_key' => $validated['whatsapp_api_key'],
            'whatsapp_active' => $validated['whatsapp_active'],
            'whatsapp_rate_limit' => $validated['whatsapp_rate_limit'],
        ]);

        // Si la integración está activa, conectamos la instancia para crearla en el servidor y obtener su token UUID
        if ($validated['whatsapp_active']) {
            $whatsappService = new WhatsAppService($empresa);
            $result = $whatsappService->connect();
            if ($result) {
                $token = $result['instance']['token'] ?? $result['token'] ?? null;
                if ($token) {
                    $empresa->update(['whatsapp_api_key' => $token]);
                }
            }
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('WhatsApp settings updated and instance synced successfully.'),
        ]);
    }

    /**
     * Genera un nuevo token/API Key de WhatsApp para la empresa del usuario.
     */
    public function whatsappGenerateToken(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $randomPart = bin2hex(random_bytes(16));
        $token = 'whatsapp-'.$empresa->id.'-'.substr($randomPart, 0, 16);

        $empresa->update([
            'whatsapp_api_key' => $token,
        ]);

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('New WhatsApp API Key generated successfully.'),
        ]);
    }

    /**
     * Sincroniza la empresa con la API de WhatsApp usando el comando Artisan.
     */
    public function whatsappSync(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        if (empty($empresa->whatsapp_api_key)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please generate an API Key before syncing.'),
            ]);
        }

        try {
            Artisan::call('whatsapp:sync-company', [
                'empresa' => $empresa->id,
            ]);

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Company synced with WhatsApp server successfully.'),
            ]);
        } catch (\Exception $e) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Failed to sync company: ').$e->getMessage(),
            ]);
        }
    }

    /**
     * Inicia conexión en la API de WhatsApp.
     */
    public function whatsappConnect(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $whatsappService = new WhatsAppService($empresa);
        $result = $whatsappService->connect();

        if ($result && (isset($result['instance']) || isset($result['message']) || (isset($result['success']) && $result['success']))) {
            $token = $result['instance']['token'] ?? $result['token'] ?? null;
            if ($token) {
                $empresa->update([
                    'whatsapp_api_key' => $token,
                ]);
            }

            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Connection process started. Token assigned: ').($token ? substr($token, 0, 8).'...' : 'ok'),
            ]);
        }

        return back()->with('notification', [
            'type' => 'error',
            'message' => __('Failed to initiate connection.'),
        ]);
    }

    /**
     * Desconecta de la API de WhatsApp.
     */
    public function whatsappDisconnect(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $whatsappService = new WhatsAppService($empresa);
        $whatsappService->disconnect();

        // Limpiar estado en la base de datos de empresa local
        $empresa->update([
            'whatsapp_status' => 'disconnected',
            'whatsapp_phone' => null,
        ]);

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Disconnected from WhatsApp.'),
        ]);
    }

    /**
     * Fuerza reconexión de WhatsApp.
     */
    public function whatsappReconnect(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $whatsappService = new WhatsAppService($empresa);
        $whatsappService->reconnect();

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Reconnection forced successfully.'),
        ]);
    }

    /**
     * Devuelve las estadísticas de la cola de WhatsApp en tiempo real (JSON).
     */
    public function whatsappQueueStats(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return response()->json(['success' => false, 'error' => 'No active company found.'], 404);
        }

        $whatsappService = new WhatsAppService($empresa);
        $stats = $whatsappService->getQueueStats();

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }

    /**
     * Verifica si un número telefónico existe en WhatsApp.
     */
    public function whatsappCheckNumber(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return response()->json(['success' => false, 'error' => 'No active company found.'], 404);
        }

        $validated = $request->validate([
            'phone' => 'required|string|min:6|max:25',
        ]);

        $whatsappService = new WhatsAppService($empresa);
        $result = $whatsappService->checkNumber($validated['phone']);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Previsualiza variaciones de una plantilla con Spintax y variables dinámicas.
     */
    public function whatsappPreviewSpintax(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return response()->json(['success' => false, 'error' => 'No active company found.'], 404);
        }

        $validated = $request->validate([
            'template' => 'required|string|max:2000',
            'count' => 'nullable|integer|min:1|max:20',
            'variables' => 'nullable|array',
        ]);

        $whatsappService = new WhatsAppService($empresa);
        $variations = $whatsappService->previewSpintax(
            $validated['template'],
            $validated['count'] ?? 5,
            $validated['variables'] ?? []
        );

        return response()->json([
            'success' => true,
            'data' => $variations,
        ]);
    }

    /**
     * Actualiza configuración Anti-Baneo en el motor de WhatsApp.
     */
    public function whatsappUpdateAntiBan(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'dailyLimit' => 'nullable|integer|min:1|max:50000',
            'warmupMode' => 'nullable|boolean',
            'workingHoursEnabled' => 'nullable|boolean',
            'workingHoursStart' => 'nullable|string|max:10',
            'workingHoursEnd' => 'nullable|string|max:10',
            'proxyUrl' => 'nullable|string|max:255',
        ]);

        $updateData = [];
        if (isset($validated['dailyLimit'])) {
            $updateData['whatsapp_rate_limit'] = (int) $validated['dailyLimit'];
        }
        if (isset($validated['warmupMode'])) {
            $updateData['whatsapp_warmup_mode'] = (bool) $validated['warmupMode'];
        }
        if (isset($validated['workingHoursEnabled'])) {
            $updateData['whatsapp_working_hours_enabled'] = (bool) $validated['workingHoursEnabled'];
        }
        if (isset($validated['workingHoursStart'])) {
            $updateData['whatsapp_working_hours_start'] = $validated['workingHoursStart'];
        }
        if (isset($validated['workingHoursEnd'])) {
            $updateData['whatsapp_working_hours_end'] = $validated['workingHoursEnd'];
        }
        if (array_key_exists('proxyUrl', $validated)) {
            $updateData['whatsapp_proxy_url'] = $validated['proxyUrl'];
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        $whatsappService = new WhatsAppService($empresa);
        $whatsappService->updateAntiBan([
            'dailyLimit' => $validated['dailyLimit'] ?? $empresa->whatsapp_rate_limit,
            'warmupMode' => $validated['warmupMode'] ?? $empresa->whatsapp_warmup_mode,
            'workingHoursEnabled' => $validated['workingHoursEnabled'] ?? $empresa->whatsapp_working_hours_enabled,
            'workingHoursStart' => $validated['workingHoursStart'] ?? $empresa->whatsapp_working_hours_start,
            'workingHoursEnd' => $validated['workingHoursEnd'] ?? $empresa->whatsapp_working_hours_end,
            'proxyUrl' => $validated['proxyUrl'] ?? $empresa->whatsapp_proxy_url,
        ]);

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Anti-Ban & Messaging limits updated successfully.'),
        ]);
    }

    /**
     * Añade un número a la lista negra.
     */
    public function whatsappAddToBlacklist(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'phone' => 'required|string|min:6|max:25',
            'reason' => 'nullable|string|max:100',
        ]);

        $whatsappService = new WhatsAppService($empresa);
        $result = $whatsappService->addToBlacklist($validated['phone'], $validated['reason'] ?? 'MANUAL_BLOCK');

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Phone number added to blacklist successfully.'),
        ]);
    }

    /**
     * Elimina un número de la lista negra.
     */
    public function whatsappRemoveFromBlacklist(Request $request, string $phone)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $whatsappService = new WhatsAppService($empresa);
        $whatsappService->removeFromBlacklist($phone);

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('Phone number removed from blacklist.'),
        ]);
    }

    /**
     * Envía un mensaje de prueba con soporte Spintax y variables.
     */
    public function whatsappSendMessage(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'to' => 'required|string|min:8|max:25',
            'message' => 'required|string|max:2000',
            'variables' => 'nullable|array',
            'sync' => 'nullable|boolean',
        ]);

        $whatsappService = new WhatsAppService($empresa);

        // Envío seguro con Spintax y variables
        $result = $whatsappService->sendText(
            $validated['to'],
            $validated['message'],
            $validated['variables'] ?? ['nombre' => $request->user()->name ?? 'Usuario'],
            (bool) ($validated['sync'] ?? false)
        );

        if ($result && (isset($result['success']) && $result['success'] || isset($result['messageId']) || isset($result['jobId']) || isset($result['status']))) {
            return back()->with('notification', [
                'type' => 'success',
                'message' => __('Test message processed successfully! Spintax and variables resolved.'),
            ]);
        }

        $error = $result['error'] ?? __('Failed to send message. Check WhatsApp server logs.');

        return back()->with('notification', [
            'type' => 'error',
            'message' => __('Error: ').$error,
        ]);
    }

    /**
     * Muestra el panel de Validaciones (identidad/KYC) para la empresa del usuario.
     */
    public function validacionesIndex(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return redirect()->route('dashboard')->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        return inertia('admin/integrations/validaciones', [
            'jaak_api_key' => $empresa->jaak_api_key,
            'jaak_environment' => $empresa->jaak_environment ?? 'sandbox',
            'jaak_active' => (bool) $empresa->jaak_active,
        ]);
    }

    /**
     * Actualiza la configuración de JAAK (KYC) de la empresa del usuario.
     */
    public function updateJaak(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        $validated = $request->validate([
            'jaak_api_key' => 'nullable|string|max:4000',
            'jaak_environment' => 'sometimes|required|in:sandbox,production',
            'jaak_active' => 'sometimes|required|boolean',
        ]);

        $updateData = [];

        if ($request->has('jaak_active')) {
            $updateData['jaak_active'] = $validated['jaak_active'];
        }

        if ($request->has('jaak_api_key')) {
            $updateData['jaak_api_key'] = $validated['jaak_api_key'] ? trim($validated['jaak_api_key']) : null;
        }

        if ($request->has('jaak_environment')) {
            $updateData['jaak_environment'] = $validated['jaak_environment'];
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }

        return back()->with('notification', [
            'type' => 'success',
            'message' => __('JAAK integration settings updated successfully.'),
        ]);
    }

    /**
     * Prueba la conexión con JAAK usando las credenciales guardadas.
     */
    public function jaakTest(Request $request)
    {
        $empresa = $request->user()->empresa;

        if (! $empresa) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('No active company associated with your user.'),
            ]);
        }

        if (empty($empresa->jaak_api_key)) {
            return back()->with('notification', [
                'type' => 'error',
                'message' => __('Please configure and save the App Key before testing the connection.'),
            ]);
        }

        $result = (new JaakService($empresa))->testConnection();

        return back()->with('notification', [
            'type' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
        ]);
    }

    /**
     * Sincroniza el estado local de la empresa con la respuesta del servicio de WhatsApp.
     */
    private function syncLocalWhatsAppStatus(Empresa $empresa, $status)
    {
        $updateData = [];

        $token = $status['token'] ?? $status['raw']['token'] ?? null;
        if ($token && $empresa->whatsapp_api_key !== $token) {
            $updateData['whatsapp_api_key'] = $token;
        }

        if ($status && isset($status['isConnected']) && $status['isConnected']) {
            $livePhone = null;
            if (! empty($status['userJid'])) {
                $livePhone = explode('@', $status['userJid'])[0];
            } elseif (isset($status['user']['id'])) {
                $livePhone = explode('@', $status['user']['id'])[0];
            }

            $updateData['whatsapp_status'] = 'connected';
            $updateData['whatsapp_phone'] = $livePhone ?? $empresa->whatsapp_phone;
            $updateData['whatsapp_last_connected'] = now();
        } elseif ($status && isset($status['connectionState']) && $status['connectionState'] === 'connecting') {
            $updateData['whatsapp_status'] = 'connecting';
        } elseif ($status && isset($status['connectionState']) && $status['connectionState'] === 'qr_ready') {
            $updateData['whatsapp_status'] = 'qr_ready';
        } else {
            $updateData['whatsapp_status'] = 'disconnected';
        }

        if (! empty($updateData)) {
            $empresa->update($updateData);
        }
    }

    /**
     * 🩺 Diagnóstico y prueba de latencia en vivo del motor de WhatsApp
     */
    public function whatsappDiagnostic(Request $request)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return response()->json(['success' => false, 'error' => 'No active company found.'], 404);
        }

        $whatsappService = new WhatsAppService($empresa);
        $startTime = microtime(true);
        $status = $whatsappService->getStatus();
        $latencyMs = round((microtime(true) - $startTime) * 1000, 2);

        $healthData = null;
        try {
            $apiUrl = rtrim($empresa->whatsapp_api_url ?? config('whatsapp.api_url', 'http://localhost:3000'), '/');
            $res = \Illuminate\Support\Facades\Http::timeout(3)->get("{$apiUrl}/health");
            if ($res->successful()) {
                $healthData = $res->json();
            }
        } catch (\Throwable $e) {
            // Silencioso si falla
        }

        return response()->json([
            'success' => true,
            'latencyMs' => $latencyMs,
            'status' => $status,
            'health' => $healthData,
            'empresa_status' => $empresa->whatsapp_status,
            'last_connected' => $empresa->whatsapp_last_connected?->toIso8601String(),
        ]);
    }

    /**
     * 📬 Historial y logs de mensajes de WhatsApp
     */
    public function whatsappMessages(Request $request)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return response()->json(['success' => false, 'messages' => []], 404);
        }

        $query = WhatsAppMessage::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('recipient_phone', 'like', "%{$search}%")
                    ->orWhere('message_content', 'like', "%{$search}%")
                    ->orWhere('message_id', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        if ($direction = $request->input('direction')) {
            if ($direction !== 'all') {
                $query->where('direction', $direction);
            }
        }

        $messages = $query->orderBy('created_at', 'desc')->paginate((int) $request->input('per_page', 15));

        $totalSent = WhatsAppMessage::where('direction', 'outbound')->count();
        $totalDelivered = WhatsAppMessage::where('direction', 'outbound')->whereIn('status', ['delivered', 'read'])->count();
        $totalRead = WhatsAppMessage::where('direction', 'outbound')->where('status', 'read')->count();
        $totalFailed = WhatsAppMessage::where('direction', 'outbound')->where('status', 'failed')->count();

        $deliveryRate = $totalSent > 0 ? round(($totalDelivered / $totalSent) * 100, 1) : 100;
        $readRate = $totalDelivered > 0 ? round(($totalRead / $totalDelivered) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'messages' => $messages,
            'stats' => [
                'totalSent' => $totalSent,
                'totalDelivered' => $totalDelivered,
                'totalRead' => $totalRead,
                'totalFailed' => $totalFailed,
                'deliveryRate' => $deliveryRate,
                'readRate' => $readRate,
            ],
        ]);
    }

    /**
     * 🔄 Reintentar envío de mensaje fallido
     */
    public function whatsappRetryMessage(Request $request, $id)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return response()->json(['success' => false, 'error' => 'No active company.'], 404);
        }

        $message = WhatsAppMessage::findOrFail($id);
        $whatsappService = new WhatsAppService($empresa);

        $result = $whatsappService->sendText($message->recipient_phone, $message->message_content, $message->variables ?? []);

        if ($result && (isset($result['success']) && $result['success'] || isset($result['data']))) {
            $message->update([
                'status' => 'sent',
                'sent_at' => now(),
                'retry_count' => $message->retry_count + 1,
            ]);

            return response()->json(['success' => true, 'message' => __('Message re-queued successfully.')]);
        }

        $message->increment('retry_count');

        return response()->json(['success' => false, 'error' => __('Failed to retry message.')], 500);
    }

    /**
     * 📋 Crear plantilla de WhatsApp
     */
    public function whatsappTemplatesStore(Request $request)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return back()->with('notification', ['type' => 'error', 'message' => __('No active company.')]);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'categoria' => 'required|string|max:50',
            'contenido' => 'required|string',
            'variables' => 'nullable|array',
            'activo' => 'nullable|boolean',
        ]);

        WhatsAppTemplate::create([
            'empresa_id' => $empresa->id,
            'nombre' => $validated['nombre'],
            'categoria' => $validated['categoria'],
            'contenido' => $validated['contenido'],
            'variables' => $validated['variables'] ?? [],
            'activo' => $validated['activo'] ?? true,
        ]);

        return back()->with('notification', ['type' => 'success', 'message' => __('Template created successfully.')]);
    }

    /**
     * 📋 Actualizar plantilla de WhatsApp
     */
    public function whatsappTemplatesUpdate(Request $request, $id)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return back()->with('notification', ['type' => 'error', 'message' => __('No active company.')]);
        }

        $template = WhatsAppTemplate::where('empresa_id', $empresa->id)->findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:150',
            'categoria' => 'required|string|max:50',
            'contenido' => 'required|string',
            'variables' => 'nullable|array',
            'activo' => 'nullable|boolean',
        ]);

        $template->update($validated);

        return back()->with('notification', ['type' => 'success', 'message' => __('Template updated successfully.')]);
    }

    /**
     * 📋 Eliminar plantilla de WhatsApp
     */
    public function whatsappTemplatesDestroy(Request $request, $id)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return back()->with('notification', ['type' => 'error', 'message' => __('No active company.')]);
        }

        $template = WhatsAppTemplate::where('empresa_id', $empresa->id)->findOrFail($id);
        $template->delete();

        return back()->with('notification', ['type' => 'success', 'message' => __('Template deleted successfully.')]);
    }

    /**
     * 📢 Obtener destinatarios segmentados para Difusión Masiva (Broadcast)
     */
    public function whatsappBroadcastRecipients(Request $request)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return response()->json(['success' => false, 'error' => __('No active company.')], 400);
        }

        $target = $request->query('target', 'presbiteros'); // 'presbiteros' | 'pastores' | 'usuarios'
        $zona = $request->query('zona'); // optional zone filter

        $countryCode = $empresa->pais?->codigo_telefonico ?? '+58';
        $recipients = [];

        if ($target === 'presbiteros') {
            $query = User::where('empresa_id', $empresa->id)
                ->whereHas('roles', function ($q) {
                    $q->whereIn('name', ['Presbitero', 'Presbítero', 'presbitero']);
                });

            if (!empty($zona) && $zona !== 'all') {
                $query->where(function ($q) use ($zona) {
                    $q->where('zona', $zona)
                      ->orWhere('zona_2', $zona);
                });
            }

            $users = $query->orderBy('name')->get();

            foreach ($users as $u) {
                $rawPhone = $u->telefono ?? '';
                $formattedPhone = $rawPhone ? WhatsAppService::formatPhoneNumber($rawPhone, $countryCode) : '';
                $isValidPhone = !empty($formattedPhone) && strlen($formattedPhone) >= 10;
                $zonasList = implode(', ', $u->getZonasList()) ?: __('Unassigned');
                $distritosList = !empty($u->getDistritosList()) 
                    ? implode(', ', array_map(fn($d) => "D. {$d}", $u->getDistritosList()))
                    : __('Unassigned');

                $recipients[] = [
                    'id' => $u->id,
                    'type' => 'user',
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $rawPhone,
                    'formatted_phone' => $formattedPhone,
                    'is_valid_phone' => $isValidPhone,
                    'zonas' => $zonasList,
                    'distritos' => $distritosList,
                    'role' => 'Presbítero',
                ];
            }
        } elseif ($target === 'pastores') {
            $query = Pastor::where('empresa_id', $empresa->id)
                ->where('status', true);

            if (!empty($zona) && $zona !== 'all') {
                $query->where('zona', $zona);
            }

            $pastores = $query->orderBy('nombres')->get();

            foreach ($pastores as $p) {
                $rawPhone = $p->telefono ?? '';
                $formattedPhone = $rawPhone ? WhatsAppService::formatPhoneNumber($rawPhone, $countryCode) : '';
                $isValidPhone = !empty($formattedPhone) && strlen($formattedPhone) >= 10;

                $recipients[] = [
                    'id' => $p->id,
                    'type' => 'pastor',
                    'name' => trim("{$p->nombres} {$p->apellidos}"),
                    'email' => $p->email,
                    'phone' => $rawPhone,
                    'formatted_phone' => $formattedPhone,
                    'is_valid_phone' => $isValidPhone,
                    'zonas' => $p->zona ? "Zona {$p->zona}" : __('Unassigned'),
                    'distritos' => $p->distrito ? "Distrito {$p->distrito}" : __('Unassigned'),
                    'role' => $p->nivel_ministerial ?? 'Pastor',
                    'codigo' => $p->codigo,
                ];
            }
        } else { // 'usuarios'
            $query = User::where('empresa_id', $empresa->id);

            if (!empty($zona) && $zona !== 'all') {
                $query->where(function ($q) use ($zona) {
                    $q->where('zona', $zona)
                      ->orWhere('zona_2', $zona);
                });
            }

            $users = $query->orderBy('name')->get();

            foreach ($users as $u) {
                $rawPhone = $u->telefono ?? '';
                $formattedPhone = $rawPhone ? WhatsAppService::formatPhoneNumber($rawPhone, $countryCode) : '';
                $isValidPhone = !empty($formattedPhone) && strlen($formattedPhone) >= 10;
                $roleName = $u->roles->first()?->name ?? 'Usuario';

                $recipients[] = [
                    'id' => $u->id,
                    'type' => 'user',
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $rawPhone,
                    'formatted_phone' => $formattedPhone,
                    'is_valid_phone' => $isValidPhone,
                    'zonas' => implode(', ', $u->getZonasList()) ?: __('Unassigned'),
                    'distritos' => !empty($u->getDistritosList()) 
                        ? implode(', ', array_map(fn($d) => "D. {$d}", $u->getDistritosList()))
                        : __('Unassigned'),
                    'role' => $roleName,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'target' => $target,
            'count' => count($recipients),
            'valid_count' => count(array_filter($recipients, fn($r) => $r['is_valid_phone'])),
            'recipients' => $recipients,
        ]);
    }

    /**
     * 🚀 Despachar Difusión Masiva de WhatsApp (Broadcast Send)
     */
    public function whatsappBroadcastSend(Request $request)
    {
        $empresa = $request->user()->empresa;
        if (! $empresa) {
            return response()->json(['success' => false, 'error' => __('No active company.')], 400);
        }

        $validated = $request->validate([
            'target_type' => 'required|string|in:presbiteros,pastores,usuarios',
            'recipient_ids' => 'required|array|min:1',
            'recipient_ids.*' => 'required|integer',
            'message_content' => 'required|string|min:3',
            'delay_seconds' => 'nullable|integer|min:5|max:120',
        ]);

        $targetType = $validated['target_type'];
        $recipientIds = $validated['recipient_ids'];
        $messageTemplate = $validated['message_content'];

        $whatsappService = new WhatsAppService($empresa);
        $countryCode = $empresa->pais?->codigo_telefonico ?? '+58';
        $empresaName = $empresa->razon_social ?? $empresa->nombre ?? 'MMM Venezuela';

        $enqueued = 0;
        $errors = [];

        if ($targetType === 'presbiteros' || $targetType === 'usuarios') {
            $recipients = User::where('empresa_id', $empresa->id)
                ->whereIn('id', $recipientIds)
                ->get();

            foreach ($recipients as $recipient) {
                $rawPhone = $recipient->telefono;
                if (empty($rawPhone)) {
                    continue;
                }

                $formattedPhone = WhatsAppService::formatPhoneNumber($rawPhone, $countryCode);
                if (empty($formattedPhone)) {
                    continue;
                }

                $zonas = implode(', ', $recipient->getZonasList()) ?: 'Nacional';
                $distritos = !empty($recipient->getDistritosList()) 
                    ? implode(', ', array_map(fn($d) => "Distrito {$d}", $recipient->getDistritosList()))
                    : 'Nacional';

                $variables = [
                    'nombre' => $recipient->name,
                    'zonas' => $zonas,
                    'zona' => $recipient->zona ?: $zonas,
                    'distritos' => $distritos,
                    'distrito' => $recipient->distrito ?: $distritos,
                    'email' => $recipient->email,
                    'empresa' => $empresaName,
                    'fecha' => now()->translatedFormat('d/m/Y'),
                    'hora' => now()->format('h:i A'),
                    'random' => strtoupper(substr(md5(uniqid()), 0, 6)),
                ];

                $res = $whatsappService->sendText($formattedPhone, $messageTemplate, $variables, false);

                if ($res && !isset($res['error'])) {
                    $enqueued++;
                } else {
                    $errors[] = "Error al despachar a {$recipient->name} ({$formattedPhone})";
                }
            }
        } elseif ($targetType === 'pastores') {
            $recipients = Pastor::where('empresa_id', $empresa->id)
                ->whereIn('id', $recipientIds)
                ->get();

            foreach ($recipients as $recipient) {
                $rawPhone = $recipient->telefono;
                if (empty($rawPhone)) {
                    continue;
                }

                $formattedPhone = WhatsAppService::formatPhoneNumber($rawPhone, $countryCode);
                if (empty($formattedPhone)) {
                    continue;
                }

                $variables = [
                    'nombre' => trim("{$recipient->nombres} {$recipient->apellidos}"),
                    'codigo' => $recipient->codigo ?? 'N/A',
                    'grado' => $recipient->nivel_ministerial ?? 'Pastor',
                    'zona' => $recipient->zona ? "Zona {$recipient->zona}" : 'General',
                    'zonas' => $recipient->zona ? "Zona {$recipient->zona}" : 'General',
                    'distrito' => $recipient->distrito ? "Distrito {$recipient->distrito}" : 'General',
                    'distritos' => $recipient->distrito ? "Distrito {$recipient->distrito}" : 'General',
                    'email' => $recipient->email ?? '',
                    'empresa' => $empresaName,
                    'fecha' => now()->translatedFormat('d/m/Y'),
                    'hora' => now()->format('h:i A'),
                    'random' => strtoupper(substr(md5(uniqid()), 0, 6)),
                ];

                $res = $whatsappService->sendText($formattedPhone, $messageTemplate, $variables, false);

                if ($res && !isset($res['error'])) {
                    $enqueued++;
                } else {
                    $errors[] = "Error al despachar a {$recipient->nombres} ({$formattedPhone})";
                }
            }
        }

        return response()->json([
            'success' => true,
            'enqueued_count' => $enqueued,
            'errors' => $errors,
            'message' => __(':count broadcast messages enqueued successfully.', ['count' => $enqueued]),
        ]);
    }
}
