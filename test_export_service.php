<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$service = new App\Services\PastorExcelExportService();

echo "Testing export with Zona 1...\n";
$responseZona1 = $service->export(['zona' => '1']);
ob_start();
$responseZona1->sendContent();
$content1 = ob_get_clean();
echo "Zona 1 exported successfully! File size: " . strlen($content1) . " bytes\n";

echo "Testing export with All Zonas...\n";
$responseAll = $service->export([]);
ob_start();
$responseAll->sendContent();
$contentAll = ob_get_clean();
echo "All zones exported successfully! File size: " . strlen($contentAll) . " bytes\n";
