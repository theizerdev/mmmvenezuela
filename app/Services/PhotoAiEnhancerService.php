<?php

namespace App\Services;

use App\Models\Pastor;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class PhotoAiEnhancerService
{
    const API_URL = 'http://127.0.0.1:8001';

    /**
     * Comprueba si el microservicio local de FastAPI está en ejecución.
     */
    public function isApiServerRunning(): bool
    {
        try {
            $resp = Http::timeout(0.6)->get(self::API_URL . '/health');
            return $resp->successful() && ($resp->json('status') === 'ready');
        } catch (\Throwable) {
            return false;
        }
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
        $cleanCodigo = preg_replace('/\D/', '', (string)($pastor->codigo ?: $pastor->id));
        if ($cleanCodigo) {
            foreach ($candidateDirs as $dir) {
                if (is_dir($dir)) {
                    $matches = glob($dir . DIRECTORY_SEPARATOR . 'pastor_' . $cleanCodigo . '_*');
                    if ($matches && count($matches) > 0) {
                        usort($matches, fn($a, $b) => filemtime($b) <=> filemtime($a));
                        return $matches[0];
                    }
                }
            }
        }

        return null;
    }

    /**
     * Ejecuta la mejora de una fotografía (vía API o script CLI local).
     */
    public function runEnhancement(string $inputPath, string $outputPath): array
    {
        // 1. Intentar por el microservicio local de FastAPI (mucho más rápido, modelo en RAM)
        if ($this->isApiServerRunning()) {
            try {
                $response = Http::timeout(60)->post(self::API_URL . '/enhance-file', [
                    'input_path' => $inputPath,
                    'output_path' => $outputPath,
                ]);

                if ($response->successful() && $response->json('success')) {
                    return $response->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo microservicio FastAPI, alternando a CLI local: ' . $e->getMessage());
            }
        }

        // 2. Si el microservicio no está activo, ejecutar directamente el motor ONNX por proceso Python
        $scriptPath = base_path('app/Scripts/enhance_photo.py');
        if (!file_exists($scriptPath)) {
            return [
                'success' => false,
                'error' => 'El script de IA enhance_photo.py no existe en ' . $scriptPath,
            ];
        }

        $python = $this->getPythonBinary();
        $process = new Process([
            $python,
            $scriptPath,
            $inputPath,
            $outputPath,
        ]);

        $process->setTimeout(120);

        try {
            $process->run();
            $output = trim($process->getOutput());
            $errorOutput = trim($process->getErrorOutput());

            if (!empty($output)) {
                $data = json_decode($output, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($data)) {
                    return $data;
                }
            }

            if (!$process->isSuccessful()) {
                Log::error('Error en proceso CLI de IA: ' . ($errorOutput ?: $output));
                return [
                    'success' => false,
                    'error' => $errorOutput ?: ($output ?: 'Error al ejecutar proceso de IA.'),
                ];
            }

            if (file_exists($outputPath) && filesize($outputPath) > 0) {
                return [
                    'success' => true,
                    'output_path' => $outputPath,
                ];
            }

            return [
                'success' => false,
                'error' => 'No se generó la imagen en la ruta esperada.',
            ];
        } catch (\Throwable $e) {
            Log::error('Excepción al ejecutar IA local: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error de ejecución: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Mejora la foto de un pastor existente y actualiza su registro en la BD.
     */
    public function enhancePastor(Pastor $pastor): array
    {
        $sourcePath = $this->resolvePastorPhotoPath($pastor);
        if (!$sourcePath || !file_exists($sourcePath)) {
            return [
                'success' => false,
                'error' => 'No se encontró el archivo de fotografía para ' . $pastor->nombres . ' ' . $pastor->apellidos . '.',
            ];
        }

        $cleanCodigo = preg_replace('/\D/', '', (string)($pastor->codigo ?: $pastor->id));
        $newFilename = 'pastor_' . $cleanCodigo . '_' . time() . '_ai.png';

        $destDir = public_path('pastores');
        if (!file_exists($destDir)) {
            @mkdir($destDir, 0755, true);
        }

        $targetPath = $destDir . DIRECTORY_SEPARATOR . $newFilename;

        $result = $this->runEnhancement($sourcePath, $targetPath);

        if (!$result['success']) {
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

        // Actualizar foto en el modelo
        $pastor->foto = $newFilename;
        $pastor->save();

        return [
            'success' => true,
            'message' => 'Fotografía mejorada con IA exitosamente.',
            'foto' => $newFilename,
            'foto_url' => '/pastores/' . $newFilename . '?v=' . time(),
            'duration_seconds' => $result['duration_seconds'] ?? null,
            'engine' => $result['engine'] ?? 'local_realesrgan',
        ];
    }

    /**
     * Mejora una imagen en formato Base64 (Data URI) y devuelve la imagen resultante en Base64.
     */
    public function enhanceBase64Image(string $dataUri): array
    {
        if (!preg_match('/^data:image\/(?:png|jpe?g|webp);base64,/', $dataUri)) {
            return ['success' => false, 'error' => 'Formato de imagen inválido'];
        }

        $base64Data = substr($dataUri, strpos($dataUri, ',') + 1);
        $decoded = base64_decode($base64Data, true);
        if ($decoded === false) {
            return ['success' => false, 'error' => 'Error al decodificar la imagen'];
        }

        if (strlen($decoded) > 8 * 1024 * 1024) {
            return ['success' => false, 'error' => 'La imagen supera el tamaño máximo permitido de 8 MB.'];
        }

        $imageInfo = getimagesizefromstring($decoded);
        if ($imageInfo === false || ($imageInfo[0] * $imageInfo[1]) > 40000000) {
            return ['success' => false, 'error' => 'La imagen no es válida o supera la resolución máxima permitida.'];
        }

        // 1. Intentar por el microservicio local de FastAPI
        if ($this->isApiServerRunning()) {
            try {
                $response = Http::timeout(60)->post(self::API_URL . '/enhance-base64', [
                    'data_url' => $dataUri,
                ]);

                if ($response->successful() && $response->json('success')) {
                    return $response->json();
                }
            } catch (\Throwable $e) {
                Log::warning('Fallo microservicio en base64, alternando a CLI: ' . $e->getMessage());
            }
        }

        // 2. Alternativa por archivo temporal
        $tempDir = storage_path('app/temp_ai');
        if (!is_dir($tempDir) && !mkdir($tempDir, 0755, true) && !is_dir($tempDir)) {
            return ['success' => false, 'error' => 'No se pudo preparar el directorio temporal para procesar la imagen.'];
        }

        $fileToken = bin2hex(random_bytes(16));
        $tempInput = $tempDir . DIRECTORY_SEPARATOR . 'input_' . $fileToken . '.png';
        $tempOutput = $tempDir . DIRECTORY_SEPARATOR . 'output_' . $fileToken . '.png';

        try {
            if (file_put_contents($tempInput, $decoded, LOCK_EX) === false) {
                return ['success' => false, 'error' => 'No se pudo preparar la imagen para procesarla.'];
            }

            $result = $this->runEnhancement($tempInput, $tempOutput);
            if (!$result['success']) {
                return $result;
            }

            $outputBytes = file_get_contents($tempOutput);
            if ($outputBytes === false) {
                return ['success' => false, 'error' => 'No se pudo leer la imagen mejorada.'];
            }

            return [
                'success' => true,
                'data_url' => 'data:image/png;base64,' . base64_encode($outputBytes),
                'duration_seconds' => $result['duration_seconds'] ?? null,
                'engine' => $result['engine'] ?? 'local_realesrgan',
            ];
        } finally {
            if (file_exists($tempInput)) {
                unlink($tempInput);
            }
            if (file_exists($tempOutput)) {
                unlink($tempOutput);
            }
        }
    }
}
