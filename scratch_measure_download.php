<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Let's test the face / skin pixel location in Pastor 7 (1200x1200)
$p7 = App\Models\Pastor::find(7);
$path7 = public_path('pastores/' . $p7->foto);
$im = imagecreatefromjpeg($path7);
$w = imagesx($im); $h = imagesy($im);
echo "Pastor 7 (Samuel) {$w}x{$h}:\n";

// Sample vertical line at x = 600 (center)
for ($y = 0; $y < $h; $y += 50) {
    $rgb = imagecolorat($im, 600, $y);
    $r = ($rgb >> 16) & 0xFF; $g = ($rgb >> 8) & 0xFF; $b = $rgb & 0xFF;
    echo "y=$y: rgb($r,$g,$b)\n";
}

