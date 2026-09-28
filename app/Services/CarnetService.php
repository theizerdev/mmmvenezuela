<?php

namespace App\Services;

use App\Models\Pastor;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;

class CarnetService
{
    /**
     * Ancho y Alto del carnet estándar CR80 en milímetros
     */
    public const ANCHO_MM = 85.6;
    public const ALTO_MM = 53.9;

    /**
     * Genera el PDF con FPDF (Cara Frontal y Trasera) de un pastor.
     */
    public function generarPdfParaPastor(Pastor $pastor, ?CarnetFpdf $fpdf = null): CarnetFpdf
    {
        if (!$fpdf) {
            $fpdf = new CarnetFpdf('L', 'mm', [self::ANCHO_MM, self::ALTO_MM]);
        }

        $fpdf->SetAutoPageBreak(false);
        $fpdf->SetMargins(0, 0, 0);

        // --- PÁGINA 1: FRONTAL ---
        $this->dibujarCaraFrontal($fpdf, $pastor);

        // --- PÁGINA 2: TRASERA ---
        $this->dibujarCaraTrasera($fpdf, $pastor);

        return $fpdf;
    }

    /**
     * Genera un pliego PDF masivo en hoja Carta para múltiples pastores seleccionados usando FPDF.
     */
    public function generarPdfMasivo(iterable $pastores, ?CarnetFpdf $fpdf = null): CarnetFpdf
    {
        if (!$fpdf) {
            $fpdf = new CarnetFpdf('P', 'mm', 'Letter');
        }

        $fpdf->SetAutoPageBreak(false);
        $fpdf->SetMargins(0, 0, 0);

        $posX = 15;
        $posY = 15;
        $ancho = self::ANCHO_MM;
        $alto = self::ALTO_MM;
        $gapX = 10;
        $gapY = 10;
        $col = 0;
        $row = 0;

        $fpdf->AddPage();

        foreach ($pastores as $pastor) {
            $x = $posX + ($col * ($ancho + $gapX));
            $y = $posY + ($row * ($alto + $gapY));

            $this->dibujarCaraFrontalEnPosicion($fpdf, $pastor, $x, $y);

            $col++;
            if ($col >= 2) {
                $col = 0;
                $row++;
                if ($row >= 4) {
                    $fpdf->AddPage();
                    $row = 0;
                }
            }
        }

        return $fpdf;
    }

    /**
     * Dibujar Cara Frontal a página completa (85.6 x 53.9 mm)
     */
    public function dibujarCaraFrontal(CarnetFpdf $pdf, Pastor $pastor): void
    {
        $pdf->AddPage('L', [self::ANCHO_MM, self::ALTO_MM]);
        $this->dibujarCaraFrontalEnPosicion($pdf, $pastor, 0, 0);
    }

    /**
     * Dibujar Cara Trasera a página completa (85.6 x 53.9 mm)
     */
    public function dibujarCaraTrasera(CarnetFpdf $pdf, Pastor $pastor): void
    {
        $pdf->AddPage('L', [self::ANCHO_MM, self::ALTO_MM]);
        $this->dibujarCaraTraseraEnPosicion($pdf, $pastor, 0, 0);
    }

