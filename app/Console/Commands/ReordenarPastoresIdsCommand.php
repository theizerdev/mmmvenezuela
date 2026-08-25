<?php

namespace App\Console\Commands;

use App\Models\Pastor;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReordenarPastoresIdsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pastores:reordenar-ids 
                            {--dry-run : Muestra los cambios proyectados sin modificar la base de datos}
                            {--update-codigos : Actualiza y regenera los códigos eclesiásticos con el nuevo ID}
                            {--force : Ejecuta el comando omitiendo la confirmación interactiva}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reordena correlativamente los IDs de la tabla pastores (1..N) y actualiza todas sus claves foráneas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('====================================================');
        $this->info('  REORDENAMIENTO CORRELATIVO DE IDs EN PASTORES     ');
        $this->info('====================================================');

        $isDryRun = $this->option('dry-run');
        $updateCodigos = $this->option('update-codigos');
        $force = $this->option('force');

        if ($isDryRun) {
            $this->warn(' [MODO SIMULACIÓN ACTIVADO (--dry-run)] - No se aplicará ningún cambio en la BD.');
        }

        // 1. Obtener todos los pastores ordenados por ID actual
        $pastores = DB::table('pastores')->orderBy('id', 'asc')->get();
        $totalPastores = $pastores->count();

        if ($totalPastores === 0) {
            $this->warn('No se encontraron registros en la tabla pastores.');
            return 0;
        }

        // 2. Construir el mapeo de IDs actuales a IDs nuevos correlativos (1, 2, 3, ... N)
        $mapping = [];
        $cambios = [];
        $hayDesfase = false;
        $newIdCounter = 1;

        foreach ($pastores as $pastor) {
            $oldId = (int)$pastor->id;
            $newId = $newIdCounter;

            $mapping[$oldId] = $newId;

            if ($oldId !== $newId) {
                $hayDesfase = true;
            }

            $cambios[] = [
                'old_id' => $oldId,
                'new_id' => $newId,
                'documento' => $pastor->documento ?? 'S/D',
                'nombre' => trim(($pastor->nombres ?? '') . ' ' . ($pastor->apellidos ?? '')),
                'cambia' => $oldId !== $newId ? 'SÍ' : 'NO',
            ];

            $newIdCounter++;
        }

        // 3. Mostrar resumen previo
        $this->table(
            ['ID Actual', 'Nuevo ID Correlativo', 'Documento', 'Pastor', '¿Cambia ID?'],
            array_slice(array_map(function ($item) {
                return [
                    $item['old_id'],
                    $item['new_id'],
                    $item['documento'],
                    $item['nombre'],
                    $item['cambia'],
                ];
            }, $cambios), 0, 20)
        );

        if ($totalPastores > 20) {
            $this->line("... y " . ($totalPastores - 20) . " registros más.");
        }

        $totalQueCambian = count(array_filter($cambios, fn($c) => $c['cambia'] === 'SÍ'));

        $this->newLine();
        $this->info("Total de pastores registrados: {$totalPastores}");
        $this->info("Pastores que cambiarán de ID: {$totalQueCambian}");

        // Verificar si la tabla ya está perfectamente correlativa
        if (!$hayDesfase) {
            $this->info('Todos los IDs de la tabla pastores ya están en secuencia correlativa perfecta (1 a ' . $totalPastores . ').');
            
            if ($updateCodigos && !$isDryRun) {
                $this->info('Actualizando códigos eclesiásticos de los pastores...');
                $pastoresActualizados = DB::table('pastores')->get();
                foreach ($pastoresActualizados as $p) {
                    $nuevoCodigo = Pastor::generateCodigo(
                        $p->documento ?? '',
                        $p->zona,
                        $p->distrito,
                        (int)$p->id
                    );
                    DB::table('pastores')->where('id', $p->id)->update(['codigo' => $nuevoCodigo]);
                }
                $this->info('Códigos eclesiásticos actualizados correctamente.');
            }

            // Ajustar solo el AUTO_INCREMENT si es necesario
            if (!$isDryRun) {
                $nextAuto = $totalPastores + 1;
                DB::statement("ALTER TABLE pastores AUTO_INCREMENT = {$nextAuto};");
                $this->info("AUTO_INCREMENT de la tabla pastores ajustado a: {$nextAuto}");
            }
            return 0;
        }

        // 4. Solicitar confirmación si no es simulación ni se pasó --force
        if (!$isDryRun && !$force) {
            if (!$this->confirm('¿Está seguro de que desea reordenar los IDs y actualizar todas las referencias asociadas?')) {
                $this->warn('Operación cancelada por el usuario.');
                return 1;
            }
        }

        if ($isDryRun) {
            $this->info('Simulación completada con éxito. Ejecute sin --dry-run para aplicar los cambios.');
            return 0;
        }

        // 5. Ejecutar la actualización dentro de una transacción segura
        $this->info('Aplicando cambios en la base de datos...');

        $progressBar = $this->output->createProgressBar(5);
        $progressBar->start();

        try {
            // Desactivar temporalmente validación de foreign keys
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            DB::transaction(function () use ($mapping, $updateCodigos, $progressBar) {
                $tempOffset = 1000000; // Offset temporal alto para evitar colisiones de primary key

                // PASO 1: Mover IDs a identificadores temporales
                foreach ($mapping as $oldId => $newId) {
                    $tempId = $tempOffset + $newId;
                    DB::table('pastores')->where('id', $oldId)->update(['id' => $tempId]);
                }
                $progressBar->advance();

                // PASO 2: Asignar los IDs finales correlativos (1, 2, ... N)
                foreach ($mapping as $oldId => $newId) {
                    $tempId = $tempOffset + $newId;
                    DB::table('pastores')->where('id', $tempId)->update(['id' => $newId]);
                }
                $progressBar->advance();

                // PASO 3: Actualizar relaciones foráneas
                // 3.1. Conyuge en pastores (conyuge_id)
                foreach ($mapping as $oldId => $newId) {
                    DB::table('pastores')
                        ->where('conyuge_id', $oldId)
                        ->update(['conyuge_id' => $newId]);
                }

                // 3.2. Tabla iglesias (pastor_id)
                if (Schema::hasTable('iglesias') && Schema::hasColumn('iglesias', 'pastor_id')) {
                    foreach ($mapping as $oldId => $newId) {
                        DB::table('iglesias')
                            ->where('pastor_id', $oldId)
                            ->update(['pastor_id' => $newId]);
                    }
                }

                // 3.3. Tabla pivot iglesia_pastor (pastor_id)
                if (Schema::hasTable('iglesia_pastor') && Schema::hasColumn('iglesia_pastor', 'pastor_id')) {
                    foreach ($mapping as $oldId => $newId) {
                        DB::table('iglesia_pastor')
                            ->where('pastor_id', $oldId)
                            ->update(['pastor_id' => $newId]);
                    }
                }

                // 3.4. Tabla activity_log si existe
                if (Schema::hasTable('activity_log')) {
                    foreach ($mapping as $oldId => $newId) {
                        DB::table('activity_log')
                            ->where('subject_type', 'App\\Models\\Pastor')
                            ->where('subject_id', $oldId)
                            ->update(['subject_id' => $newId]);

                        DB::table('activity_log')
                            ->where('causer_type', 'App\\Models\\Pastor')
                            ->where('causer_id', $oldId)
                            ->update(['causer_id' => $newId]);
                    }
                }
                $progressBar->advance();

                // PASO 4: Opcional - Actualizar códigos de pastores si se solicitó
                if ($updateCodigos) {
                    $pastoresActualizados = DB::table('pastores')->get();
                    foreach ($pastoresActualizados as $p) {
                        $nuevoCodigo = Pastor::generateCodigo(
                            $p->documento ?? '',
                            $p->zona,
                            $p->distrito,
                            (int)$p->id
                        );
                        DB::table('pastores')->where('id', $p->id)->update(['codigo' => $nuevoCodigo]);
                    }
                }
                $progressBar->advance();
            });

            // PASO 5: Ajustar AUTO_INCREMENT y reactivar claves foráneas (Fuera de DB::transaction porque ALTER TABLE causa un commit implícito en MySQL)
            $nextAutoIncrement = $totalPastores + 1;
            DB::statement("ALTER TABLE pastores AUTO_INCREMENT = {$nextAutoIncrement};");
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $progressBar->advance();

            $progressBar->finish();
            $this->newLine(2);

            $this->info('¡Los IDs de la tabla pastores han sido reordenados correlativamente con éxito!');
            $this->info('Claves foráneas asociadas en iglesias, iglesia_pastor y conyuges actualizadas.');
            $this->info("Próximo AUTO_INCREMENT configurado en: {$nextAutoIncrement}");

            return 0;
        } catch (\Throwable $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $this->newLine();
            $this->error('Ocurrió un error durante la reasignación de IDs: ' . $e->getMessage());
            return 1;
        }
    }
}
