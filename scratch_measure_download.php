<?php
$path = 'C:/Users/theig/Downloads/5e4cb263-de64-4e43-8cf7-2dc6e9beb396.jpg';
$im = imagecreatefromjpeg($path);
$w = imagesx($im); // 1063
$h = imagesy($im); // 650

// Let's inspect what is on the right side (text area)
// Scan around y=200 to 550, x=450 to 950
echo "Sampling text and colors on the right side of the card:\n";
// Let's check the orange pill "PASTOR"
$minX = $w; $maxX = 0; $minY = $h; $maxY = 0;
for ($y = 100; $y < 300; $y++) {
    for ($x = 400; $x < 1000; $x++) {
        $rgb = imagecolorat($im, $x, $y);
        $r = ($rgb >> 16) & 0xFF; $g = ($rgb >> 8) & 0xFF; $b = $rgb & 0xFF;
        if ($r > 200 && $g > 120 && $g < 190 && $b < 60) {
            $minX = min($minX, $x);
            $maxX = max($maxX, $x);
            $minY = min($minY, $y);
            $maxY = max($maxY, $y);
        }
    }
}
echo "Orange pill in downloaded image: X=$minX..$maxX (W=" . ($maxX - $minX) . "), Y=$minY..$maxY (H=" . ($maxY - $minY) . ")\n";
echo "Orange pill CenterX: " . (($minX + $maxX) / 2) . " (" . round((($minX + $maxX) / 2) / $w * 100, 2) . "%)\n";

// Let's check what is inside the photo frame of this downloaded image:
// Is there a person's photo inside the frame, or is it blank?
$rgbCenter = imagecolorat($im, (int)(($left + $right) / 2), (int)(($top + $bottom) / 2));
$rc = ($rgbCenter >> 16) & 0xFF; $gc = ($rgbCenter >> 8) & 0xFF; $bc = ($rgbCenter >> 8) & 0xFF;
echo "Center of photo frame pixel: rgb($rc, $gc, $bc)\n";
