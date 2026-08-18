<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

Schema::dropIfExists('iglesia_pastor');
Schema::dropIfExists('iglesias');
echo "Dropped iglesias tables\n";
