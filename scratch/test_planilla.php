<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Pastor;
use App\Services\PlanillaService;
use Codedge\Fpdf\Fpdf\Fpdf;

$pastor = Pastor::first();
if ($pastor) {
    echo "Testing Planilla PDF generation for pastor: {$pastor->nombres} {$pastor->apellidos}\n";
    $service = new PlanillaService();
    $fpdf = new Fpdf();
    $service->generarPdfParaPastor($pastor, $fpdf);
    echo "PDF generated successfully, size: " . strlen($fpdf->Output('S')) . " bytes\n";
} else {
    echo "No pastores in DB\n";
}
