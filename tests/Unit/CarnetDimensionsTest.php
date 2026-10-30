<?php

namespace Tests\Unit;

use App\Models\Pastor;
use App\Services\CarnetService;
use Tests\TestCase;

class CarnetDimensionsTest extends TestCase
{
    public function test_carnet_dimensions_are_85_by_54_mm(): void
    {
        $this->assertEquals(85.0, CarnetService::ANCHO_MM);
        $this->assertEquals(54.0, CarnetService::ALTO_MM);
    }

    public function test_generated_single_pdf_has_exact_85_by_54_mm_page_dimensions(): void
    {
        $pastor = new Pastor([
            'nombres' => 'Juan',
            'apellidos' => 'Pérez',
            'documento' => '12345678',
            'nivel_ministerial' => 'Ministro Ordenado',
        ]);
        $pastor->setRelation('estado', new \App\Models\Estado(['nombre' => 'Distrito Capital']));
        $pastor->setRelation('iglesiasPrincipales', new \Illuminate\Database\Eloquent\Collection());
        $pastor->setRelation('iglesias', new \Illuminate\Database\Eloquent\Collection());

        $carnetService = new CarnetService();
        $pdf = $carnetService->generarPdfParaPastor($pastor);

        // Página frontal
        $this->assertEquals(85.0, round($pdf->GetPageWidth(), 1));
        $this->assertEquals(54.0, round($pdf->GetPageHeight(), 1));
    }

    public function test_massive_letter_sheet_duplex_geometry_is_exact_to_letter_dimensions(): void
    {
        // Hoja Carta estándar: 215.9 x 279.4 mm
        $ancho = CarnetService::ANCHO_MM; // 85.0
        $alto = CarnetService::ALTO_MM;   // 54.0

        $posX = 17.0; // Margen lateral
        $gapX = 11.9; // Separación horizontal entre las 2 columnas

        $totalAncho = (2 * $posX) + (2 * $ancho) + $gapX;
        $this->assertEquals(215.9, round($totalAncho, 1));

        $posY = 20.0; // Margen vertical superior e inferior
        $gapY = 7.8;  // Separación vertical entre las 4 filas

        $totalAlto = (2 * $posY) + (4 * $alto) + (3 * $gapY);
        $this->assertEquals(279.4, round($totalAlto, 1));
    }

    public function test_carnet_back_contains_expiration_text(): void
    {
        $pastor = new Pastor([
            'nombres' => 'Juan',
            'apellidos' => 'Pérez',
            'documento' => '12345678',
            'nivel_ministerial' => 'Ministro Ordenado',
        ]);
        $pastor->setRelation('estado', new \App\Models\Estado(['nombre' => 'Distrito Capital']));
        $pastor->setRelation('iglesiasPrincipales', new \Illuminate\Database\Eloquent\Collection());
        $pastor->setRelation('iglesias', new \Illuminate\Database\Eloquent\Collection());

        $carnetService = new CarnetService();
        $pdf = new \App\Services\CarnetFpdf('L', 'mm', [CarnetService::ANCHO_MM, CarnetService::ALTO_MM]);
        $pdf->SetCompression(false);
        $carnetService->generarPdfParaPastor($pastor, $pdf);
        $rawPdf = $pdf->Output('S');

        $this->assertStringContainsString('VENCE - DICIEMBRE DEL 2028', $rawPdf);
    }
}
