<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = \App\Models\Pastor::where('documento', 'like', '%12209160%')->first();
if ($p) {
    echo "foto_url raw: " . ($p->foto_url ?? 'null') . "\n";
    echo "url(foto_url): " . url($p->foto_url) . "\n";
    echo "file exists in public? " . (file_exists(public_path($p->foto_url)) ? 'YES' : 'NO') . "\n";
    echo "storage path: " . public_path($p->foto_url) . "\n";
}
