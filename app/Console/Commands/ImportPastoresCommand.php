<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Pastor;

class ImportPastoresCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:pastores {--file=pastores30122025.sql : Ruta del archivo SQL a importar} {--wipe : Truncar la tabla de pastores antes de importar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa y limpia el registro de pastores desde el archivo SQL dump pastores30122025.sql';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $fileName = $this->option('file') ?: 'pastores30122025.sql';
        $filePath = base_path($fileName);

        if (!file_exists($filePath)) {
            $this->error("El archivo SQL no existe en la ruta: {$filePath}");
            return 1;
        }

        $this->info("Leyendo archivo: {$filePath}...");
        $sqlContent = file_get_contents($filePath);

        $tuples = $this->parseSqlTuples($sqlContent);

        if (empty($tuples)) {
            $this->error("No se encontraron registros de INSERT INTO pastores en el archivo.");
            return 1;
        }

        $this->info("Se encontraron " . count($tuples) . " registros para procesar.");

        if ($this->option('wipe')) {
            if ($this->confirm("¿Está seguro de truncar la tabla de pastores antes de importar?")) {
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');
                Pastor::truncate();
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                $this->warn("Tabla pastores limpiada.");
            }
        }

        // Obtener IDs válidos de ubicaciones geográficas para evitar violaciones de clave foránea
        $validEstados = DB::table('estados')->pluck('id')->toArray();
        $validMunicipios = DB::table('municipios')->pluck('id')->toArray();
        $validParroquias = DB::table('parroquias')->pluck('id')->toArray();

        $importedCount = 0;
        $updatedCount = 0;

        $bar = $this->output->createProgressBar(count($tuples));
        $bar->start();

        // Deshabilitar temporalmente la verificación de llaves foráneas para spousal relationships
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        foreach ($tuples as $tupleStr) {
            $values = $this->parseTupleValues($tupleStr);

            if (count($values) < 44) {
                $bar->advance();
                continue;
            }

            $id = is_numeric($values[0]) ? (int)$values[0] : null;
            $rawCodigo = $this->cleanString($values[1]);
            $nombres = $this->cleanString($values[2]);
            $apellidos = $this->cleanString($values[3]);
            $documento = $this->cleanString($values[4]);
            $nivelMinisterial = $this->cleanString($values[5]);
            $zona = $this->cleanString($values[6]);
            $distrito = $this->cleanString($values[7]);
            $genero = strtoupper($this->cleanString($values[8]) ?: 'M');
            $edad = is_numeric($values[9]) ? (int)$values[9] : null;
            $anoPromocion = $this->cleanString($values[10]);
            $tiempoColaborando = $this->cleanString($values[11]);
            $feNacimiento = $this->cleanString($values[12]);
            $foto = $this->cleanString($values[13]);
            $nota = $this->cleanString($values[14]);
            $status = isset($values[15]) && $values[15] !== null ? (int)$values[15] : 1;
            $estadoCivil = $this->cleanString($values[16]);
            $bautizadoES = isset($values[17]) && $values[17] !== null ? (int)$values[17] : 1;
            $gradoInstruccion = $this->cleanString($values[18]);
            $tituloObtenido = $this->cleanString($values[19]);
            $estudioTeologico = isset($values[20]) && $values[20] !== null ? (int)$values[20] : 0;
            $tituloTeologico = $this->cleanString($values[21]);
            $tiempoEstudioTeologico = $this->cleanString($values[22]);
            $institutoTeologico = $this->cleanString($values[23]);
            $perteneceMinisterio = isset($values[24]) && $values[24] !== null ? (int)$values[24] : 1;
            $nombreConyuge = $this->cleanString($values[25]);
            $conyugeId = is_numeric($values[26]) ? (int)$values[26] : null;
            $edificioCasaQuinta = $this->cleanString($values[27]);
            $piso = $this->cleanString($values[28]);
            $apartamento = $this->cleanString($values[29]);
            $calleAvenida = $this->cleanString($values[30]);
            $urbanizacion = $this->cleanString($values[31]);
            $municipioId = is_numeric($values[32]) && in_array((int)$values[32], $validMunicipios) ? (int)$values[32] : null;
            $telefonoHab = $this->cleanString($values[33]);
            $telefonoTlf = $this->cleanString($values[34]);
            $telefonoOtro = $this->cleanString($values[35]);
            $mencion = $this->cleanString($values[36]);
            $cargoNacional = $this->cleanString($values[37]);

            $estadoId = isset($values[42]) && is_numeric($values[42]) && in_array((int)$values[42], $validEstados) ? (int)$values[42] : null;
            $parroquiaId = isset($values[43]) && is_numeric($values[43]) && in_array((int)$values[43], $validParroquias) ? (int)$values[43] : null;
            $createdAt = $this->cleanString($values[44] ?? null) ?: now();
            $updatedAt = $this->cleanString($values[45] ?? null) ?: now();

            // Normalización del código
            $codigo = $rawCodigo ?: ($id ? sprintf('%08d', $id) : null);

            $data = [
                'codigo' => $codigo,
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'documento' => $documento,
                'genero' => in_array($genero, ['M', 'F']) ? $genero : 'M',
                'edad' => $edad,
                'fe_nacimiento' => $feNacimiento,
                'foto' => $foto,
                'estado_civil' => $estadoCivil,
                'nombre_conyuge' => $nombreConyuge,
                'conyuge_id' => $conyugeId,
                'nivel_ministerial' => $nivelMinisterial ?: 'Colaborador',
                'zona' => $zona,
                'distrito' => $distrito,
                'ano_promocion' => $anoPromocion,
                'tiempo_colaborando' => $tiempoColaborando,
                'batizado_espiritu_santo' => (bool)$bautizadoES,
                'pertenece_ministerio' => (bool)$perteneceMinisterio,
                'cargo_nacional' => $cargoNacional,
                'mencion' => $mencion,
                'nota' => $nota,
                'grado_instruccion' => $gradoInstruccion,
                'titulo_obtenido' => $tituloObtenido,
                'estudio_teologico' => (bool)$estudioTeologico,
                'titulo_teologico' => $tituloTeologico,
                'tiempo_de_estudio_teologico' => $tiempoEstudioTeologico,
                'instituto_teologico' => $institutoTeologico,
                'edificio_casa_quinta' => $edificioCasaQuinta,
                'piso' => $piso,
                'apartamento' => $apartamento,
                'calle_avenida' => $calleAvenida,
                'urbanizacion' => $urbanizacion,
                'estado_id' => $estadoId,
                'municipio_id' => $municipioId,
                'parroquia_id' => $parroquiaId,
                'telefono_hab' => $telefonoHab,
                'telefono_tlf' => $telefonoTlf,
                'telefono_otro' => $telefonoOtro,
                'status' => (bool)$status,
                'updated_at' => $updatedAt,
            ];

            if ($id) {
                $pastorEx = Pastor::find($id);
                if ($pastorEx) {
                    $pastorEx->update($data);
                    $updatedCount++;
                } else {
                    $data['id'] = $id;
                    $data['created_at'] = $createdAt;
                    Pastor::create($data);
                    $importedCount++;
                }
            } else {
                $data['created_at'] = $createdAt;
                Pastor::create($data);
                $importedCount++;
            }

            $bar->advance();
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        $bar->finish();
        $this->newLine(2);

        $this->info("Importación finalizada con éxito.");
        $this->table(
            ['Métrica', 'Total'],
            [
                ['Nuevos Pastores Creados', $importedCount],
                ['Pastores Existentes Actualizados', $updatedCount],
                ['Total Procesados', $importedCount + $updatedCount],
            ]
        );

        return 0;
    }

