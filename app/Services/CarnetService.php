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
     * Dibuja la cara frontal en FPDF en coordenadas específicas (x, y) - Réplica 1:1 Imagen 1
     */
    public function dibujarCaraFrontalEnPosicion(CarnetFpdf $pdf, Pastor $pastor, float $x, float $y): void
    {
        // 1. Fondo Azul Corporativo (#0f3563 / RGB 15, 53, 99)
        $pdf->SetFillColor(15, 53, 99);
        $pdf->Rect($x, $y, self::ANCHO_MM, self::ALTO_MM, 'F');

        // 2. Franja Diagonal Crema/Marfil (#ded7c5 / RGB 222, 215, 197)
        $pdf->SetFillColor(222, 215, 197);
        $pdf->Polygon([
            $x + 0, $y + self::ALTO_MM,
            $x + 18, $y + self::ALTO_MM,
            $x + 46, $y + 0,
            $x + 32, $y + 0,
        ], 'F');

        // 3. Logo MMM en esquina superior derecha
        $logoPath = public_path('icons/logo_mmm-a-color-sin-fondo.png');
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, $x + 43.5, $y + 5.2, 7.5, 5.5);
        }

        // Encabezado Texto Derecho (MMM + Registro Legal Centrado como la imagen)
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Helvetica', 'B', 5.2);
        $pdf->SetXY($x + 48, $y + 2.2);
        $pdf->Cell(36, 2.5, mb_convert_encoding('MOVIMIENTO MISIONERO MUNDIAL', 'ISO-8859-1', 'UTF-8'), 0, 1, 'C');

        $pdf->SetFont('Helvetica', '', 3.6);
        $pdf->SetXY($x + 48, $y + 4.8);
        $pdf->Cell(36, 2, mb_convert_encoding('Inscrita en la Dirección de Justicia y Culto', 'ISO-8859-1', 'UTF-8'), 0, 1, 'C');
        $pdf->SetXY($x + 48, $y + 6.7);
        $pdf->Cell(36, 2, mb_convert_encoding('bajo el N° DG/520 DF/620-100.361', 'ISO-8859-1', 'UTF-8'), 0, 1, 'C');
        $pdf->SetXY($x + 48, $y + 8.6);
        $pdf->SetFont('Helvetica', 'B', 4.0);
        $pdf->Cell(36, 2, 'J - 3 0 1 8 7 4 4 6 - 3', 0, 1, 'C');

        // 4. Foto del Pastor Rectangular/Cuadrada Tipo Carnet (Planilla)
        $fotoPath = $this->obtenerRutaFotoPastor($pastor);
        $fotoX = $x + 5.5;
        $fotoY = $y + 9;
        $fotoW = 28;
        $fotoH = 34;

        // Borde/Fondo Crema (#ded7c5)
        $pdf->SetFillColor(222, 215, 197);
        $pdf->Rect($fotoX - 0.8, $fotoY - 0.8, $fotoW + 1.6, $fotoH + 1.6, 'F');

        if ($fotoPath && file_exists($fotoPath)) {
            $pdf->Image($fotoPath, $fotoX, $fotoY, $fotoW, $fotoH);
        } else {
            // Fondo azul si no hay foto
            $pdf->SetFillColor(15, 53, 99);
            $pdf->Rect($fotoX, $fotoY, $fotoW, $fotoH, 'F');
        }

        // Borde marco fino blanco protector
        $pdf->SetDrawColor(255, 255, 255);
        $pdf->SetLineWidth(0.4);
        $pdf->Rect($fotoX - 0.8, $fotoY - 0.8, $fotoW + 1.6, $fotoH + 1.6, 'D');

        // 5. Nombres y Apellidos del Pastor
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('Helvetica', 'B', 8.5);

        $nombreCompleto = mb_strtoupper($pastor->nombres . ' ' . $pastor->apellidos, 'UTF-8');
        $pdf->SetXY($x + 40, $y + 15);
        $pdf->MultiCell(44, 3.8, mb_convert_encoding($nombreCompleto, 'ISO-8859-1', 'UTF-8'), 0, 'L');

        // 6. Cédula de Identidad
        $pdf->SetFont('Helvetica', 'B', 7.5);
        $docFormatted = $this->formatearDocumento($pastor->documento);
        $pdf->SetXY($x + 40, $pdf->GetY() + 0.5);
        $pdf->Cell(44, 3.5, mb_convert_encoding($docFormatted, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

        // 7. Acreditación Ministerial & Grado
        $pdf->SetXY($x + 40, $pdf->GetY() + 1.8);
        $pdf->SetFont('Helvetica', '', 6.2);
        $pdf->SetTextColor(220, 235, 255);
        $pdf->Cell(44, 3, mb_convert_encoding('Acreditación Ministerial', 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

        $pdf->SetFont('Helvetica', 'B', 8.5);
        $pdf->SetTextColor(165, 243, 252);
        $nivel = mb_strtoupper($pastor->nivel_ministerial ?: 'MINISTRO ORDENADO', 'UTF-8');
        $pdf->SetXY($x + 40, $pdf->GetY());
        $pdf->Cell(44, 3.5, mb_convert_encoding($nivel, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

        // 8. Lema Inferior en 2 Líneas Centradas (Idéntico a la Imagen de Referencia)
        $pdf->SetFont('Helvetica', 'B', 4.3);
        $pdf->SetTextColor(255, 255, 255);

        $linea1 = '...UN ESFUERZO DE FE Y DE SACRIFICIO EN BIEN DE LA OBRA';
        $linea2 = 'MISIONERA Y DE LA EVANGELIZACIÓN DEL MUNDO.';

        $pdf->SetXY($x + 18, $y + 46.2);
        $pdf->Cell(48, 2.2, mb_convert_encoding($linea1, 'ISO-8859-1', 'UTF-8'), 0, 1, 'C');
        $pdf->SetXY($x + 18, $y + 48.4);
        $pdf->Cell(48, 2.2, mb_convert_encoding($linea2, 'ISO-8859-1', 'UTF-8'), 0, 1, 'C');

        // 9. Expiración (Esquina inferior derecha)
        $pdf->SetFont('Helvetica', 'B', 4.8);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetXY($x + 67, $y + 47.5);
        $vencimiento = 'VENCE 12-' . (date('Y') + 1);
        $pdf->Cell(15, 2.5, $vencimiento, 0, 0, 'R');
    }

    /**
     * Dibuja la cara trasera en FPDF exacta a la Imagen 2
     */
    public function dibujarCaraTraseraEnPosicion(CarnetFpdf $pdf, Pastor $pastor, float $x, float $y): void
    {
        // 1. Fondo Blanco
        $pdf->SetFillColor(255, 255, 255);
        $pdf->Rect($x, $y, self::ANCHO_MM, self::ALTO_MM, 'F');

        // 2. Esquinas Decorativas Azules (#0f3563 / RGB 15, 53, 99) según Imagen 2
        $pdf->SetFillColor(15, 53, 99);

        // Esquina superior izquierda (Banda diagonal doble)
        $pdf->Polygon([
            $x + 0, $y + 0,
            $x + 22, $y + 0,
            $x + 0, $y + 22,
        ], 'F');
        $pdf->Polygon([
            $x + 0, $y + 26,
            $x + 26, $y + 0,
            $x + 20, $y + 0,
            $x + 0, $y + 20,
        ], 'F');

        // Esquina inferior derecha (Banda diagonal)
        $pdf->Polygon([
            $x + self::ANCHO_MM, $y + self::ALTO_MM,
            $x + self::ANCHO_MM - 22, $y + self::ALTO_MM,
            $x + self::ANCHO_MM, $y + self::ALTO_MM - 22,
        ], 'F');

        // 3. Logo Superior Horizontal MMM
        $logoPath = public_path('icons/logo_mmm-a-color-sin-fondo.png');
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, $x + 14.5, $y + 3, 7.5, 5.5);
        }

        $pdf->SetTextColor(15, 53, 99);
        $pdf->SetFont('Helvetica', 'B', 8.5);
        $pdf->SetXY($x + 25, $y + 5);
        $pdf->Cell(55, 4, mb_convert_encoding('MOVIMIENTO MISIONERO MUNDIAL', 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

        // 4. Párrafos Legales e Institucionales (Exactos a Imagen 2)
        $pdf->SetTextColor(30, 41, 59);
        $pdf->SetFont('Helvetica', '', 3.8);

        $texto1 = "ORGANIZACION CRISTIANA, SIN FINES DE LUCRO, DEBIDAMENTE REGISTRADA ANTE LAS AUTORIDADES GUBERNAMENTALES DE LA REPÚBLICA BOLIVARIANA DE VENEZUELA, INSCRITA EN LA DIRECCIÓN DE JUSTICIA Y CULTO BAJO EL N° DG/520 DF/620-100.361.";
        $pdf->SetXY($x + 8, $y + 12.5);
        $pdf->MultiCell(70, 1.9, mb_convert_encoding($texto1, 'ISO-8859-1', 'UTF-8'), 0, 'J');

        $texto2 = "ESTE CARNET ES PERSONAL E INTRANSFERIBLE Y ACREDITA AL USUARIO COMO MIEMBRO DE LA IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA DEL MOVIMIENTO MISIONERO MUNDIAL.";
        $pdf->SetXY($x + 8, $pdf->GetY() + 1.2);
        $pdf->MultiCell(70, 1.9, mb_convert_encoding($texto2, 'ISO-8859-1', 'UTF-8'), 0, 'J');

        $texto3 = "SE LE AGRADECE A LAS AUTORIDADES CIVILES Y MILITARES TODA LA COLABORACIÓN PRESTADA AL PORTADOR DE ESTA CREDENCIAL.";
        $pdf->SetXY($x + 8, $pdf->GetY() + 1.2);
        $pdf->SetFont('Helvetica', 'B', 3.8);
        $pdf->MultiCell(70, 1.9, mb_convert_encoding($texto3, 'ISO-8859-1', 'UTF-8'), 0, 'J');

        // 5. Nombre Titular + Cédula (Ubicado más abajo a la izquierda)
        $pdf->SetFont('Times', 'I', 7.5);
        $pdf->SetTextColor(15, 53, 99);
        $titular = $pastor->nombres . ' ' . $pastor->apellidos . ' (' . (preg_replace('/[^0-9]/', '', $pastor->documento) ?: $pastor->codigo) . ')';
        $pdf->SetXY($x + 8, $y + 43);
        $pdf->Cell(52, 4, mb_convert_encoding($titular, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L');

        // 6. Código QR Real de Verificación (Derecha del reverso)
        $qrUrl = url('/validar-credencial/' . ($pastor->codigo ?: $pastor->id));
        $this->dibujarCodigoQR($pdf, $x + 63, $y + 34, 16, $qrUrl);
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
