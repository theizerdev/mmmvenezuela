<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$pastores = App\Models\Pastor::withoutTenant()->where('zona', '9')->get();
echo "Total pastores with zona '9': " . $pastores->count() . PHP_EOL;
foreach ($pastores as $p) {
    echo "ID: {$p->id} | {$p->nombre_completo} | Zona: '{$p->zona}' | Dist: '{$p->distrito}' | Status: {$p->status} | Empresa: {$p->empresa_id} | Sucursal: {$p->sucursal_id}\n";
}

$iglesias = App\Models\Iglesia::withoutTenant()->where('zona', '9')->get();
echo "\nTotal iglesias with zona '9': " . $iglesias->count() . PHP_EOL;
foreach ($iglesias as $i) {
    echo "ID: {$i->id} | {$i->nombre} | Zona: '{$i->zona}' | Dist: '{$i->distrito}' | Activa: {$i->activa} | Empresa: {$i->empresa_id} | Sucursal: {$i->sucursal_id}\n";
}
