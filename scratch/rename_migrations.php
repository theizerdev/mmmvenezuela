<?php

$dir = 'database/migrations';
$files = scandir($dir);

foreach ($files as $file) {
    if (str_starts_with($file, '20260_')) {
        $newName = str_replace('20260_08_18_', '2026_08_18_100', $file);
        echo "Renaming $file -> $newName\n";
        rename("$dir/$file", "$dir/$newName");
    }
}
