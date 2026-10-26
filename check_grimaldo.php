<?php
$img = imagecreatefrompng('public/pastores/pastor_14934619110002_1793029730.png');
$corner = imagecolorat($img, 10, 10);
$a = ($corner >> 24) & 0x7F;
echo "Top-left (10,10): Alpha={$a}\n";
$midLeft = imagecolorat($img, 10, 100);
$aMid = ($midLeft >> 24) & 0x7F;
echo "Mid-left (10,100): Alpha={$aMid}\n";
$midRight = imagecolorat($img, 390, 100);
$aRight = ($midRight >> 24) & 0x7F;
echo "Mid-right (390,100): Alpha={$aRight}\n";

