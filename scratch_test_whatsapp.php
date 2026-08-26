<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$empresa = App\Models\Empresa::find(1);
$service = new App\Services\WhatsAppService($empresa);

echo "Testing WhatsAppService for Empresa: " . $empresa->razon_social . "\n";
echo "Instance: " . $service->getInstanceName() . "\n";

$status = $service->getStatus();
echo "Status Result:\n";
print_r($status);
