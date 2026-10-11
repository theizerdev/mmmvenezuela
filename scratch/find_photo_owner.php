<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$files = glob(public_path('storage/pastores/*'));
echo "Files in public/storage/pastores: " . count($files) . PHP_EOL;
foreach ($files as $f) {
    $base = basename($f);
    echo "File: $base" . PHP_EOL;
    $p = App\Models\Pastor::withoutTenant()->where('foto', 'like', "%$base%")->first();
    if ($p) {
        echo " -> Pertenece a: {$p->nombres} {$p->apellidos} (CI: {$p->documento})\n";
    } else {
        echo " -> No asignado a ningún pastor\n";
    }
}
