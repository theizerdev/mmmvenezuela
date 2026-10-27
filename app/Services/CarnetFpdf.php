<?php

namespace App\Services;

use Codedge\Fpdf\Fpdf\Fpdf;

class CarnetFpdf extends Fpdf
{
    public function __construct(string $orientation = 'P', string $unit = 'mm', mixed $size = 'A4')
    {
        parent::__construct($orientation, $unit, $size);

        $fontDir = public_path('fonts');
        if (file_exists($fontDir . '/cocogoose-bold.php')) {
            $this->AddFont('Cocogoose', 'B', 'cocogoose-bold.php', $fontDir);
        }
        if (file_exists($fontDir . '/cocogoose-regular.php')) {
            $this->AddFont('Cocogoose', '', 'cocogoose-regular.php', $fontDir);
        }
        if (file_exists($fontDir . '/Cocogoose-Pro-Italic-trial.php')) {
            $this->AddFont('Cocogoose', 'I', 'Cocogoose-Pro-Italic-trial.php', $fontDir);
        }
    }
    /**
     * Dibuja un polígono de N puntos en FPDF
     * @param array $points arreglo de coordenadas [x0, y0, x1, y1, x2, y2, ...]
     * @param string $style 'F' (relleno), 'D' (borde), 'FD' o 'DF' (ambos)
     */
    public function Polygon(array $points, string $style = 'F'): void
    {
        $style = strtoupper($style);
        $op = ($style === 'F') ? 'f' : (($style === 'B' || $style === 'FD' || $style === 'DF') ? 'b' : 's');
        $h = $this->h;
        $k = $this->k;

        if (count($points) < 6) {
            return;
        }

        $out = sprintf('%.2F %.2F m', $points[0] * $k, ($h - $points[1]) * $k);
        for ($i = 2; $i < count($points); $i += 2) {
            $out .= sprintf(' %.2F %.2F l', $points[$i] * $k, ($h - $points[$i + 1]) * $k);
        }
        $out .= ' h ' . $op;
        $this->_out($out);
    }

    /**
     * Dibuja una elipse o círculo en FPDF
     */
    public function Ellipse(float $x, float $y, float $rx, float $ry, string $style = 'F'): void
    {
        $style = strtoupper($style);
        $op = ($style === 'F') ? 'f' : (($style === 'B' || $style === 'FD' || $style === 'DF') ? 'b' : 's');

        $lx = 4 / 3 * (M_SQRT2 - 1) * $rx;
        $ly = 4 / 3 * (M_SQRT2 - 1) * $ry;

        $k = $this->k;
        $h = $this->h;

        $cx = $x * $k;
        $cy = ($h - $y) * $k;
        $rx_k = $rx * $k;
        $ry_k = $ry * $k;
        $lx_k = $lx * $k;
        $ly_k = $ly * $k;

        $this->_out(sprintf('%.2F %.2F m', $cx + $rx_k, $cy));
        $this->_out(sprintf('%.2F %.2F %.2F %.2F %.2F %.2F c', $cx + $rx_k, $cy + $ly_k, $cx + $lx_k, $cy + $ry_k, $cx, $cy + $ry_k));
        $this->_out(sprintf('%.2F %.2F %.2F %.2F %.2F %.2F c', $cx - $lx_k, $cy + $ry_k, $cx - $rx_k, $cy + $ly_k, $cx - $rx_k, $cy));
        $this->_out(sprintf('%.2F %.2F %.2F %.2F %.2F %.2F c', $cx - $rx_k, $cy - $ly_k, $cx - $lx_k, $cy - $ry_k, $cx, $cy - $ry_k));
        $this->_out(sprintf('%.2F %.2F %.2F %.2F %.2F %.2F c', $cx + $lx_k, $cy - $ry_k, $cx + $rx_k, $cy - $ly_k, $cx + $rx_k, $cy));
        $this->_out($op);
    }

    /**
     * Dibuja un rectángulo con esquinas redondeadas en FPDF
     */
    public function RoundedRect(float $x, float $y, float $w, float $h, float $r, string $style = '', string $corners = '1234'): void
    {
        $k = $this->k;
        $hp = $this->h;
        $style = strtoupper($style);
        if ($style === 'F') {
            $op = 'f';
        } elseif ($style === 'FD' || $style === 'DF' || $style === 'B') {
            $op = 'B';
        } else {
            $op = 'S';
        }

        $myArc = 4 / 3 * (M_SQRT2 - 1);
        $this->_out(sprintf('%.2F %.2F m', ($x + $r) * $k, ($hp - $y) * $k));

        $xc = $x + $w - $r;
        $yc = $y + $r;
        $this->_out(sprintf('%.2F %.2F l', $xc * $k, ($hp - $y) * $k));
        if (strpos($corners, '2') === false) {
            $this->_out(sprintf('%.2F %.2F l', ($x + $w) * $k, ($hp - $y) * $k));
        } else {
            $this->_Arc($xc + $r * $myArc, $yc - $r, $xc + $r, $yc - $r * $myArc, $xc + $r, $yc);
        }

        $xc = $x + $w - $r;
        $yc = $y + $h - $r;
        $this->_out(sprintf('%.2F %.2F l', ($x + $w) * $k, ($hp - $yc) * $k));
        if (strpos($corners, '3') === false) {
            $this->_out(sprintf('%.2F %.2F l', ($x + $w) * $k, ($hp - ($y + $h)) * $k));
        } else {
            $this->_Arc($xc + $r, $yc + $r * $myArc, $xc + $r * $myArc, $yc + $r, $xc, $yc + $r);
        }

        $xc = $x + $r;
        $yc = $y + $h - $r;
        $this->_out(sprintf('%.2F %.2F l', $xc * $k, ($hp - ($y + $h)) * $k));
        if (strpos($corners, '4') === false) {
            $this->_out(sprintf('%.2F %.2F l', $x * $k, ($hp - ($y + $h)) * $k));
        } else {
            $this->_Arc($xc - $r * $myArc, $yc + $r, $xc - $r, $yc + $r * $myArc, $xc - $r, $yc);
        }

        $xc = $x + $r;
        $yc = $y + $r;
        $this->_out(sprintf('%.2F %.2F l', $x * $k, ($hp - $yc) * $k));
        if (strpos($corners, '1') === false) {
            $this->_out(sprintf('%.2F %.2F l', $x * $k, ($hp - $y) * $k));
            $this->_out(sprintf('%.2F %.2F l', ($x + $r) * $k, ($hp - $y) * $k));
        } else {
            $this->_Arc($xc - $r, $yc - $r * $myArc, $xc - $r * $myArc, $yc - $r, $xc, $yc - $r);
        }
        $this->_out($op);
    }

    protected function _Arc(float $x1, float $y1, float $x2, float $y2, float $x3, float $y3): void
    {
        $h = $this->h;
        $k = $this->k;
        $this->_out(sprintf(
            '%.2F %.2F %.2F %.2F %.2F %.2F c ',
            $x1 * $k,
            ($h - $y1) * $k,
            $x2 * $k,
            ($h - $y2) * $k,
            $x3 * $k,
            ($h - $y3) * $k
        ));
    }
}
