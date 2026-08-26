<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$empresa = App\Models\Empresa::find(1);
$service = new App\Services\WhatsAppService($empresa);

echo "--- BEFORE SENDING ---\n";
print_r($service->getQueueStats());

echo "\n--- SENDING TEST MESSAGE ---\n";
$res = $service->sendText('584241703465', 'Hola, prueba de límite diario: {{random}}', ['random' => rand(1000, 9999)]);
echo "Result: " . json_encode($res) . "\n";

echo "\n--- AFTER SENDING ---\n";
print_r($service->getQueueStats());

$lastMsg = App\Models\WhatsAppMessage::latest()->first();
echo "\n--- RECORDED MESSAGE IN DB ---\n";
print_r($lastMsg?->toArray());
