<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DatabaseExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DbMonitoringController extends Controller
{
    /**
     * Muestra el panel principal de monitoreo de base de datos.
     */
    public function index(Request $request)
    {
        // Obtener estadísticas reales del motor de base de datos
        $dbConnection = config('database.default');
        $dbDriver = config("database.connections.{$dbConnection}.driver");

        $tablesInfo = [];
        $totalSizeMb = 0;
        $totalRows = 0;
        $version = 'Desconocido';

        try {
            if ($dbDriver === 'mysql') {
                $dbName = config("database.connections.{$dbConnection}.database");

                // Versión de MySQL
                $versionRow = DB::select('SELECT VERSION() as version');
                $version = $versionRow[0]->version ?? 'MySQL';

                // Información de Tablas (nombre, filas, tamaño)
                $tables = DB::select('
                    SELECT 
                        table_name AS name, 
                        table_rows AS rows, 
                        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb 
                    FROM information_schema.TABLES 
                    WHERE table_schema = ?
                    ORDER BY (data_length + index_length) DESC
                ', [$dbName]);

                foreach ($tables as $t) {
                    $tablesInfo[] = [
                        'name' => $t->name,
                        'rows' => (int) ($t->rows ?? 0),
                        'size_mb' => (float) ($t->size_mb ?? 0),
                    ];
                    $totalSizeMb += (float) ($t->size_mb ?? 0);
                    $totalRows += (int) ($t->rows ?? 0);
                }
            } elseif ($dbDriver === 'sqlite') {
                $versionRow = DB::select('select sqlite_version() as version');
                $version = $versionRow[0]->version ?? 'SQLite';

                // Obtener nombres de tabla en SQLite
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                foreach ($tables as $t) {
                    $countRow = DB::select("SELECT COUNT(*) as count FROM \"{$t->name}\"");
                    $rows = $countRow[0]->count ?? 0;

                    // Simular tamaño para SQLite o dejar fijo en base a archivos si es necesario
                    $tablesInfo[] = [
                        'name' => $t->name,
                        'rows' => (int) $rows,
                        'size_mb' => round(($rows * 0.001), 3), // Estimación ficticia por fila en MB
                    ];
                    $totalRows += $rows;
                }

                $dbPath = config("database.connections.{$dbConnection}.database");
                if (file_exists($dbPath)) {
                    $totalSizeMb = round(filesize($dbPath) / 1024 / 1024, 2);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error obteniendo métricas de base de datos: '.$e->getMessage());
        }

        return inertia('admin/monitoring/database/index', [
            'dbInfo' => [
                'connection' => $dbConnection,
                'driver' => $dbDriver,
                'version' => $version,
                'total_tables' => count($tablesInfo),
                'total_size_mb' => round($totalSizeMb, 2),
                'total_rows' => $totalRows,
                'tables' => $tablesInfo,
            ],
        ]);
    }

    /**
     * Retorna métricas aleatorias controladas simulando actividad en vivo para el ApexChart.
     */
    public function getMetrics()
    {
        // Simulando conexiones, consultas por segundo y porcentaje de aciertos de caché
        return response()->json([
            'timestamp' => now()->format('H:i:s'),
            'queries_per_second' => rand(15, 85),
            'active_connections' => rand(5, 22),
            'max_connections' => 150,
            'cache_hit_rate' => rand(88, 99),
            'query_types' => [
                'select' => rand(60, 75),
                'insert' => rand(10, 15),
                'update' => rand(5, 12),
                'delete' => rand(1, 4),
            ],
            'slow_queries' => [
                [
                    'query' => 'SELECT * FROM users JOIN roles ON users.role_id = roles.id WHERE users.status = 1 ORDER BY users.created_at DESC LIMIT 100;',
                    'duration' => rand(120, 480).'ms',
                    'time' => now()->subMinutes(rand(1, 5))->format('H:i:s'),
                ],
                [
                    'query' => 'SELECT COUNT(*), country_id FROM leads GROUP BY country_id HAVING COUNT(*) > 500;',
                    'duration' => rand(250, 950).'ms',
                    'time' => now()->subMinutes(rand(5, 15))->format('H:i:s'),
                ],
            ],
            'active_processes' => [
                ['id' => 1024, 'user' => 'root', 'host' => 'localhost', 'db' => 'larareact', 'command' => 'Query', 'time' => rand(1, 10), 'state' => 'Sending data', 'info' => 'SELECT * FROM empresas LIMIT 50'],
                ['id' => 1025, 'user' => 'larareact', 'host' => '127.0.0.1', 'db' => 'larareact', 'command' => 'Sleep', 'time' => rand(20, 100), 'state' => '', 'info' => ''],
                ['id' => 1026, 'user' => 'root', 'host' => 'localhost', 'db' => 'larareact', 'command' => 'Query', 'time' => 0, 'state' => 'Init', 'info' => 'show processlist'],
            ],
        ]);
    }

    /**
     * Verifica la contraseña del usuario autenticado para autorizar la exportación.
     */
    public function verifyPassword(Request $request)
    {
        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'Debe ingresar su contraseña para continuar.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'valid' => false,
                'message' => __('La contraseña ingresada es incorrecta. Por favor intente nuevamente.'),
            ], 422);
        }

        return response()->json([
            'valid' => true,
            'message' => __('Contraseña verificada exitosamente.'),
        ]);
    }

    /**
     * Ejecuta el volcado y descarga del archivo de respaldo de base de datos.
     */
    public function export(Request $request, DatabaseExportService $exportService)
    {
        $validated = $request->validate([
            'password' => ['required', 'string'],
            'tables' => ['nullable', 'array'],
            'tables.*' => ['string'],
            'mode' => ['nullable', 'string', 'in:full,structure,data'],
            'compress' => ['nullable', 'boolean'],
            'drop_tables' => ['nullable', 'boolean'],
            'disable_fk' => ['nullable', 'boolean'],
            'add_comments' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();

        // Validar contraseña nuevamente por estricta seguridad del endpoint
        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => __('No autorizado. La contraseña es incorrecta.'),
            ], 403);
        }

        try {
            $tables = $validated['tables'] ?? [];
            $mode = $validated['mode'] ?? 'full';
            $options = [
                'compress' => filter_var($validated['compress'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'drop_tables' => filter_var($validated['drop_tables'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'disable_fk' => filter_var($validated['disable_fk'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'add_comments' => filter_var($validated['add_comments'] ?? true, FILTER_VALIDATE_BOOLEAN),
            ];

            $result = $exportService->export($tables, $mode, $options);

            // Registrar actividad
            if (function_exists('activity')) {
                try {
                    activity('database')
                        ->causedBy($user)
                        ->withProperties([
                            'filename' => $result['filename'],
                            'tables_count' => $result['tables_count'],
                            'mode' => $mode,
                            'compressed' => $options['compress'],
                            'size_bytes' => $result['size_bytes'],
                        ])
                        ->log("Exportó la base de datos: {$result['filename']} ({$result['tables_count']} tablas)");
                } catch (\Throwable $e) {
                    Log::warning('No se pudo registrar log de actividad en exportación DB: ' . $e->getMessage());
                }
            }

            return response()->download($result['path'], $result['filename'], [
                'Content-Type' => $options['compress'] ? 'application/gzip' : 'application/sql',
                'Access-Control-Expose-Headers' => 'Content-Disposition',
            ])->deleteFileAfterSend(true);

        } catch (\Throwable $e) {
            Log::error('Error exportando base de datos: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => __('Ocurrió un error al generar la exportación: :error', ['error' => $e->getMessage()]),
            ], 500);
        }
    }
}
