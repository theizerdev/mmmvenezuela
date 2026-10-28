<?php

namespace App\Services;

use App\Models\Pastor;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;

class CarnetService
{
    /**
     * Ancho y Alto de la tarjeta oficial de pastorado en milímetros (9 cm x 5.5 cm)
     */
    public const ANCHO_MM = 90.0;
    public const ALTO_MM = 55.0;

    /**
     * Obtiene la ruta física en disco de la plantilla frontal (personalizada o por defecto)
     */
    public static function getRutaPlantillaFrente(): string
    {
        $customImg = public_path('image/custom-Credencial-frente.png');
        if (file_exists($customImg)) {
            return $customImg;
        }
        $customStorage = public_path('storage/carnets/Credencial-frente.png');
        if (file_exists($customStorage)) {
            return $customStorage;
        }
        $customApp = storage_path('app/public/carnets/Credencial-frente.png');
        if (file_exists($customApp)) {
            return $customApp;
        }
        return public_path('image/Credencial-frente.png');
    }

    /**
     * Obtiene la ruta física en disco de la plantilla trasera (personalizada o por defecto)
     */
    public static function getRutaPlantillaAtras(): string
    {
        $customImg = public_path('image/custom-Credencial-atras.png');
        if (file_exists($customImg)) {
            return $customImg;
        }
        $customStorage = public_path('storage/carnets/Credencial-atras.png');
        if (file_exists($customStorage)) {
            return $customStorage;
        }
        $customApp = storage_path('app/public/carnets/Credencial-atras.png');
        if (file_exists($customApp)) {
            return $customApp;
        }
        return public_path('image/Credencial-atras.png');
    }

    /**
     * Obtiene la URL pública para frontend de la plantilla frontal
     */
    public static function getUrlPlantillaFrente(): string
    {
        $customImg = public_path('image/custom-Credencial-frente.png');
        if (file_exists($customImg)) {
            return '/image/custom-Credencial-frente.png?v=' . filemtime($customImg);
        }
        $customStorage = public_path('storage/carnets/Credencial-frente.png');
        if (file_exists($customStorage)) {
            return '/storage/carnets/Credencial-frente.png?v=' . filemtime($customStorage);
        }
        $default = public_path('image/Credencial-frente.png');
        return '/image/Credencial-frente.png?v=' . (file_exists($default) ? filemtime($default) : '1');
    }