    /**
     * Limpia espacios adicionales y valores vacíos
     */
    private function cleanString(?string $str): ?string
    {
        if ($str === null) return null;
        $str = trim($str);
        if ($str === '' || strtoupper($str) === 'NULL') return null;
        return $str;
    }

    /**
     * Parsea cada tupla del archivo SQL
     */
    private function parseSqlTuples(string $sqlContent): array
    {
        $startPos = strpos($sqlContent, "INSERT INTO `pastores`");
        if ($startPos === false) {
            $startPos = strpos($sqlContent, "INSERT INTO pastores");
        }
        if ($startPos === false) {
            return [];
        }

        $valuesPos = strpos($sqlContent, "VALUES", $startPos);
        if ($valuesPos === false) {
            return [];
        }

        $content = substr($sqlContent, $valuesPos + 6);
        $length = strlen($content);
        $inTuple = false;
        $inString = false;
        $stringChar = '';
        $currentTuple = '';
        $rows = [];

        for ($i = 0; $i < $length; $i++) {
            $char = $content[$i];

            if (!$inTuple) {
                if ($char === '(') {
                    $inTuple = true;
                    $currentTuple = '';
                }
                continue;
            }

            if ($inString) {
                $currentTuple .= $char;
                if ($char === '\\') {
                    if ($i + 1 < $length) {
                        $i++;
                        $currentTuple .= $content[$i];
                    }
                } elseif ($char === $stringChar) {
                    if ($i + 1 < $length && $content[$i + 1] === $stringChar) {
                        $i++;
                        $currentTuple .= $content[$i];
                    } else {
                        $inString = false;
                    }
                }
            } else {
                if ($char === "'" || $char === '"') {
                    $inString = true;
                    $stringChar = $char;
                    $currentTuple .= $char;
                } elseif ($char === ')') {
                    $inTuple = false;
                    $rows[] = $currentTuple;
                    $currentTuple = '';
                } else {
                    $currentTuple .= $char;
                }
            }
        }

        return $rows;
    }

    /**
     * Parsea los valores individuales dentro de una tupla SQL
     */
    private function parseTupleValues(string $tupleStr): array
    {
        $values = [];
        $length = strlen($tupleStr);
        $currentVal = '';
        $inString = false;
        $stringChar = '';

        for ($i = 0; $i < $length; $i++) {
            $char = $tupleStr[$i];

            if ($inString) {
                if ($char === '\\') {
                    if ($i + 1 < $length) {
                        $i++;
                        $currentVal .= $tupleStr[$i];
                    }
                } elseif ($char === $stringChar) {
                    if ($i + 1 < $length && $tupleStr[$i + 1] === $stringChar) {
                        $i++;
                        $currentVal .= $tupleStr[$i];
                    } else {
                        $inString = false;
                    }
                } else {
                    $currentVal .= $char;
                }
            } else {
                if ($char === "'" || $char === '"') {
                    $inString = true;
                    $stringChar = $char;
                } elseif ($char === ',') {
                    $val = trim($currentVal);
                    $values[] = strtoupper($val) === 'NULL' ? null : $val;
                    $currentVal = '';
                } else {
                    $currentVal .= $char;
                }
            }
        }

        $val = trim($currentVal);
        $values[] = strtoupper($val) === 'NULL' ? null : $val;

        return $values;
    }
}
