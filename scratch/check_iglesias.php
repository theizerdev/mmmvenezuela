<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "tipo_locales exists: " . (Schema::hasTable('tipo_locales') ? 'YES' : 'NO') . "\n";
echo "iglesias exists: " . (Schema::hasTable('iglesias') ? 'YES' : 'NO') . "\n";