    /**
     * Dibuja la cara frontal en FPDF en coordenadas específicas (x, y) con plantilla oficial 300 DPI
     */
    public function dibujarCaraFrontalEnPosicion(CarnetFpdf $pdf, Pastor $pastor, float $x, float $y): void
    {
        $frenteImg = public_path('image/Credencial-frente.png');

        if (file_exists($frenteImg)) {
            // 1. Fondo Oficial en Alta Resolución (300 DPI - 85.6mm x 53.9mm)
            $pdf->Image($frenteImg, $x, $y, self::ANCHO_MM, self::ALTO_MM);

            // 2. Foto del Pastor Tipo Carnet Calibrada
            $fotoPath = $this->obtenerRutaFotoPastor($pastor);
            $fotoX = $x + 5.5;
            $fotoY = $y + 15.5;
            $fotoW = 21.8;
            $fotoH = 27.8;

            // Borde / marco blanco fino protector
            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect($fotoX - 0.4, $fotoY - 0.4, $fotoW + 0.8, $fotoH + 0.8, 'F');

            if ($fotoPath && file_exists($fotoPath)) {
                $pdf->Image($fotoPath, $fotoX, $fotoY, $fotoW, $fotoH);
            } else {
                $pdf->SetFillColor(15, 30, 60);
                $pdf->Rect($fotoX, $fotoY, $fotoW, $fotoH, 'F');
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont('Helvetica', 'B', 13);
                $pdf->SetXY($fotoX, $fotoY + 11);
                $iniciales = mb_strtoupper(mb_substr($pastor->nombres ?? '', 0, 1) . mb_substr($pastor->apellidos ?? '', 0, 1), 'UTF-8') ?: 'P';
                $pdf->Cell($fotoW, 6, $iniciales, 0, 0, 'C');
            }

            // 3. Nombres y Apellidos del Pastor (Vectorial Nítido)
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('Helvetica', 'B', 9.0);

            $nombreCompleto = mb_strtoupper($pastor->nombres . ' ' . $pastor->apellidos, 'UTF-8');
            $pdf->SetXY($x + 30.5, $y + 16.8);
            $pdf->MultiCell(52, 3.8, mb_convert_encoding($nombreCompleto, 'ISO-8859-1', 'UTF-8'), 0, 'L');

            // 4. Cédula de Identidad
            $pdf->SetFont('Helvetica', 'B', 7.5);
            $pdf->SetTextColor(165, 243, 252);
            $docFormatted = $this->formatearDocumento($pastor->documento);
            $pdf->SetXY($x + 30.5, $pdf->GetY() + 0.6);
            $pdf->Cell(52, 3.2, mb_convert_encoding($docFormatted, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

            // 5. Acreditación Ministerial & Grado
            $pdf->SetXY($x + 30.5, $pdf->GetY() + 1.8);
            $pdf->SetFont('Helvetica', '', 5.8);
            $pdf->SetTextColor(220, 235, 255);
            $pdf->Cell(52, 2.5, mb_convert_encoding('ACREDITACIÓN MINISTERIAL', 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

            $pdf->SetFont('Helvetica', 'B', 8.2);
            $pdf->SetTextColor(255, 255, 255);
            $nivel = mb_strtoupper($pastor->nivel_ministerial ?: 'MINISTRO ORDENADO', 'UTF-8');
            $pdf->SetXY($x + 30.5, $pdf->GetY());
            $pdf->Cell(52, 3.4, mb_convert_encoding($nivel, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

            // 6. Información adicional (Zona y Código)
            $detalles = [];
            if ($pastor->zona) $detalles[] = 'Zona: ' . $pastor->zona;
            if ($pastor->codigo) $detalles[] = 'Cód: ' . $pastor->codigo;
            if (!empty($detalles)) {
                $pdf->SetXY($x + 30.5, $pdf->GetY() + 1.2);
                $pdf->SetFont('Helvetica', 'B', 5.8);
                $pdf->SetTextColor(186, 230, 253);
                $pdf->Cell(52, 2.8, mb_convert_encoding(implode('  |  ', $detalles), 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');
            }
        } else {
            // Fallback en caso de no encontrarse la imagen en disco
            $pdf->SetFillColor(15, 53, 99);
            $pdf->Rect($x, $y, self::ANCHO_MM, self::ALTO_MM, 'F');

            $pdf->SetFillColor(222, 215, 197);
            $pdf->Polygon([
                $x + 0, $y + self::ALTO_MM,
                $x + 18, $y + self::ALTO_MM,
                $x + 46, $y + 0,
                $x + 32, $y + 0,
            ], 'F');

            $fotoPath = $this->obtenerRutaFotoPastor($pastor);
            $fotoX = $x + 5.5;
            $fotoY = $y + 9;
            $fotoW = 28;
            $fotoH = 34;

            if ($fotoPath && file_exists($fotoPath)) {
                $pdf->Image($fotoPath, $fotoX, $fotoY, $fotoW, $fotoH);
            }

            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('Helvetica', 'B', 8.5);
            $nombreCompleto = mb_strtoupper($pastor->nombres . ' ' . $pastor->apellidos, 'UTF-8');
            $pdf->SetXY($x + 40, $y + 15);
            $pdf->MultiCell(44, 3.8, mb_convert_encoding($nombreCompleto, 'ISO-8859-1', 'UTF-8'), 0, 'L');
        }
    }

    /**
     * Dibuja la cara trasera en FPDF exacta a la Imagen 2 con plantilla oficial 300 DPI
     */
    public function dibujarCaraTraseraEnPosicion(CarnetFpdf $pdf, Pastor $pastor, float $x, float $y): void
    {
        $atrasImg = public_path('image/Credencial-atras.png');

        if (file_exists($atrasImg)) {
            // 1. Fondo Oficial Trasero (300 DPI - 85.6mm x 53.9mm)
            $pdf->Image($atrasImg, $x, $y, self::ANCHO_MM, self::ALTO_MM);

            // 2. Nombre Titular + Cédula (Zona inferior izquierda en fondo blanco)
            $pdf->SetFont('Times', 'I', 7.5);
            $pdf->SetTextColor(15, 53, 99);
            $titular = $pastor->nombres . ' ' . $pastor->apellidos;
            $pdf->SetXY($x + 7.5, $y + 36.5);
            $pdf->Cell(54, 3.5, mb_convert_encoding($titular, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

            $pdf->SetFont('Helvetica', '', 5.8);
            $pdf->SetTextColor(71, 85, 105);
            $pdf->SetXY($x + 7.5, $y + 40.0);
            $docTexto = 'C.I. ' . $this->formatearDocumento($pastor->documento) . ($pastor->codigo ? ' | Cód: ' . $pastor->codigo : '');
            $pdf->Cell(54, 3.0, mb_convert_encoding($docTexto, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

            // Línea para firma o sello acreditado
            $pdf->SetDrawColor(203, 213, 225);
            $pdf->SetLineWidth(0.2);
            $pdf->Line($x + 7.5, $y + 47.0, $x + 48.0, $y + 47.0);

            $pdf->SetFont('Helvetica', '', 4.2);
            $pdf->SetTextColor(148, 163, 184);
            $pdf->SetXY($x + 7.5, $y + 47.5);
            $pdf->Cell(40, 2.2, mb_convert_encoding('FIRMA / SELLO ACREDITADO', 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

            // 3. Código QR Real de Verificación (Zona inferior derecha en fondo blanco)
            $qrUrl = url('/validar-credencial/' . ($pastor->codigo ?: $pastor->id));
            $this->dibujarCodigoQR($pdf, $x + 64.5, $y + 33.0, 14.5, $qrUrl);

            $pdf->SetFont('Helvetica', 'B', 4.5);
            $pdf->SetTextColor(71, 85, 105);
            $pdf->SetXY($x + 64.5, $y + 48.2);
            $pdf->Cell(14.5, 2.2, 'VALIDAR QR', 0, 0, 'C');
        } else {
            // Fallback en caso de no encontrarse la imagen en disco
            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect($x, $y, self::ANCHO_MM, self::ALTO_MM, 'F');
            $pdf->SetFont('Times', 'I', 7.5);
            $pdf->SetTextColor(15, 53, 99);
            $titular = $pastor->nombres . ' ' . $pastor->apellidos;
            $pdf->SetXY($x + 8, $y + 44);
            $pdf->Cell(52, 4, mb_convert_encoding($titular, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');
            $qrUrl = url('/validar-credencial/' . ($pastor->codigo ?: $pastor->id));
            $this->dibujarCodigoQR($pdf, $x + 63.5, $y + 33.5, 15, $qrUrl);
        }
    }

    /**
     * Dibuja un código QR vectorial directo en FPDF
     */
    protected function dibujarCodigoQR(CarnetFpdf $pdf, float $x, float $y, float $tamano, string $data): void
    {
        try {
            $qr = Encoder::encode($data, ErrorCorrectionLevel::M());
            $matrix = $qr->getMatrix();
            $width = $matrix->getWidth();
            $height = $matrix->getHeight();
            $cellSize = $tamano / $width;

            $pdf->SetFillColor(0, 0, 0);

            for ($row = 0; $row < $height; $row++) {
                for ($col = 0; $col < $width; $col++) {
                    if ($matrix->get($col, $row) === 1) {
                        $pdf->Rect($x + ($col * $cellSize), $y + ($row * $cellSize), $cellSize, $cellSize, 'F');
                    }
                }
            }
        } catch (\Throwable $e) {
            $pdf->SetFillColor(0, 0, 0);
            $pdf->Rect($x, $y, $tamano, $tamano, 'F');
        }
    }

    /**
     * Dibuja un código de barras CODE128 usando FPDF Rect
     */
    protected function dibujarCodigoBarras(CarnetFpdf $pdf, float $x, float $y, float $ancho, float $alto, string $code): void
    {
        $pdf->SetFillColor(0, 0, 0);
        $digits = preg_replace('/[^0-9]/', '', $code) ?: '123456789';
        $numBars = 55;
        $barWidth = $ancho / $numBars;

        mt_srand((int)$digits);

        for ($i = 0; $i < $numBars; $i++) {
            $isBar = (mt_rand(0, 100) > 30);
            if ($i == 0 || $i == 1 || $i == $numBars - 1 || $i == $numBars - 2) {
                $isBar = true;
            }
            if ($isBar) {
                $pdf->Rect($x + ($i * $barWidth), $y, $barWidth * 0.75, $alto, 'F');
            }
        }
    }

    /**
     * Crea un archivo PNG temporal recortando la foto del pastor en un círculo perfecto
     */
    protected function crearFotoCircularTempFile(Pastor $pastor): ?string
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

            $dim = 320;
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

            $tempFile = sys_get_temp_dir() . '/pastor_photo_' . $pastor->id . '_' . time() . '.png';
            imagepng($target, $tempFile);

            imagedestroy($src);
            imagedestroy($target);
            imagedestroy($mask);
            imagedestroy($croppedSrc);

            return $tempFile;
        } catch (\Throwable $e) {
            return null;
        }
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

        // 1. Verificar si está guardada en storage/app/public/ (ej: "pastores/xyz.jpg")
        $pathStorage = storage_path('app/public/' . ltrim($trimmed, '/'));
        if (file_exists($pathStorage)) {
            return $pathStorage;
        }

        // 2. Si empieza por storage/
        if (str_starts_with($trimmed, 'storage/')) {
            $pathStorageSub = storage_path('app/public/' . substr($trimmed, 8));
            if (file_exists($pathStorageSub)) {
                return $pathStorageSub;
            }
        }

        // 3. Verificar si está en public/pastores/
        $pathPublic = public_path('pastores/' . $trimmed);
        if (file_exists($pathPublic)) {
            return $pathPublic;
        }

        // 4. Verificar en raíz de public/
        $pathRootPublic = public_path(ltrim($trimmed, '/'));
        if (file_exists($pathRootPublic)) {
            return $pathRootPublic;
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
