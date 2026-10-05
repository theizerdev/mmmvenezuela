<?php

namespace App\Console\Commands;

use App\Models\Iglesia;
use App\Models\Pastor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class NormalizarPastorZonasCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pastores:normalizar-zonas
                            {--dry-run : Muestra los registros proyectados a modificar sin alterar la base de datos}
                            {--without-codigos : No actualiza el código eclesiástico de los pastores}
                            {--regenerate-codigos : Fuerza la regeneración del código eclesiástico con el ID actual en vez de solo sustituir el prefijo de zona}
                            {--sync-iglesias : También normaliza la zona de las extensiones/iglesias asociadas}
                            {--force : Ejecuta el comando directamente sin solicitar confirmación interactiva}';

    /**
     * Alias signatures for convenience.
     *
     * @var array<int, string>
     */
    protected $aliases = [
        'pastores:limpiar-zonas',
        'pastores:corregir-zonas',
        'pastores:fix-zonas',
    ];

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convierte la zona de los pastores a números enteros sin ceros a la izquierda (ej. 01..09 -> 1..9) y actualiza sus códigos eclesiásticos';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $withoutCodigos = (bool) $this->option('without-codigos');
        $regenerateCodigos = (bool) $this->option('regenerate-codigos');
        $syncIglesias = (bool) $this->option('sync-iglesias');
        $force = (bool) $this->option('force');

        $this->newLine();
        $this->line('<fg=cyan>╔══════════════════════════════════════════════════════════════════════════════════════════╗</>');
        $this->line('<fg=cyan>║        NORMALIZACIÓN DE ZONAS (NÚMEROS ENTEROS SIN CEROS A LA IZQUIERDA)        ║</>');
        $this->line('<fg=cyan>║                               MMM VENEZUELA                                              ║</>');
        $this->line('<fg=cyan>╚══════════════════════════════════════════════════════════════════════════════════════════╝</>');
        $this->newLine();

        if ($dryRun) {
            $this->warn('⚠ MODO SIMULACIÓN (--dry-run): No se realizará ningún cambio en la base de datos.');
            $this->newLine();
        }

        // 1. Obtener y analizar Pastores
        $pastores = Pastor::withoutTenant()->orderBy('id')->get();
        $pastoresModificados = [];

        foreach ($pastores as $pastor) {
            $zonaActual = (string) ($pastor->zona ?? '');
            $nuevaZona = self::normalizarZona($zonaActual);

            if ($nuevaZona !== null && $zonaActual !== $nuevaZona) {
                $codigoActual = (string) ($pastor->codigo ?? '');
                $nuevoCodigo = ! $withoutCodigos
                    ? self::calcularNuevoCodigo($pastor, $nuevaZona, $regenerateCodigos)
                    : $codigoActual;

                $pastoresModificados[] = [
                    'pastor' => $pastor,
                    'zona_actual' => $zonaActual,
                    'nueva_zona' => $nuevaZona,
                    'codigo_actual' => $codigoActual,
                    'nuevo_codigo' => $nuevoCodigo,
                    'table_row' => [
                        $pastor->id,
                        mb_strimwidth($pastor->nombre_completo, 0, 28, '...'),
                        $pastor->documento ?? 'S/D',
                        $zonaActual,
                        "<fg=green;options=bold>{$nuevaZona}</>",
                        $codigoActual ?: '<vacio>',
                        ($nuevoCodigo !== $codigoActual) ? "<fg=green>{$nuevoCodigo}</>" : ($codigoActual ?: '<vacio>'),
                    ],
                ];
            }
        }

        // 2. Obtener y analizar Iglesias / Extensiones
        $iglesias = Iglesia::withoutTenant()->orderBy('id')->get();
        $iglesiasModificadas = [];

        foreach ($iglesias as $iglesia) {
            $zonaActual = (string) ($iglesia->zona ?? '');
            $nuevaZona = self::normalizarZona($zonaActual);

            if ($nuevaZona !== null && $zonaActual !== $nuevaZona) {
                $iglesiasModificadas[] = [
                    'iglesia' => $iglesia,
                    'zona_actual' => $zonaActual,
                    'nueva_zona' => $nuevaZona,
                    'table_row' => [
                        $iglesia->id,
                        mb_strimwidth($iglesia->nombre, 0, 36, '...'),
                        $iglesia->pastor_id ? "Pastor ID #{$iglesia->pastor_id}" : 'Sin pastor',
                        $zonaActual,
                        "<fg=green;options=bold>{$nuevaZona}</>",
                    ],
                ];
            }
        }

        // Resumen inicial
        $this->line('• Total de pastores analizados: <fg=white;options=bold>' . $pastores->count() . '</>');
        $this->line('• Pastores con zona a corregir: <fg=' . (count($pastoresModificados) > 0 ? 'yellow;options=bold' : 'green') . '>' . count($pastoresModificados) . '</>');
        $this->line('• Extensiones con zona a corregir: <fg=' . (count($iglesiasModificadas) > 0 ? 'yellow;options=bold' : 'green') . '>' . count($iglesiasModificadas) . '</>');
        $this->newLine();

        if (empty($pastoresModificados) && empty($iglesiasModificadas)) {
            $this->info('✓ ¡Perfecto! Todas las zonas de pastores e extensiones ya están en formato entero sin ceros a la izquierda.');
            return Command::SUCCESS;
        }

        // Mostrar tabla de Pastores
        if (! empty($pastoresModificados)) {
            $this->line('<fg=yellow;options=bold>Pastores que serán normalizados (' . count($pastoresModificados) . '):</>');
            $this->table(
                ['ID', 'Nombre', 'Cédula', 'Zona Actual', 'Nueva Zona', 'Código Actual', 'Nuevo Código'],
                array_column($pastoresModificados, 'table_row')
            );
            $this->newLine();
        }

        // Mostrar tabla de Iglesias / Extensiones
        if (! empty($iglesiasModificadas)) {
            $this->line('<fg=yellow;options=bold>Extensiones / Iglesias detectadas con ceros a la izquierda (' . count($iglesiasModificadas) . '):</>');
            $this->table(
                ['ID Ext.', 'Nombre de la Extensión', 'Pastor Asignado', 'Zona Actual', 'Nueva Zona'],
                array_column($iglesiasModificadas, 'table_row')
            );
            $this->newLine();
        }

        // Si es Dry-Run, finalizar aquí
        if ($dryRun) {
            $this->info('[SIMULACIÓN FINALIZADA] No se aplicaron cambios.');
            $this->line('Para aplicar estas modificaciones en la base de datos, ejecute el comando sin <fg=yellow>--dry-run</>.');
            $this->line('Ejemplo: <fg=cyan>php artisan pastores:normalizar-zonas --sync-iglesias</>');
            return Command::SUCCESS;
        }

        // Preguntar por la sincronización de Iglesias si no se especificó la opción y estamos en modo interactivo
        if (! $syncIglesias && ! empty($iglesiasModificadas) && ! $force) {
            $syncIglesias = $this->confirm(
                '¿Desea normalizar también la zona de las ' . count($iglesiasModificadas) . ' extensiones/iglesias detectadas?',
                true
            );
            $this->newLine();
        }

        // Confirmación interactiva antes de escribir en DB
        if (! $force) {
            $detalles = count($pastoresModificados) . ' pastor(es)';
            if ($syncIglesias && ! empty($iglesiasModificadas)) {
                $detalles .= ' y ' . count($iglesiasModificadas) . ' extensión(es)';
            }
            if (! $this->confirm("¿Confirma que desea actualizar {$detalles} en la base de datos?", true)) {
                $this->warn('Operación cancelada por el usuario. No se modificó ningún dato.');
                return Command::SUCCESS;
            }
            $this->newLine();
        }

        // Ejecución en Transacción
        $pastoresActualizados = 0;
        $iglesiasActualizadas = 0;

        DB::beginTransaction();
        try {
            // Actualizar Pastores
            foreach ($pastoresModificados as $item) {
                /** @var Pastor $pastor */
                $pastor = $item['pastor'];
                $pastor->zona = $item['nueva_zona'];

                if (! $withoutCodigos) {
                    $pastor->codigo = $item['nuevo_codigo'];
                }

                $pastor->save();
                $pastoresActualizados++;
            }

            // Actualizar Iglesias (si aplica)
            if ($syncIglesias) {
                foreach ($iglesiasModificadas as $item) {
                    /** @var Iglesia $iglesia */
                    $iglesia = $item['iglesia'];
                    $iglesia->zona = $item['nueva_zona'];
                    $iglesia->save();
                    $iglesiasActualizadas++;
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Ocurrió un error inesperado durante la actualización: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $this->info("✓ ¡Operación completada exitosamente!");
        $this->line("• Pastores actualizados: <fg=green;options=bold>{$pastoresActualizados}</>");
        if ($syncIglesias) {
            $this->line("• Extensiones/Iglesias actualizadas: <fg=green;options=bold>{$iglesiasActualizadas}</>");
        }
        if (! $withoutCodigos) {
            $this->line("• Códigos eclesiásticos sincronizados: <fg=green;options=bold>{$pastoresActualizados}</>");
        }
        $this->newLine();

        return Command::SUCCESS;
    }

    /**
     * Convierte un valor de zona (ej: "01", "02", "09", " 03 ", "Zona 02")
     * a su representación entera sin ceros a la izquierda (ej: "1", "2", "9").
     */
    public static function normalizarZona(?string $zona): ?string
    {
        if ($zona === null) {
            return null;
        }

        $trimmed = trim((string) $zona);
        if ($trimmed === '') {
            return null;
        }

        // 1. Número con ceros a la izquierda (ej: "01", "02", "09", "005")
        if (preg_match('/^0+(\d+)$/', $trimmed, $matches)) {
            return (string) (int) $matches[1];
        }

        // 2. Prefijo tipo "Zona 02", "Zona 2", "Z-02"
        if (preg_match('/^zona\s*[-#]?\s*0*(\d+)$/i', $trimmed, $matches)) {
            return (string) (int) $matches[1];
        }

        // 3. Cadena puramente numérica (ej: "1", "10", "41")
        if (ctype_digit($trimmed)) {
            return (string) (int) $trimmed;
        }

        return $trimmed;
    }

    /**
     * Calcula el nuevo código del pastor con la zona normalizada.
     */
    public static function calcularNuevoCodigo(Pastor $pastor, string $nuevaZona, bool $regenerateAll = false): string
    {
        if ($regenerateAll) {
            return Pastor::generateCodigo($pastor->documento ?? '', $nuevaZona, $pastor->distrito, (int) $pastor->id);
        }

        $numDoc = preg_replace('/\D/', '', (string) ($pastor->documento ?? ''));
        $oldZona = (string) ($pastor->zona ?? '');

        // Si el código actual fue construido con la cédula y la zona anterior al inicio
        // Ejemplo: "7631948" + "02" + "10180" => "7631948" + "2" + "10180"
        if (! empty($numDoc) && ! empty($oldZona) && ! empty($pastor->codigo) && str_starts_with($pastor->codigo, $numDoc . $oldZona)) {
            return $numDoc . $nuevaZona . substr($pastor->codigo, strlen($numDoc . $oldZona));
        }

        // Fallback: usar el generador estándar del modelo Pastor
        return Pastor::generateCodigo($pastor->documento ?? '', $nuevaZona, $pastor->distrito, (int) $pastor->id);
    }
}
