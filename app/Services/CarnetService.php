<?php

namespace App\Services;

use App\Models\Pastor;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Barryvdh\DomPDF\Facade\Pdf;

class CarnetService
{
    /**
     * Genera el PDF con la cara frontal y trasera del carnet de un pastor (1:1 idéntico al modal).
     */
    public function generarPdfParaPastor(Pastor $pastor)
    {
        $fotoCircular = $this->obtenerFotoCircularBase64($pastor);
        $qrBase64 = $this->generarQrBase64($pastor);
        $barcodeBase64 = $this->generarBarcodeBase64($pastor->documento ?: $pastor->codigo);
        $docFormatted = $this->formatearDocumento($pastor->documento);

        $pdf = Pdf::loadView('pdf.carnet_pastor', [
            'pastor' => $pastor,
            'fotoCircularBase64' => $fotoCircular,
            'qrBase64' => $qrBase64,
            'barcodeBase64' => $barcodeBase64,
            'documentoFormateado' => $docFormatted,
        ]);

        $pdf->setPaper([0, 0, 242.65, 152.79], 'landscape'); // 85.6mm x 53.9mm en puntos PostScript (72 DPI)
        $pdf->setOption('isRemoteEnabled', true);
        $pdf->setOption('isHtml5ParserEnabled', true);

        return $pdf;
    }

    /**
     * Genera un pliego PDF masivo en hoja Carta para múltiples pastores seleccionados.
     */
    public function generarPdfMasivo(iterable $pastores)
    {
        $items = [];
        foreach ($pastores as $pastor) {
            $items[] = [
                'pastor' => $pastor,
                'fotoCircularBase64' => $this->obtenerFotoCircularBase64($pastor),
                'documentoFormateado' => $this->formatearDocumento($pastor->documento),
            ];
        }

        $pdf = Pdf::loadView('pdf.carnets_masivo', [
            'items' => $items,
        ]);

        $pdf->setPaper('letter', 'portrait');
        $pdf->setOption('isRemoteEnabled', true);

        return $pdf;
    }

    /**
     * Recorta la foto del pastor en un círculo perfecto transparente usando GD
     */
    public function obtenerFotoCircularBase64(Pastor $pastor): ?string
    {
        $fotoPath = $this->obtenerRutaFotoPastor($pastor);
        if (!$fotoPath || !file_exists($fotoPath)) {
            return null;
        }

        try {
            $info = @getimagesize($fotoPath);
            if (!$info) return null;

            $mime = $info['mime'];
            switch ($mime) {
                case 'image/jpeg':
                    $src = @imagecreatefromjpeg($fotoPath);
                    break;
                case 'image/png':
                    $src = @imagecreatefrompng($fotoPath);
                    break;
                case 'image/webp':
                    $src = @imagecreatefromwebp($fotoPath);
                    break;
                default:
                    return null;
            }

            if (!$src) return null;

            $w = imagesx($src);
            $h = imagesy($src);
            $size = min($w, $h);
            $x = (int)(($w - $size) / 2);
            $y = (int)(($h - $size) / 2);

            $dim = 300;
            $target = imagecreatetruecolor($dim, $dim);
            imagealphablending($target, false);
            imagesavealpha($target, true);

            $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
            imagefill($target, 0, 0, $transparent);

            $mask = imagecreatetruecolor($dim, $dim);
            $maskBg = imagecolorallocate($mask, 0, 0, 0);
            $maskFg = imagecolorallocate($mask, 255, 255, 255);
            imagefill($mask, 0, 0, $maskBg);
            imagefilledellipse($mask, (int)($dim / 2), (int)($dim / 2), $dim, $dim, $maskFg);

            $croppedSrc = imagecreatetruecolor($dim, $dim);
            imagecopyresampled($croppedSrc, $src, 0, 0, $x, $y, $dim, $dim, $size, $size);

            for ($px = 0; $px < $dim; $px++) {
                for ($py = 0; $py < $dim; $py++) {
                    $color = imagecolorat($mask, $px, $py);
                    if (($color & 0xFF) > 128) {
                        $srcColor = imagecolorat($croppedSrc, $px, $py);
                        imagesetpixel($target, $px, $py, $srcColor);
                    }
                }
            }

            ob_start();
            imagepng($target);
            $imageData = ob_get_clean();

            imagedestroy($src);
            imagedestroy($target);
            imagedestroy($mask);
            imagedestroy($croppedSrc);

            return 'data:image/png;base64,' . base64_encode($imageData);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Generar Código QR Base64 para Dompdf
     */
    protected function generarQrBase64(Pastor $pastor): string
    {
        try {
            $url = url('/validar-credencial/' . ($pastor->codigo ?: $pastor->id));
            $renderer = new ImageRenderer(new RendererStyle(150), new SvgImageBackEnd());
            $writer = new Writer($renderer);
            $svg = $writer->writeString($url);
            return 'data:image/svg+xml;base64,' . base64_encode($svg);
        } catch (\Throwable $e) {
            return '';
        }
    }

    /**
     * Genera una imagen de código de barras simulado en PNG Base64
     */
    protected function generarBarcodeBase64(string $code): string
    {
        $dimW = 300;
        $dimH = 45;
        $img = imagecreatetruecolor($dimW, $dimH);
        $white = imagecolorallocate($img, 255, 255, 255);
        $black = imagecolorallocate($img, 0, 0, 0);
        imagefill($img, 0, 0, $white);

        $digits = preg_replace('/[^0-9]/', '', $code) ?: '123456789';
        mt_srand((int)$digits);

        $numBars = 55;
        $barWidth = $dimW / $numBars;

        for ($i = 0; $i < $numBars; $i++) {
            $isBar = (mt_rand(0, 100) > 30);
            if ($i == 0 || $i == 1 || $i == $numBars - 1 || $i == $numBars - 2) {
                $isBar = true;
            }
            if ($isBar) {
                $x1 = (int)($i * $barWidth);
                $x2 = (int)($x1 + ($barWidth * 0.75));
                imagefilledrectangle($img, $x1, 0, $x2, $dimH, $black);
            }
        }

        ob_start();
        imagepng($img);
        $data = ob_get_clean();
        imagedestroy($img);

        return 'data:image/png;base64,' . base64_encode($data);
    }

    /**
     * Obtener ruta local absoluta de la foto del pastor
     */
    protected function obtenerRutaFotoPastor(Pastor $pastor): ?string
    {
        if (!$pastor->foto) {
            return null;
        }

        $trimmed = trim($pastor->foto);
        if (!$trimmed) {
            return null;
        }

        $pathPublic = public_path('pastores/' . $trimmed);
        if (file_exists($pathPublic)) {
            return $pathPublic;
        }

        $pathStorage = storage_path('app/public/' . $trimmed);
        if (file_exists($pathStorage)) {
            return $pathStorage;
        }

        return null;
    }

    /**
     * Formatea el documento de identidad (ej: E-82.083.660)
     */
    protected function formatearDocumento(?string $doc): string
    {
        if (!$doc) {
            return 'V-00.000.000';
        }

        $clean = strtoupper(trim($doc));
        if (preg_match('/^([VEJ])[- ]?([0-9]+)$/', $clean, $matches)) {
            $prefijo = $matches[1];
            $num = number_format((int)$matches[2], 0, '', '.');
            return "{$prefijo}-{$num}";
        }

        return $clean;
    }
}