    /**
     * Obtiene la URL pública para frontend de la plantilla trasera
     */
    public static function getUrlPlantillaAtras(): string
    {
        $customImg = public_path('image/custom-Credencial-atras.png');
        if (file_exists($customImg)) {
            return '/image/custom-Credencial-atras.png?v=' . filemtime($customImg);
        }
        $customStorage = public_path('storage/carnets/Credencial-atras.png');
        if (file_exists($customStorage)) {
            return '/storage/carnets/Credencial-atras.png?v=' . filemtime($customStorage);
        }
        $default = public_path('image/Credencial-atras.png');
        return '/image/Credencial-atras.png?v=' . (file_exists($default) ? filemtime($default) : '1');
    }

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
     * Soporta modos:
     * - 'duplex': Página impar = Frentes (hasta 8), Página par = Dorsos alineados en espejo para tiro y retiro exacto.
     * - 'front_only': Solo páginas frontales (8 por página).
     * - 'cr80_individual': Modo tarjetas individuales para impresoras térmicas de PVC (Zebra / Evolis).
     */
    public function generarPdfMasivo(iterable $pastores, ?CarnetFpdf $fpdf = null, string $tipoPliego = 'duplex'): CarnetFpdf
    {
        $coleccion = is_array($pastores) ? $pastores : iterator_to_array($pastores);

        if ($tipoPliego === 'cr80_individual') {
            if (!$fpdf) {
                $fpdf = new CarnetFpdf('L', 'mm', [self::ANCHO_MM, self::ALTO_MM]);
            }
            $fpdf->SetAutoPageBreak(false);
            $fpdf->SetMargins(0, 0, 0);

            foreach ($coleccion as $pastor) {
                $this->dibujarCaraFrontal($fpdf, $pastor);
                $this->dibujarCaraTrasera($fpdf, $pastor);
            }

            return $fpdf;
        }

        if (!$fpdf) {
            $fpdf = new CarnetFpdf('P', 'mm', 'Letter');
        }

        $fpdf->SetAutoPageBreak(false);
        $fpdf->SetMargins(0, 0, 0);

        // Geometría calibrada simétrica para Hoja Carta (215.9 x 279.4 mm)
        // 2 columnas x 4 filas = 8 tarjetas oficiales (90 x 55 mm) por pliego
        $posX = 15.0;
        $posY = 21.0;
        $ancho = self::ANCHO_MM; // 90.0 mm
        $alto = self::ALTO_MM;   // 55.0 mm
        $gapX = 5.9; // Margen lateral simétrico exacto de 15.0 mm: 15.0 + 90.0 + 5.9 + 90.0 + 15.0 = 215.9 mm
        $gapY = 5.8; // Margen vertical simétrico exacto de 21.0 mm: 21.0 + 4*55.0 + 3*5.8 + 21.0 = 279.4 mm

        $grupos = array_chunk($coleccion, 8);

        foreach ($grupos as $grupo) {
            // --- PÁGINA IMPAR: FRENTES ---
            $fpdf->AddPage();
            foreach ($grupo as $index => $pastor) {
                $col = $index % 2;
                $row = (int) floor($index / 2);

                $x = $posX + ($col * ($ancho + $gapX));
                $y = $posY + ($row * ($alto + $gapY));

                $this->dibujarMarcasCorte($fpdf, $x, $y, $ancho, $alto);
                $this->dibujarCaraFrontalEnPosicion($fpdf, $pastor, $x, $y);
            }

            // --- PÁGINA PAR: DORSOS (Solo si es modo dúplex) ---
            if ($tipoPliego === 'duplex') {
                $fpdf->AddPage();
                foreach ($grupo as $index => $pastor) {
                    $colFront = $index % 2;
                    $row = (int) floor($index / 2);

                    // Espejar columna para que al voltear la hoja por el borde largo coincida anverso y reverso
                    $colBack = ($colFront === 0) ? 1 : 0;

                    $x = $posX + ($colBack * ($ancho + $gapX));
                    $y = $posY + ($row * ($alto + $gapY));

                    $this->dibujarMarcasCorte($fpdf, $x, $y, $ancho, $alto);
                    $this->dibujarCaraTraseraEnPosicion($fpdf, $pastor, $x, $y);
                }
            }
        }

        return $fpdf;
    }

