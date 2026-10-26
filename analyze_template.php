<?php
$f = 'public/image/Credencial-atras.png';
$img = imagecreatefrompng($f);
echo "atras size: " . imagesx($img) . "x" . imagesy($img) . "\n";

