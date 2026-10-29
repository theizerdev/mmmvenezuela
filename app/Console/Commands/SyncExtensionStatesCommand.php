<?php

namespace App\Console\Commands;

use App\Models\Iglesia;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class SyncExtensionStatesCommand extends Command
{
    protected $signature = 'sync:extensiones-estados
                            {--apply : Aplica los cambios; sin esta opción solo muestra una simulación}
                            {--force : Aplica los cambios sin solicitar confirmación}';

    protected $description = 'Sincroniza el estado de cada extensión con el de su pastor principal';

    public function handle(): int
    {
        $apply = (bool) $this->option('apply');
        $force = (bool) $this->option('force');

        if ($force && ! $apply) {
            $this->error('La opción --force requiere --apply.');

            return self::FAILURE;
        }

        $this->info($apply
            ? 'Sincronización de estados de extensiones (modo aplicación)'
            : 'Sincronización de estados de extensiones (simulación; no se guardarán cambios)');

        $changes = [];
        $skipped = [];

        Iglesia::withoutTenant()
            ->with(['pastor.estado', 'pastores.estado', 'estado', 'municipio', 'parroquia.municipio'])
            ->chunkById(100, function ($iglesias) use (&$changes, &$skipped): void {
                foreach ($iglesias as $iglesia) {
                    $pastorPrincipal = $iglesia->pastor;
                    $sourcePastor = $pastorPrincipal;

                    if ($pastorPrincipal) {
                        $targetStateId = $pastorPrincipal->estado_id;
                    } elseif ($iglesia->pastor_id !== null) {
                        $targetStateId = null;
                    } else {
                        $associatedStateIds = $iglesia->pastores
                            ->pluck('estado_id')
                            ->filter()
                            ->unique()
                            ->values();

                        if ($associatedStateIds->count() !== 1) {
                            $skipped[] = [
                                $iglesia->id,
                                $iglesia->nombre,
                                $associatedStateIds->isEmpty()
                                    ? 'Sin pastor con estado registrado'
                                    : 'Pastores asociados en distintos estados',
                            ];

                            continue;
                        }

                        $targetStateId = (int) $associatedStateIds->first();
                        $sourcePastor = $iglesia->pastores->first(
                            fn ($pastor) => (int) $pastor->estado_id === $targetStateId
                        );
                    }

                    if (! $targetStateId) {
                        $skipped[] = [
                            $iglesia->id,
                            $iglesia->nombre,
                            'El pastor principal no tiene estado registrado',
                        ];

                        continue;
                    }

                    $targetState = $sourcePastor?->estado;
                    if (! $targetState) {
                        $skipped[] = [
                            $iglesia->id,
                            $iglesia->nombre,
                            "No se encontró el estado #{$targetStateId} del pastor",
                        ];

                        continue;
                    }

                    $municipioId = $iglesia->municipio_id;
                    $parroquiaId = $iglesia->parroquia_id;
                    $stateChanged = (int) $iglesia->estado_id !== (int) $targetStateId;

                    if ($municipioId !== null && (int) $iglesia->municipio?->estado_id !== (int) $targetStateId) {
                        $municipioId = null;
                        $parroquiaId = null;
                    } elseif (
                        $parroquiaId !== null
                        && (int) $iglesia->parroquia?->municipio_id !== (int) $municipioId
                    ) {
                        $parroquiaId = null;
                    }

                    if (
                        ! $stateChanged
                        && $iglesia->municipio_id === $municipioId
                        && $iglesia->parroquia_id === $parroquiaId
                    ) {
                        continue;
                    }

                    $changes[] = [
                        'extension_id' => $iglesia->id,
                        'extension' => $iglesia->nombre,
                        'pastor_id' => $sourcePastor?->id,
                        'pastor' => $sourcePastor?->nombre_completo ?? 'Pastores asociados',
                        'estado_anterior' => $iglesia->estado?->nombre ?? 'Sin estado',
                        'estado_nuevo' => $targetState->nombre,
                        'municipio_anterior' => $iglesia->municipio?->nombre ?? 'Sin municipio',
                        'municipio_nuevo' => $municipioId === null
                            ? 'Sin municipio'
                            : $iglesia->municipio?->nombre,
                        'parroquia_anterior' => $iglesia->parroquia?->nombre ?? 'Sin parroquia',
                        'municipio_id' => $municipioId,
                        'parroquia_id' => $parroquiaId,
                        'estado_id' => (int) $targetStateId,
                        'clear_coordinates' => $stateChanged || $iglesia->municipio_id !== $municipioId,
                    ];
                }
            });

        if ($changes !== []) {
            $this->table(
                ['ID Ext.', 'Extensión', 'ID Pastor', 'Pastor', 'Estado actual', 'Estado destino', 'Municipio actual', 'Municipio destino', 'Coordenadas'],
                array_map(fn (array $change) => [
                    $change['extension_id'],
                    $change['extension'],
                    $change['pastor_id'] ?? '—',
                    $change['pastor'],
                    $change['estado_anterior'],
                    $change['estado_nuevo'],
                    $change['municipio_anterior'],
                    $change['municipio_nuevo'],
                    $change['clear_coordinates'] ? 'Se limpiarán' : 'Se conservan',
                ], $changes)
            );
        }

        if ($skipped !== []) {
            $this->newLine();
            $this->warn('Extensiones omitidas por falta de un estado de pastor inequívoco:');
            $this->table(['ID Ext.', 'Extensión', 'Motivo'], $skipped);
        }

        if ($changes === []) {
            $this->info('No hay extensiones que requieran cambios.');

            return self::SUCCESS;
        }

        if (! $apply) {
            $this->newLine();
            $this->comment('Si cambia el estado o se descarta un municipio incompatible, también se limpiarán las coordenadas para evitar que el mapa conserve una ubicación desactualizada.');
            $this->comment(count($changes).' cambio(s) propuesto(s). Para aplicarlos, ejecute el comando con --apply.');

            return self::SUCCESS;
        }

        if (! $force && ! $this->confirm('¿Desea aplicar estos cambios?', false)) {
            $this->warn('Operación cancelada; no se modificó ninguna extensión.');

            return self::SUCCESS;
        }

        try {
            DB::transaction(function () use ($changes): void {
                foreach ($changes as $change) {
                    $iglesia = Iglesia::withoutTenant()->findOrFail($change['extension_id']);
                    $iglesia->estado_id = $change['estado_id'];
                    $iglesia->municipio_id = $change['municipio_id'];
                    $iglesia->parroquia_id = $change['parroquia_id'];
                    if ($change['clear_coordinates']) {
                        $iglesia->latitud = null;
                        $iglesia->longitud = null;
                    }
                    $iglesia->save();
                }
            });
        } catch (Throwable $exception) {
            $this->error('No se pudo completar la sincronización: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Sincronización completada. Extensiones actualizadas: '.count($changes).'.');

        return self::SUCCESS;
    }
}
