<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$all = App\Models\Pastor::withoutTenant()->get();
$grouped = $all->groupBy(fn($p) => preg_replace('/\D/', '', $p->documento));
$hasDupes = false;
foreach ($grouped as $num => $items) {
    if (strlen($num) >= 4 && count($items) > 1) {
        $hasDupes = true;
        echo "Duplicados para '{$num}':\n";
        foreach ($items as $item) {
            echo "  - ID: {$item->id}, Doc: '{$item->documento}', Nombre: '{$item->nombre_completo}', ConyugeID: {$item->conyuge_id}\n";
        }
    }
}
if (!$hasDupes) {
    echo "No hay duplicados encontrados en la base de datos.\n";
}
