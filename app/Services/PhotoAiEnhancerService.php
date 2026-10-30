<?php

namespace App\Services;

use App\Models\Pastor;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class PhotoAiEnhancerService
{
    public const DEFAULT_API_URL = 'http://127.0.0.1:8001';
    public const API_URL = 'http://127.0.0.1:8001';

    /**
     * Obtiene la URL configurada del microservicio del Agente Diseñador.
     * Permite apuntar a un servidor remoto (ej: http://169.58.168.213:8001) o local.
     */
    public function getApiUrl(): string
    {
        $url = config('services.photo_studio.url') ?: env('PHOTO_STUDIO_API_URL') ?: self::DEFAULT_API_URL;
        return rtrim($url, '/');
    }

    /**
     * Determina si la URL configurada apunta a un host remoto o externo.
     */
    public function isRemoteApi(): bool
    {
        $host = parse_url($this->getApiUrl(), PHP_URL_HOST);
        return !empty($host) && !in_array(strtolower($host), ['127.0.0.1', 'localhost', '0.0.0.0', '::1'], true);
    }

    /**
     * Comprueba si el microservicio FastAPI (MMM Studio AI) está activo.
     */
    public function isApiServerRunning(): bool
    {
        try {
            $timeout = $this->isRemoteApi() ? 3.0 : 0.8;
            $resp = Http::timeout($timeout)->get($this->getApiUrl() . '/health');
            return $resp->successful() && in_array($resp->json('status'), ['ready', 'degraded'], true);
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * Intenta levantar automáticamente en segundo plano el microservicio FastAPI local
     * si aún no está en ejecución, para mantener las redes neuronales precargadas en RAM.
     * Si la API es remota (ej: en 169.58.168.213), solo verifica la conexión HTTP.
     */
    public function ensureApiServerRunning(): bool
    {
        if ($this->isApiServerRunning()) {
            return true;
        }

        // Si la URL apunta a un servidor remoto, no se puede ejecutar un proceso en la máquina remota
        if ($this->isRemoteApi()) {
            Log::warning('El microservicio remoto en ' . $this->getApiUrl() . ' no se encuentra accesible.');
            return false;
        }

        $scriptsDir = base_path('app/Scripts');
        $serverFile = $scriptsDir . DIRECTORY_SEPARATOR . 'ai_server.py';
        if (!file_exists($serverFile)) {
            return false;
        }

        try {
            $python = $this->getPythonBinary();
            if (PHP_OS_FAMILY === 'Windows') {
                $cmd = sprintf(
                    'start "" /B "%s" -m uvicorn ai_server:app --host 0.0.0.0 --port 8001 --log-level warning',
                    $python
                );
                @pclose(@popen('cd /d "' . $scriptsDir . '" && ' . $cmd, 'r'));
            } else {
                $cmd = sprintf(
                    'cd %s && nohup %s -m uvicorn ai_server:app --host 0.0.0.0 --port 8001 --log-level warning > /dev/null 2>&1 &',
                    escapeshellarg($scriptsDir),
                    escapeshellarg($python)
                );
                @exec($cmd);
            }

            // Esperar brevemente hasta 3.2s a que el servidor responda
            for ($i = 0; $i < 8; $i++) {
                usleep(400000);
                if ($this->isApiServerRunning()) {
                    return true;
                }
            }
        } catch (\Throwable $e) {
            Log::debug('No se pudo auto-iniciar ai_server.py en segundo plano: ' . $e->getMessage());
        }

        return false;
    }

    /**
     * Resuelve la ruta al ejecutable de Python disponible.
     */
    public function getPythonBinary(): string
    {
        $configured = config('services.python.path') ?: env('PYTHON_BINARY');
        if ($configured && file_exists($configured)) {
            return $configured;
        }

        $candidates = [
            'C:\\laragon\\bin\\python\\python-3.13\\python.exe',
            'C:\\laragon\\bin\\python\\python-3.12\\python.exe',
            'C:\\laragon\\bin\\python\\python-3.11\\python.exe',
            'C:\\laragon\\bin\\python\\python-3.10\\python.exe',
            'C:\\Python313\\python.exe',
            'C:\\Python312\\python.exe',
            'C:\\Python311\\python.exe',
            'python3',
            'python',
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return 'python';
    }

    /**
     * Localiza la fotografía física actual de un pastor en disco.
     */
    public function resolvePastorPhotoPath(Pastor $pastor): ?string
    {
        if (empty($pastor->foto)) {
            return null;
        }

        $cleanUrl = urldecode($pastor->foto);
        if (($posQ = strpos($cleanUrl, '?')) !== false) {
            $cleanUrl = substr($cleanUrl, 0, $posQ);
        }
        $basename = basename(ltrim($cleanUrl, '/\\'));

        $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
        $candidateDirs = array_filter(array_unique([
            public_path('pastores'),
            base_path('public/pastores'),
            $docRoot ? $docRoot . '/pastores' : null,
            base_path('../public_html/pastores'),
            storage_path('app/public/pastores'),
        ]));

        // 1. Coincidencia exacta
        foreach ($candidateDirs as $dir) {
            $full = $dir . DIRECTORY_SEPARATOR . $basename;
            if (file_exists($full) && is_file($full) && filesize($full) > 0) {
                return $full;
            }
        }

        // 2. Coincidencia por código o documento
        $cleanCodigo = preg_replace('/\D/', '', (string) ($pastor->codigo ?: $pastor->id));
        if ($cleanCodigo) {
            foreach ($candidateDirs as $dir) {
                if (is_dir($dir)) {
                    $matches = glob($dir . DIRECTORY_SEPARATOR . 'pastor_' . $cleanCodigo . '_*');
                    if ($matches && count($matches) > 0) {
                        usort($matches, fn ($a, $b) => filemtime($b) <=> filemtime($a));
                        return $matches[0];
                    }
                }
            }
        }

        return null;
    }

    /**
     * Invalida cualquier miniatura cacheada para FPDF perteneciente al pastor.
     */
    public function clearPastorCarnetCache(int $pastorId): void
    {
        $dirs = [
            storage_path('app/carnets_cache'),
            storage_path('framework/cache/carnets_cache'),
            storage_path('app/public/carnets_cache'),
            public_path('carnets_cache'),
            sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'carnets_cache',
        ];

        foreach ($dirs as $dir) {
            if (is_dir($dir)) {
                foreach (glob($dir . DIRECTORY_SEPARATOR . 'foto_' . $pastorId . '_*') ?: [] as $cached) {
                    @unlink($cached);
                }
            }
        }
    }

    /**
     * Valida y decodifica un Data URI de imagen (PNG/JPEG/WEBP hasta 12 MB).
     */
    protected function decodeAndValidateDataUri(string $dataUri): array
    {
        if (!preg_match('/^data:image\/(?:png|jpe?g|webp);base64,/', $dataUri)) {
            return ['valid' => false, 'error' => 'Formato de imagen inválido (use PNG, JPG o WEBP).'];
        }

        $base64Data = substr($dataUri, strpos($dataUri, ',') + 1);
        $decoded = base64_decode($base64Data, true);
        if ($decoded === false) {
            return ['valid' => false, 'error' => 'Error al decodificar la imagen Base64.'];
        }

        if (strlen($decoded) > 12 * 1024 * 1024) {
            return ['valid' => false, 'error' => 'La imagen supera el tamaño máximo permitido de 12 MB.'];
        }

        $imageInfo = @getimagesizefromstring($decoded);
        if ($imageInfo === false || ($imageInfo[0] * $imageInfo[1]) > 45000000) {
            return ['valid' => false, 'error' => 'La imagen no es válida o supera la resolución máxima permitida.'];
        }

        return ['valid' => true, 'bytes' => $decoded];
    }

    /**
     * Analiza una fotografía de un pastor en disco con el Agente Diseñador.
     */
    public function analyzePastorPhoto(Pastor $pastor): array
    {
        $sourcePath = $this->resolvePastorPhotoPath($pastor);
        if (!$sourcePath || !file_exists($sourcePath)) {
            return [
                'success' => false,
                'error' => 'No se encontró archivo de fotografía para analizar.',
            ];
        }

        if ($this->ensureApiServerRunning()) {
            try {
                if ($this->isRemoteApi()) {
                    $inputBytes = @file_get_contents($sourcePath);
                    if ($inputBytes !== false) {
                        $finfo = finfo_open(FILEINFO_MIME_TYPE);
                        $mime = finfo_buffer($finfo, $inputBytes) ?: 'image/jpeg';
                        finfo_close($finfo);
                        $dataUri = 'data:' . $mime . ';base64,' . base64_encode($inputBytes);
                        return $this->analyzeBase64Image($dataUri);
                    }
                }

                $resp = Http::timeout(20)->post($this->getApiUrl() . '/analyze', [
                    'input_path' => $sourcePath,
                ]);
                if ($resp->successful() && $resp->json('success')) {
                    return $resp->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo /analyze en FastAPI, usando CLI: ' . $e->getMessage());
            }
        }

        return $this->runCliCommand(['--analyze', $sourcePath], 45);
    }

    /**
     * Analiza una imagen enviada en Base64 (Data URI) con el Agente Diseñador.
     */
    public function analyzeBase64Image(string $dataUri): array
    {
        $check = $this->decodeAndValidateDataUri($dataUri);
        if (!$check['valid']) {
            return ['success' => false, 'error' => $check['error']];
        }

        if ($this->ensureApiServerRunning()) {
            try {
                $resp = Http::timeout(25)->post($this->getApiUrl() . '/analyze', [
                    'data_url' => $dataUri,
                ]);
                if ($resp->successful() && $resp->json('success')) {
                    return $resp->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo /analyze Base64 en FastAPI, usando CLI: ' . $e->getMessage());
            }
        }

        return $this->withTempInputFile($check['bytes'], function (string $tempInput) {
            return $this->runCliCommand(['--analyze', $tempInput], 45);
        });
    }

    /**
     * Remueve el fondo con precisión de estudio (cabello HD + Defringe anti-halos) sobre imagen Base64.
     */
    public function removeBackgroundBase64(string $dataUri, array $options = []): array
    {
        $check = $this->decodeAndValidateDataUri($dataUri);
        if (!$check['valid']) {
            return ['success' => false, 'error' => $check['error']];
        }

        if ($this->ensureApiServerRunning()) {
            try {
                $resp = Http::timeout(60)->post($this->getApiUrl() . '/remove-background', [
                    'data_url' => $dataUri,
                    'mode' => $options['mode'] ?? 'ensemble',
                    'defringe' => (float) ($options['defringe'] ?? 65),
                    'edge_feather' => (float) ($options['edge_feather'] ?? 1.3),
                    'edge_shift' => (float) ($options['edge_shift'] ?? -0.3),
                ]);
                if ($resp->successful() && $resp->json('success')) {
                    return $resp->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo /remove-background en FastAPI, usando CLI: ' . $e->getMessage());
            }
        }

        return $this->withTempInputOutputFiles($check['bytes'], function (string $tempIn, string $tempOut, string $tempJson) use ($options) {
            file_put_contents($tempJson, json_encode($options, JSON_UNESCAPED_UNICODE));
            $res = $this->runCliCommand(['--remove-bg', $tempIn, $tempOut, $tempJson], 90);
            if (!($res['success'] ?? false) || !file_exists($tempOut)) {
                return $res;
            }
            $outBytes = file_get_contents($tempOut);
            if ($outBytes === false) {
                return ['success' => false, 'error' => 'No se pudo leer el recorte generado.'];
            }
            $res['data_url'] = 'data:image/png;base64,' . base64_encode($outBytes);
            return $res;
        });
    }

    /**
     * Ejecuta el pipeline completo del Agente Diseñador sobre archivo físico.
     */
    public function runEnhancement(string $inputPath, string $outputPath, ?array $options = null): array
    {
        if ($this->ensureApiServerRunning()) {
            try {
                if ($this->isRemoteApi()) {
                    $inputBytes = @file_get_contents($inputPath);
                    if ($inputBytes !== false) {
                        $finfo = finfo_open(FILEINFO_MIME_TYPE);
                        $mime = finfo_buffer($finfo, $inputBytes) ?: 'image/jpeg';
                        finfo_close($finfo);
                        $dataUri = 'data:' . $mime . ';base64,' . base64_encode($inputBytes);

                        $b64Result = $this->enhanceBase64Image($dataUri, $options);
                        if (($b64Result['success'] ?? false) && !empty($b64Result['data_url'])) {
                            $decoded = $this->decodeAndValidateDataUri($b64Result['data_url']);
                            if ($decoded['valid']) {
                                file_put_contents($outputPath, $decoded['bytes']);
                                return $b64Result;
                            }
                        }
                    }
                }

                $payload = [
                    'input_path' => $inputPath,
                    'output_path' => $outputPath,
                ];
                if (!empty($options)) {
                    $payload['options'] = $options;
                }

                $response = Http::timeout(90)->post($this->getApiUrl() . '/enhance-file', $payload);
                if ($response->successful() && $response->json('success')) {
                    return $response->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo microservicio FastAPI, alternando a CLI local: ' . $e->getMessage());
            }
        }

        $tempJson = null;
        try {
            $args = [$inputPath, $outputPath];
            if (!empty($options)) {
                $tempDir = $this->ensureTempDir();
                $tempJson = $tempDir . DIRECTORY_SEPARATOR . 'opts_' . bin2hex(random_bytes(8)) . '.json';
                file_put_contents($tempJson, json_encode($options, JSON_UNESCAPED_UNICODE));
                $args[] = $tempJson;
            }

            return $this->runCliCommand($args, 150, $outputPath);
        } finally {
            if ($tempJson && file_exists($tempJson)) {
                @unlink($tempJson);
            }
        }
    }

    /**
     * Mejora / diseña la foto de un pastor existente en disco y actualiza su registro en BD.
     */
    public function enhancePastor(Pastor $pastor, ?array $options = null): array
    {
        $sourcePath = $this->resolvePastorPhotoPath($pastor);
        if (!$sourcePath || !file_exists($sourcePath)) {
            return [
                'success' => false,
                'error' => 'No se encontró el archivo de fotografía para ' . $pastor->nombres . ' ' . $pastor->apellidos . '.',
            ];
        }

        $cleanCodigo = preg_replace('/\D/', '', (string) ($pastor->codigo ?: $pastor->id));
        $newFilename = 'pastor_' . $cleanCodigo . '_' . time() . '_ai.png';

        $destDir = public_path('pastores');
        if (!file_exists($destDir)) {
            @mkdir($destDir, 0755, true);
        }

        $targetPath = $destDir . DIRECTORY_SEPARATOR . $newFilename;
        $result = $this->runEnhancement($sourcePath, $targetPath, $options);

        if (!($result['success'] ?? false)) {
            return $result;
        }

        // Sincronizar en otras carpetas públicas si existen
        $docRoot = !empty($_SERVER['DOCUMENT_ROOT']) ? rtrim($_SERVER['DOCUMENT_ROOT'], '/\\') : null;
        $targetDirs = array_filter(array_unique([
            base_path('public/pastores'),
            $docRoot ? $docRoot . '/pastores' : null,
            base_path('../public_html/pastores'),
        ]));

        foreach ($targetDirs as $extraDir) {
            if ($extraDir !== $destDir && is_dir($extraDir) && is_writable($extraDir)) {
                @copy($targetPath, $extraDir . DIRECTORY_SEPARATOR . $newFilename);
            }
        }

        $pastor->foto = $newFilename;
        $pastor->save();
        $this->clearPastorCarnetCache($pastor->id);

        return [
            'success' => true,
            'message' => 'Fotografía optimizada por el Agente Diseñador IA exitosamente.',
            'foto' => $newFilename,
            'foto_url' => '/pastores/' . $newFilename . '?v=' . time(),
            'duration_seconds' => $result['duration_seconds'] ?? null,
            'engine' => $result['engine'] ?? 'MMM-Studio-Agent-2.0',
            'steps_applied' => $result['steps_applied'] ?? [],
            'before_score' => $result['before_score'] ?? null,
            'after_score' => $result['after_score'] ?? null,
        ];
    }

    /**
     * Ejecuta el Agente Diseñador sobre una imagen en Base64 (Data URI) con opciones de estudio completas.
     */
    public function enhanceBase64Image(string $dataUri, ?array $options = null): array
    {
        $check = $this->decodeAndValidateDataUri($dataUri);
        if (!$check['valid']) {
            return ['success' => false, 'error' => $check['error']];
        }

        if ($this->ensureApiServerRunning()) {
            try {
                $endpoint = !empty($options) ? '/studio-process' : '/enhance-base64';
                $payload = ['data_url' => $dataUri];
                if (!empty($options)) {
                    $payload['options'] = $options;
                }

                $response = Http::timeout(90)->post($this->getApiUrl() . $endpoint, $payload);
                if ($response->successful() && $response->json('success')) {
                    return $response->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo microservicio en Base64, alternando a CLI: ' . $e->getMessage());
            }
        }

        return $this->withTempInputOutputFiles($check['bytes'], function (string $tempIn, string $tempOut) use ($options) {
            $result = $this->runEnhancement($tempIn, $tempOut, $options);
            if (!($result['success'] ?? false)) {
                return $result;
            }

            $outputBytes = @file_get_contents($tempOut);
            if ($outputBytes === false) {
                return ['success' => false, 'error' => 'No se pudo leer la imagen procesada por el Agente IA.'];
            }

            return array_merge($result, [
                'success' => true,
                'data_url' => 'data:image/png;base64,' . base64_encode($outputBytes),
            ]);
        });
    }

    protected function ensureTempDir(): string
    {
        $tempDir = storage_path('app/temp_ai');
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0755, true);
        }
        return $tempDir;
    }

    protected function withTempInputFile(string $bytes, callable $callback): array
    {
        $tempDir = $this->ensureTempDir();
        $token = bin2hex(random_bytes(12));
        $tempIn = $tempDir . DIRECTORY_SEPARATOR . 'in_' . $token . '.png';

        try {
            if (file_put_contents($tempIn, $bytes, LOCK_EX) === false) {
                return ['success' => false, 'error' => 'No se pudo escribir archivo temporal para análisis.'];
            }
            return $callback($tempIn);
        } finally {
            if (file_exists($tempIn)) {
                @unlink($tempIn);
            }
        }
    }

    protected function withTempInputOutputFiles(string $bytes, callable $callback): array
    {
        $tempDir = $this->ensureTempDir();
        $token = bin2hex(random_bytes(12));
        $tempIn = $tempDir . DIRECTORY_SEPARATOR . 'in_' . $token . '.png';
        $tempOut = $tempDir . DIRECTORY_SEPARATOR . 'out_' . $token . '.png';
        $tempJson = $tempDir . DIRECTORY_SEPARATOR . 'opt_' . $token . '.json';

        try {
            if (file_put_contents($tempIn, $bytes, LOCK_EX) === false) {
                return ['success' => false, 'error' => 'No se pudo preparar archivo temporal de imagen.'];
            }
            return $callback($tempIn, $tempOut, $tempJson);
        } finally {
            foreach ([$tempIn, $tempOut, $tempJson] as $f) {
                if (file_exists($f)) {
                    @unlink($f);
                }
            }
        }
    }

    protected function runCliCommand(array $scriptArgs, int $timeout = 120, ?string $expectedOutput = null): array
    {
        $scriptPath = base_path('app/Scripts/enhance_photo.py');
        if (!file_exists($scriptPath)) {
            return [
                'success' => false,
                'error' => 'El script enhance_photo.py no existe en ' . $scriptPath,
            ];
        }

        $python = $this->getPythonBinary();
        $process = new Process(array_merge([$python, $scriptPath], $scriptArgs));
        $process->setTimeout($timeout);

        try {
            $process->run();
            $output = trim($process->getOutput());
            $errorOutput = trim($process->getErrorOutput());

            if (!empty($output)) {
                // Extraer última línea JSON por seguridad ante cualquier warning externo
                $lines = array_values(array_filter(array_map('trim', preg_split('/\R/', $output))));
                $jsonCandidate = end($lines) ?: $output;
                $data = json_decode($jsonCandidate, true) ?? json_decode($output, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                    return $data;
                }
            }

            if (!$process->isSuccessful()) {
                Log::error('Error en CLI de Agente IA: ' . ($errorOutput ?: $output));
                return [
                    'success' => false,
                    'error' => $errorOutput ?: ($output ?: 'Error al ejecutar el motor de IA local.'),
                ];
            }

            if ($expectedOutput && file_exists($expectedOutput) && filesize($expectedOutput) > 0) {
                return [
                    'success' => true,
                    'output_path' => $expectedOutput,
                ];
            }

            return [
                'success' => false,
                'error' => 'El proceso de IA no devolvió respuesta válida.',
            ];
        } catch (\Throwable $e) {
            Log::error('Excepción en CLI de Agente IA: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Excepción de ejecución: ' . $e->getMessage(),
            ];
        }
    }
}
