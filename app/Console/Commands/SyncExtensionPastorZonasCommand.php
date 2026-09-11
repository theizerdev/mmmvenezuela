<?php

namespace App\Console\Commands;

use App\Models\Iglesia;
use App\Models\Pastor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncExtensionPastorZonasCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:extensiones-pastores
                            {--from=pastor : Origen de datos: "pastor" (la extensión toma la zona/distrito del pastor) o "extension" (el pastor toma la zona/distrito de la extensión)}
                            {--dry-run : Muestra los cambios previstos sin modificar la base de datos}
                            {--force : Ejecuta la sincronización sin solicitar confirmación interactiva}';

    /**
     * Alias signatures for convenience.
     *
     * @var array<int, string>
     */
    protected $aliases = [
        'extensiones:sync-zonas',
        'sync:zonas-distritos',
    ];

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincroniza la zona y distrito entre las extensiones (iglesias) y su pastor principal';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $from = strtolower(trim((string) $this->option('from') ?: 'pastor'));
        $dryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');

        if (!in_array($from, ['pastor', 'extension'], true)) {
            $this->error("Opción --from inválida. Valores permitidos: 'pastor' o 'extension'.");
            return Command::FAILURE;
        }

        $this->info('');
        $this->line('<fg=cyan>╔════════════════════════════════════════════════════════════════════════════╗</>');
        $this->line('<fg=cyan>║  Sincronización de Zona y Distrito (Extensiones <-> Pastores Principales)  ║</>');
        $this->line('<fg=cyan>╚════════════════════════════════════════════════════════════════════════════╝</>');
        $this->info('');

        $directionLabel = $from === 'pastor'
            ? 'Pastor Principal -> Extensión (la extensión hereda la zona y distrito del pastor)'
            : 'Extensión -> Pastor Principal (el pastor hereda la zona y distrito de la extensión)';

        $this->line("Dirección configurada: <fg=yellow>{$directionLabel}</>");
        if ($dryRun) {
            $this->warn("MODO SIMULACIÓN (--dry-run): No se guardarán cambios en la base de datos.");
        }
        $this->newLine();

        $totalIglesias = Iglesia::count();
        $iglesias = Iglesia::whereNotNull('pastor_id')
            ->with(['pastor.estado', 'estado'])
            ->get();

        $sinPastor = $totalIglesias - $iglesias->count();

        $this->line("• Total de extensiones registradas: <fg=white;options=bold>{$totalIglesias}</>");
        $this->line("• Extensiones con pastor principal asignado: <fg=green;options=bold>{$iglesias->count()}</>");
        if ($sinPastor > 0) {
            $this->line("• Extensiones sin pastor principal (omitidas): <fg=gray>{$sinPastor}</>");
        }
        $this->newLine();

        $discrepancias = [];

        foreach ($iglesias as $iglesia) {
            $pastor = $iglesia->pastor;
            if (!$pastor) {
                continue;
            }

            $igZona = (string) ($iglesia->zona ?? '');
            $igDist = (string) ($iglesia->distrito ?? '');
            $pasZona = (string) ($pastor->zona ?? '');
            $pasDist = (string) ($pastor->distrito ?? '');

            if ($igZona !== $pasZona || $igDist !== $pasDist) {
                $accion = $from === 'pastor'
                    ? "Extensión Zona: {$igZona} -> {$pasZona} | Dist: {$igDist} -> {$pasDist}"
                    : "Pastor Zona: {$pasZona} -> {$igZona} | Dist: {$pasDist} -> {$igDist}";

                $discrepancias[] = [
                    'iglesia' => $iglesia,
                    'pastor' => $pastor,
                    'row' => [
                        $iglesia->id,
                        mb_strimwidth($iglesia->nombre, 0, 30, '...'),
                        $iglesia->estado?->nombre ?? 'N/A',
                        $igZona !== '' ? $igZona : '<vacio>',
                        $igDist !== '' ? $igDist : '<vacio>',
                        $pastor->id,
                        mb_strimwidth($pastor->nombre_completo, 0, 25, '...'),
                        $pasZona !== '' ? $pasZona : '<vacio>',
                        $pasDist !== '' ? $pasDist : '<vacio>',
                        $accion,
                    ],
                ];
            }
        }

        if (empty($discrepancias)) {
            $this->info("✓ ¡Excelente! Todas las extensiones y sus pastores principales ya se encuentran sincronizados.");
            return Command::SUCCESS;
        }

        $this->warn("Se encontraron " . count($discrepancias) . " discrepancia(s) entre extensión y pastor principal:");
        $this->newLine();

        $this->table(
            [
                'ID Ext.',
                'Extensión',
                'Estado Ext.',
                'Zona Ext.',
                'Dist. Ext.',
                'ID Past.',
                'Pastor Principal',
                'Zona Past.',
                'Dist. Past.',
                'Acción a Realizar',
            ],
            array_column($discrepancias, 'row')
        );

        $this->newLine();

        if ($dryRun) {
            $this->info("[SIMULACIÓN FINALIZADA] Se detectaron " . count($discrepancias) . " registro(s) listos para sincronizar.");
            $this->line("Para aplicar los cambios, ejecute el comando sin <fg=yellow>--dry-run</>.");
            return Command::SUCCESS;
        }

        if (!$force) {
            $confirmMsg = "¿Desea proceder a sincronizar estas " . count($discrepancias) . " entidad(es) con origen [{$from}]?";
            if (!$this->confirm($confirmMsg, true)) {
                $this->warn("Operación cancelada por el usuario.");
                return Command::SUCCESS;
            }
        }

        $actualizados = 0;

        DB::beginTransaction();
        try {
            foreach ($discrepancias as $item) {
                /** @var Iglesia $iglesia */
                $iglesia = $item['iglesia'];
                /** @var Pastor $pastor */
                $pastor = $item['pastor'];

                if ($from === 'pastor') {
                    $iglesia->zona = $pastor->zona;
                    $iglesia->distrito = $pastor->distrito;
                    $iglesia->save();
                } else {
                    $pastor->zona = $iglesia->zona;
                    $pastor->distrito = $iglesia->distrito;
                    $pastor->codigo = Pastor::generateCodigo(
                        $pastor->documento ?? '',
                        $iglesia->zona,
                        $iglesia->distrito,
                        $pastor->id
                    );
                    $pastor->save();
                }

                $actualizados++;
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error("Ocurrió un error al sincronizar: " . $e->getMessage());
            return Command::FAILURE;
        }

        $this->info("✓ ¡Sincronización completada exitosamente! Se actualizaron {$actualizados} registro(s).");
        return Command::SUCCESS;
    }
}