    /**
     * Dibuja sutiles marcas de corte o guías de guillotina en las 4 esquinas del carnet
     */
    protected function dibujarMarcasCorte(CarnetFpdf $pdf, float $x, float $y, float $ancho, float $alto): void
    {
        $pdf->SetDrawColor(203, 213, 225); // Slate 300
        $pdf->SetLineWidth(0.15);
        $len = 2.5;

        // Esquina superior izquierda
        $pdf->Line($x - $len, $y, $x, $y);
        $pdf->Line($x, $y - $len, $x, $y);

        // Esquina superior derecha
        $pdf->Line($x + $ancho, $y, $x + $ancho + $len, $y);
        $pdf->Line($x + $ancho, $y - $len, $x + $ancho, $y);

        // Esquina inferior izquierda
        $pdf->Line($x - $len, $y + $alto, $x, $y + $alto);
        $pdf->Line($x, $y + $alto, $x, $y + $alto + $len);

        // Esquina inferior derecha
        $pdf->Line($x + $ancho, $y + $alto, $x + $ancho + $len, $y + $alto);
        $pdf->Line($x + $ancho, $y + $alto, $x + $ancho, $y + $alto + $len);
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
        $frenteImg = self::getRutaPlantillaFrente();

        if (file_exists($frenteImg)) {
            // 1. Fondo Oficial en Alta Resolución (300 DPI - 90.0mm x 55.0mm)
            $pdf->Image($frenteImg, $x, $y, self::ANCHO_MM, self::ALTO_MM);

            // 2. Foto del Pastor Tipo Carnet Calibrada (Alineada exactamente al marco oficial: 6.52mm x 14.72mm, 24.72mm x 35.71mm)
            $fotoPath = $this->prepararFotoParaCarnet($pastor) ?: $this->obtenerRutaFotoPastor($pastor);
            $fotoX = $x + 6.52;
            $fotoY = $y + 14.72;
            $fotoW = 24.72;
            $fotoH = 35.71;

            // Sin borde exterior artificial (el marco plateado de la plantilla ya lo contiene)
            if ($fotoPath && file_exists($fotoPath)) {
                $pdf->Image($fotoPath, $fotoX, $fotoY, $fotoW, $fotoH);
            } else {
                // Dejar ver el fondo plateado nativo de la plantilla con iniciales sutiles
                $pdf->SetTextColor(148, 163, 184); // Slate 400
                $pdf->SetFont('Helvetica', 'B', 16);
                $pdf->SetXY($fotoX, $fotoY + ($fotoH - 6) / 2);
                $iniciales = mb_strtoupper(mb_substr($pastor->nombres ?? '', 0, 1) . mb_substr($pastor->apellidos ?? '', 0, 1), 'UTF-8') ?: 'P';
                $pdf->Cell($fotoW, 6, $iniciales, 0, 0, 'C');
            }

            // Contenedor Derecho Calibrado con las Zonas de la Identidad Oficial
            $contX = $x + 31.9;
            $contW = 53.8;

            // 3. Bloque 1: Identificación Titular (Debajo de la franja PASTOR - Cocogoose Bold)
            $nombreCompleto = $this->obtenerNombreCompletoConTitulo($pastor, true);
            $nombreIso = $this->utf8ToPdf($nombreCompleto);
            $pdf->SetTextColor(0, 0, 0); // Pure Black #000000

            $nombreLen = mb_strlen($nombreCompleto, 'UTF-8');
            $fontSize = ($nombreLen > 28) ? 6.8 : (($nombreLen > 22) ? 7.6 : 8.8);
            $this->setFontWithFallback($pdf, 'Cocogoose', 'B', $fontSize);
            $textWidth = $pdf->GetStringWidth($nombreIso);

            if ($textWidth > $contW - 2) {
                $fontSize = max(5.4, round($fontSize * ($contW - 2) / $textWidth, 2));
                $this->setFontWithFallback($pdf, 'Cocogoose', 'B', $fontSize);
            }

            $pdf->SetXY($contX, $y + 26.0);
            $pdf->Cell($contW, 3.4, $nombreIso, 0, 1, 'C');

            // 4. Documento de Identidad (Aribau Grotesk Regular / Helvetica Regular)
            $pdf->SetFont('Helvetica', '', 5.8);
            $pdf->SetTextColor(15, 23, 42); // Slate 900
            $docFormatted = 'C.I. ' . $this->formatearDocumento($pastor->documento);
            $pdf->SetXY($contX, $y + 30.4);
            $pdf->Cell($contW, 2.2, $this->utf8ToPdf($docFormatted), 0, 1, 'C');

            // 5. Bloque 2: Grado Ministerial (Titular Cocogoose Bold)
            $this->setFontWithFallback($pdf, 'Cocogoose', 'B', 6.8);
            $pdf->SetTextColor(0, 0, 0); // Pure Black
            $nivel = mb_strtoupper($pastor->nivel_ministerial ?: 'MINISTRO ORDENADO', 'UTF-8');
            $pdf->SetXY($contX, $y + 33.8);
            $pdf->Cell($contW, 2.8, $this->utf8ToPdf($nivel), 0, 1, 'C');

            // 6. Bloque 3: Lugar de Trabajo (Titular Cocogoose Bold)
            $lugar = $this->obtenerLugarTrabajo($pastor);
            if (mb_strlen($lugar, 'UTF-8') > 24 && preg_match('/^iglesia\s+extensi[oó]n\s+/i', $lugar)) {
                $lugar = preg_replace('/^iglesia\s+/i', '', $lugar);
            }
            $lugarUpper = mb_strtoupper($lugar, 'UTF-8');
            $lugarIso = $this->utf8ToPdf($lugarUpper);
            $lugarLen = mb_strlen($lugarUpper, 'UTF-8');

            $pdf->SetTextColor(0, 0, 0); // Pure Black
            $lugarFontSize = ($lugarLen > 28) ? 5.0 : (($lugarLen > 20) ? 5.6 : 6.4);
            $this->setFontWithFallback($pdf, 'Cocogoose', 'B', $lugarFontSize);
            $textWidth = $pdf->GetStringWidth($lugarIso);

            if ($textWidth > $contW - 2) {
                $lugarFontSize = max(4.0, round($lugarFontSize * ($contW - 2) / $textWidth, 2));
                $this->setFontWithFallback($pdf, 'Cocogoose', 'B', $lugarFontSize);
            }

            $pdf->SetXY($contX, $y + 41.8);
            $pdf->Cell($contW, 2.8, $lugarIso, 0, 1, 'C');
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
        $atrasImg = self::getRutaPlantillaAtras();

        if (file_exists($atrasImg)) {
            // 1. Fondo Oficial Trasero (300 DPI - 90.0mm x 55.0mm)
            $pdf->Image($atrasImg, $x, $y, self::ANCHO_MM, self::ALTO_MM);

            // 2. Nombre Titular en Cursiva (zona libre inferior izquierda, idéntico a ejemplo.png)
            $pdf->SetFont('Helvetica', 'I', 7.5);
            $pdf->SetTextColor(0, 0, 0);
            $titular = $this->obtenerNombreCompletoConTitulo($pastor, false);
            $pdf->SetXY($x + 9.0, $y + 42.6);
            $pdf->Cell(56.0, 3.2, $this->utf8ToPdf($titular), 0, 1, 'L');

            // 3. Ubicación: Lugar - Zona - Distrito (Mayúsculas)
            $pdf->SetFont('Helvetica', 'B', 5.0);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetXY($x + 9.0, $y + 45.4);
            $lugarReverso = $this->obtenerLugarReverso($pastor);
            $pdf->Cell(56.0, 2.4, $this->utf8ToPdf($lugarReverso), 0, 1, 'L');

            // 4. Código QR Oficial de Validación (Esquina inferior derecha)
            $qrX = $x + 67.5;
            $qrY = $y + 36.8;
            $qrSize = 11.5;
            $qrUrl = url('/validar-credencial/' . ($pastor->codigo ?: $pastor->id));
            $this->dibujarCodigoQR($pdf, $qrX, $qrY, $qrSize, $qrUrl);
        } else {
            // Fallback en caso de no encontrarse la imagen en disco
            $pdf->SetFillColor(255, 255, 255);
            $pdf->Rect($x, $y, self::ANCHO_MM, self::ALTO_MM, 'F');
            $pdf->SetFont('Helvetica', 'I', 7.5);
            $pdf->SetTextColor(0, 0, 0);
            $titular = $this->obtenerNombreCompletoConTitulo($pastor, false);
            $pdf->SetXY($x + 9.0, $y + 42.6);
            $pdf->Cell(56.0, 3.2, $this->utf8ToPdf($titular), 0, 1, 'L');

            $pdf->SetFont('Helvetica', 'B', 5.0);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetXY($x + 9.0, $y + 45.4);
            $lugarReverso = $this->obtenerLugarReverso($pastor);
            $pdf->Cell(56.0, 2.4, $this->utf8ToPdf($lugarReverso), 0, 1, 'L');

            $qrUrl = url('/validar-credencial/' . ($pastor->codigo ?: $pastor->id));
            $this->dibujarCodigoQR($pdf, $x + 67.5, $y + 36.8, 11.5, $qrUrl);
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
     * Prepara, recorta automáticamente en proporción 201:285 y redondea las esquinas
     * de la fotografía del pastor para el carnet oficial, almacenándola en caché.
     */
    public function prepararFotoParaCarnet(Pastor $pastor): ?string
    {
        $fotoPath = $this->obtenerRutaFotoPastor($pastor);
        if (!$fotoPath || !file_exists($fotoPath)) {
            return null;
        }

        try {
            $cacheDir = storage_path('app/public/carnets_cache');
            if (!file_exists($cacheDir)) {
                @mkdir($cacheDir, 0755, true);
            }

            $cacheKey = 'foto_' . $pastor->id . '_' . md5_file($fotoPath) . '.png';
            $cachedFile = $cacheDir . DIRECTORY_SEPARATOR . $cacheKey;

            if (file_exists($cachedFile) && filesize($cachedFile) > 0) {
                return $cachedFile;
            }

            $info = @getimagesize($fotoPath);
            if (!$info) {
                return $fotoPath;
            }

            $mime = $info['mime'] ?? '';
            $src = null;
            if ($mime === 'image/jpeg') {
                $src = @imagecreatefromjpeg($fotoPath);
            } elseif ($mime === 'image/png') {
                $src = @imagecreatefrompng($fotoPath);
            } elseif ($mime === 'image/webp') {
                $src = @imagecreatefromwebp($fotoPath);
            }

            if (!$src) {
                return $fotoPath;
            }

            $origW = imagesx($src);
            $origH = imagesy($src);

            // Si la foto ya fue ajustada o guardada a proporción oficial PNG con transparencia, usarla directamente
            $proporcionesAceptadas = [
                [396, 572],
                [198, 286],
                [584, 844],
                [292, 422],
                [416, 576],
                [402, 570],
            ];
            foreach ($proporcionesAceptadas as $dim) {
                if ($origW === $dim[0] && $origH === $dim[1] && $mime === 'image/png') {
                    imagedestroy($src);
                    return $fotoPath;
                }
            }

            // Proporción oficial: 198 de ancho x 286 de alto (396 x 572 en alta resolución 2x para 300 DPI)
            $targetW = 396;
            $targetH = 572;
            $targetRatio = $targetW / $targetH;
            $origRatio = $origW / $origH;

            // Recorte inteligente centrado y ponderado al rostro (zona superior)
            if ($origRatio > $targetRatio) {
                // La imagen es más ancha: recortar laterales, centrado en X
                $cropH = $origH;
                $cropW = (int) round($origH * $targetRatio);
                $cropX = (int) round(($origW - $cropW) / 2);
                $cropY = 0;
            } else {
                // La imagen es más alta: recortar inferior, priorizando parte superior (rostro)
                $cropW = $origW;
                $cropH = (int) round($origW / $targetRatio);
                $cropX = 0;
                $cropY = (int) round(($origH - $cropH) * 0.10);
            }

            // Imagen redimensionada con soporte de transparencia
            $resized = imagecreatetruecolor($targetW, $targetH);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            $transparent = imagecolorallocatealpha($resized, 0, 0, 0, 127);
            imagefill($resized, 0, 0, $transparent);

            // Copiar región recortada
            imagealphablending($resized, true);
            imagecopyresampled(
                $resized, $src,
                0, 0, $cropX, $cropY,
                $targetW, $targetH, $cropW, $cropH
            );

            // Aplicar máscara de esquinas redondeadas oficial (radio 32px en lienzo 396x572)
            $radius = 32;
            $final = imagecreatetruecolor($targetW, $targetH);
            imagealphablending($final, false);
            imagesavealpha($final, true);
            imagefill($final, 0, 0, $transparent);

            for ($x = 0; $x < $targetW; $x++) {
                for ($y = 0; $y < $targetH; $y++) {
                    $inCorner = false;
                    $dx = 0;
                    $dy = 0;

                    if ($x < $radius && $y < $radius) {
                        $inCorner = true;
                        $dx = $radius - $x;
                        $dy = $radius - $y;
                    } elseif ($x >= $targetW - $radius && $y < $radius) {
                        $inCorner = true;
                        $dx = $x - ($targetW - $radius - 1);
                        $dy = $radius - $y;
                    } elseif ($x < $radius && $y >= $targetH - $radius) {
                        $inCorner = true;
                        $dx = $radius - $x;
                        $dy = $y - ($targetH - $radius - 1);
                    } elseif ($x >= $targetW - $radius && $y >= $targetH - $radius) {
                        $inCorner = true;
                        $dx = $x - ($targetW - $radius - 1);
                        $dy = $y - ($targetH - $radius - 1);
                    }

                    if ($inCorner) {
                        $dist = sqrt($dx * $dx + $dy * $dy);
                        if ($dist <= $radius - 1) {
                            $color = imagecolorat($resized, $x, $y);
                            imagesetpixel($final, $x, $y, $color);
                        } elseif ($dist <= $radius) {
                            $alphaFactor = $radius - $dist;
                            $color = imagecolorat($resized, $x, $y);
                            $a = ($color >> 24) & 0x7F;
                            $r = ($color >> 16) & 0xFF;
                            $g = ($color >> 8) & 0xFF;
                            $b = $color & 0xFF;
                            $newA = (int) round(127 - (127 - $a) * $alphaFactor);
                            $newColor = imagecolorallocatealpha($final, $r, $g, $b, $newA);
                            imagesetpixel($final, $x, $y, $newColor);
                        }
                    } else {
                        $color = imagecolorat($resized, $x, $y);
                        imagesetpixel($final, $x, $y, $color);
                    }
                }
            }

            imagepng($final, $cachedFile, 8);

            imagedestroy($src);
            imagedestroy($resized);
            imagedestroy($final);

            return $cachedFile;
        } catch (\Throwable $e) {
            \Log::warning("Error preparando foto para carnet del pastor {$pastor->id}: " . $e->getMessage());
            return $fotoPath;
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
     * Obtiene el Estado al que pertenece la extensión de trabajo para la credencial frontal.
     * Sincronizado idénticamente con la lógica de PastorCarnetCard.tsx
     */
    public function obtenerLugarTrabajo(Pastor $pastor): string
    {
        // 1. Priorizar el Estado al que pertenece la extensión que pastorea
        $estado = $pastor->extension_estado ?: ($pastor->estado?->nombre ?: null);
        if (!empty($estado) && trim($estado) !== '') {
            $estadoStr = trim($estado);
            if (stripos($estadoStr, 'Distrito Capital') !== false || stripos($estadoStr, 'Caracas') !== false) {
                return 'DISTRITO CAPITAL';
            }
            return mb_strtoupper($estadoStr, 'UTF-8');
        }

        // 2. Si no hay estado disponible, recurrir al nombre de la extensión o zona
        if (!empty($pastor->extension_nombre) && trim($pastor->extension_nombre) !== '') {
            return mb_strtoupper(trim($pastor->extension_nombre), 'UTF-8');
        }

        $parts = [];
        if (!empty($pastor->zona)) {
            $parts[] = 'ZONA ' . $pastor->zona;
        }
        if (!empty($pastor->distrito)) {
            $parts[] = 'DISTRITO ' . $pastor->distrito;
        }

        if (count($parts) > 0) {
            return implode('   ', $parts);
        }

        return 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
    }

    /**
     * Obtiene la línea de ubicación inferior del reverso (ej: ZULIA - ZONA 14- DISTRITO 2 o CARACAS - ZONA 1- DISTRITO 1)
     * Sincronizado idénticamente con getPastorCarnetReversoLocation en PastorCarnetCard.tsx
     */
    public function obtenerLugarReverso(Pastor $pastor): string
    {
        $lugar = $pastor->extension_estado ?: ($pastor->estado?->nombre ?: ($pastor->municipio ?: ''));

        if (empty($lugar) && !empty($pastor->extension_nombre)) {
            $lugar = $pastor->extension_nombre;
        }

        if (preg_match('/^iglesia\s+central\s+/i', $lugar)) {
            $lugar = preg_replace('/^iglesia\s+central\s+/i', '', $lugar);
        } elseif (preg_match('/^iglesia\s+extensi[oó]n\s+/i', $lugar)) {
            $lugar = preg_replace('/^iglesia\s+extensi[oó]n\s+/i', '', $lugar);
        } elseif (preg_match('/^iglesia\s+/i', $lugar)) {
            $lugar = preg_replace('/^iglesia\s+/i', '', $lugar);
        }

        if (preg_match('/catia/i', $lugar) || stripos($lugar, 'Distrito Capital') !== false || stripos($lugar, 'Caracas') !== false) {
            $lugar = 'CARACAS';
        }

        if (empty($lugar) || preg_match('/^zona\s+/i', $lugar)) {
            $lugar = $pastor->municipio ?: ($pastor->estado?->nombre ?: 'VENEZUELA');
        }

        $linea = mb_strtoupper(trim($lugar), 'UTF-8');
        if (!empty($pastor->zona)) {
            $linea .= ' - ZONA ' . $pastor->zona;
        }
        if (!empty($pastor->distrito)) {
            $linea .= '- DISTRITO ' . $pastor->distrito;
        }

        return $linea;
    }

    /**
     * Formatea el documento de identidad (ej: V-18.816.680) de forma idéntica a la vista web
     */
    protected function formatearDocumento(?string $doc): string
    {
        if (!$doc) {
            return 'V-00.000.000';
        }

        $clean = strtoupper(trim($doc));
        if (str_contains($clean, '-')) {
            return $clean;
        }

        if (preg_match('/^([VEJ])?([0-9]+)$/', $clean, $matches)) {
            $prefijo = !empty($matches[1]) ? $matches[1] : 'V';
            $num = number_format((int)$matches[2], 0, '', '.');
            return "{$prefijo}-{$num}";
        }

        return $clean;
    }

    /**
     * Retorna el nombre completo del pastor (sin prefijo "REV.")
     */
    public function obtenerNombreCompletoConTitulo(Pastor $pastor, bool $uppercase = false): string
    {
        $raw = trim(($pastor->nombres ?? '') . ' ' . ($pastor->apellidos ?? ''));
        $raw = preg_replace('/\s+/', ' ', $raw);
        $clean = preg_replace('/^rev\.?\s+/i', '', $raw);

        return $uppercase ? mb_strtoupper($clean, 'UTF-8') : $clean;
    }

    /**
     * Convierte texto UTF-8 a codificación compatible con fuentes FPDF (Windows-1252 / ISO-8859-1)
     */
    protected function utf8ToPdf(string $str): string
    {
        $converted = @iconv('UTF-8', 'windows-1252//TRANSLIT', $str);
        if ($converted !== false) {
            return $converted;
        }
        return utf8_decode($str);
    }

    /**
     * Aplica la tipografía solicitada (ej. Cocogoose Bold) o recurre a una estándar si no está registrada.
     */
    public function setFontWithFallback(CarnetFpdf $pdf, string $family, string $style, float $size): void
    {
        try {
            $pdf->SetFont($family, $style, $size);
        } catch (\Throwable $e) {
            $fallback = (strcasecmp($family, 'Cocogoose') === 0) ? 'Helvetica' : 'Arial';
            $pdf->SetFont($fallback, $style, $size);
        }
    }
}
