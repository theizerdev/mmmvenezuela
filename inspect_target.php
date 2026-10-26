<?php
$f2 = 'C:/Users/theig/.gemini/antigravity/brain/b9809f93-b41c-4e84-a2bd-7395b40576d9/.user_uploaded/media_1793043360835_322701c7.png';
$im = imagecreatefrompng($f2);
$w = imagesx($im);
$h = imagesy($im);

// Find bands of dark pixels on the right side (x: 400 to 900)
$rowDark = [];
for ($y = 0; $y < $h; $y++) {
    $dark = 0;
    for ($x = 420; $x < 900; $x++) {
        $rgb = imagecolorat($im, $x, $y);
        $r = ($rgb >> 16) & 0xFF;
        $g = ($rgb >> 8) & 0xFF;
        $b = $rgb & 0xFF;
        if ($r < 80 && $g < 80 && $b < 80) {
            $dark++;
        }
    }
    $rowDark[$y] = $dark;
}

$bands = [];
$inBand = false;
$start = 0;
for ($y = 0; $y < $h; $y++) {
    if ($rowDark[$y] > 5) {
        if (!$inBand) {
            $inBand = true;
            $start = $y;
        }
    } else {
        if ($inBand) {
            $inBand = false;
            $bands[] = ['start' => $start, 'end' => $y - 1, 'height' => $y - $start];
        }
    }
}

echo "Image 2 bands ({$w}x{$h}):\n";
foreach ($bands as $idx => $b) {
    $mid = ($b['start'] + $b['end']) / 2;
    $pctY = round($mid / $h * 100, 1);
    $y720 = round($mid * 440 / $h, 1);
    echo "Band {$idx}: Y={$b['start']}..{$b['end']} (mid={$mid}, {$pctY}%) -> in 720x440: {$y720}px (height: {$b['height']}px)\n";
}
