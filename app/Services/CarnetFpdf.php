<?php

namespace App\Services;

use Codedge\Fpdf\Fpdf\Fpdf;

class CarnetFpdf extends Fpdf
{
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
}
