<?php

require __DIR__ . '/../vendor/autoload.php';

use BaconQrCode\Encoder\Encoder;
use BaconQrCode\Common\ErrorCorrectionLevel;

try {
    $qr = Encoder::encode('https://mmmvenezuela.org/validar-credencial/12345', ErrorCorrectionLevel::M());
    $matrix = $qr->getMatrix();
    echo "SUCCESS: Matrix width=" . $matrix->getWidth() . " height=" . $matrix->getHeight() . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
