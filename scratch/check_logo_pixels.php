0<?php
$im = imagecreatefrompng('public/icons/logo_mmm.png');
$rgbSample = [];
for ($x = 50; $x < imagesx($im); $x += 100) {
    for ($y = 50; $y < imagesy($im); $y += 50) {
        $rgb = imagecolorat($im, $x, $y);
        $colors = imagecolorsforindex($im, $rgb);
        if ($colors['alpha'] < 120) {
            $rgbSample[] = "r={$colors['red']}, g={$colors['green']}, b={$colors['blue']}, a={$colors['alpha']}";
        }
    }
}
echo "Sample pixels from logo_mmm.png:\n";
print_r(array_slice($rgbSample, 0, 10));
