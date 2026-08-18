<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pastor;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class FelicitarCumpleanerosCommand extends Command
{
    /**
     * El nombre y firma del comando artisan.
     *
     * @var string
     */
    protected $signature = 'pastores:felicitar-cumpleaneros {--dry-run : Simular sin enviar mensajes reales} {--force : Forzar re-envío aunque ya se haya enviado hoy}';

    /**
     * La descripción del comando artisan.
     *
     * @var string
     */
    protected $description = 'Verifica y envía felicitaciones de cumpleaños automáticas por WhatsApp a los pastores que cumplen años hoy.';

    /**
     * Ejecuta el comando.
     */
    public function handle()
    {
        $todayMonth = Carbon::now()->month;
        $todayDay = Carbon::now()->day;
        $todayDateStr = Carbon::now()->format('Y-m-d');
        $isDryRun = $this->option('dry-run');
        $force = $this->option('force');

        $this->info("Verificando pastores cumpleañeros para la fecha: " . Carbon::now()->format('d/m/Y'));

        $pastoresCumpleaneros = Pastor::whereNotNull('fe_nacimiento')
            ->whereRaw('MONTH(fe_nacimiento) = ? AND DAY(fe_nacimiento) = ?', [$todayMonth, $todayDay])
            ->where('status', true)
            ->get();

        if ($pastoresCumpleaneros->isEmpty()) {
            $this->info('No hay pastores cumpliendo años el día de hoy.');
            return 0;
        }

        $this->info("Se encontraron {$pastoresCumpleaneros->count()} pastores cumpleañeros hoy:");

        foreach ($pastoresCumpleaneros as $pastor) {
            $nombreCompleto = "{$pastor->nombres} {$pastor->apellidos}";
            $telefono = $pastor->telefono_tlf ?: $pastor->telefono_hab;
            $zona = $pastor->zona;
            $cacheKey = "pastor_bday_sent_{$pastor->id}_{$todayDateStr}";

            if (Cache::has($cacheKey) && !$force && !$isDryRun) {
                $this->line(" ℹ️ {$nombreCompleto}: ya recibió su felicitación de cumpleaños el día de hoy. Omitiendo duplicado.");
                continue;
            }

            $mensaje = "🎉 *¡FELIZ CUMPLEAÑOS PASTOR(A)!* 🎂\n\n"
                     . "Estimado(a) Pastor(a) *{$nombreCompleto}*,\n\n"
                     . "De parte de la Directiva Nacional y de toda la familia del *Movimiento Misionero Mundial en Venezuela*, le enviamos un caluroso saludo y nuestras más sinceras felicitaciones en este día tan especial.\n\n"
                     . "Que el Señor continúe bendiciendo grandemente su vida, su hogar y su valioso ministerio en la Zona {$zona}.\n\n"
                     . "📖 *«El Señor te bendiga y te guarde; el Señor haga resplandecer su rostro sobre ti...» (Números 6:24-25)*";

            $this->line(" - {$nombreCompleto} (Teléfono: " . ($telefono ?: 'No registrado') . ")");

            if (!$isDryRun) {
                // Registrar en Log del Sistema y en Cache para evitar duplicados
                Log::info("Felicitación automática de cumpleaños despachada al Pastor: {$nombreCompleto} (ID: {$pastor->id})");
                Cache::put($cacheKey, true, now()->endOfDay());

                if ($telefono) {
                    try {
                        $whatsappService = new WhatsAppService();
                        $result = $whatsappService->sendMessage($telefono, $mensaje);
                        if ($result) {
                            $this->info("   ✅ Notificación WhatsApp enviada exitosamente a {$nombreCompleto} ({$telefono}).");
                        } else {
                            $this->warn("   ⚠️ Servidor WhatsApp devolvió error al entregar a {$nombreCompleto} ({$telefono}).");
                        }
                    } catch (\Throwable $e) {
                        $this->error("   ❌ Error enviando WhatsApp a {$nombreCompleto}: " . $e->getMessage());
                        Log::error("Error enviando WhatsApp de cumpleaños a {$nombreCompleto}: " . $e->getMessage());
                    }
                } else {
                    $this->warn("   ⚠️ Pastor {$nombreCompleto} no posee teléfono registrado.");
                }
            } else {
                $this->comment("   [Modo Simulación] Mensaje preparado:");
                $this->line("   " . str_replace("\n", "\n   ", $mensaje));
            }
        }

        $this->info('Proceso de felicitaciones completado.');
        return 0;
    }
}
