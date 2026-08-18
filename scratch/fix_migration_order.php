<?php

$dir = 'database/migrations';

$renames = [
    '2026_08_18_100001_create_iglesias_table.php' => '2026_08_18_150001_create_iglesias_table.php',
    '2026_08_18_100000000_create_iglesia_pastor_table.php' => '2026_08_18_150002_create_iglesia_pastor_table.php',
    '2026_08_18_100000001_add_anios_activa_to_iglesias_table.php' => '2026_08_18_150003_add_anios_activa_to_iglesias_table.php',
    '2026_08_18_100000001_add_tipo_local_id_to_iglesias_table.php' => '2026_08_18_150004_add_tipo_local_id_to_iglesias_table.php',
    '2026_08_18_100100000_add_new_fields_to_iglesias_table.php' => '2026_08_18_150005_add_new_fields_to_iglesias_table.php',
    '2026_08_18_100115048_change_medio_comunicacion_to_text_in_iglesias_table.php' => '2026_08_18_150006_change_medio_comunicacion_to_text_in_iglesias_table.php',
    '2026_08_18_100211104_add_empresa_sucursal_to_iglesias_table.php' => '2026_08_18_150007_add_empresa_sucursal_to_iglesias_table.php',
];

foreach ($renames as $old => $new) {
    if (file_exists("$dir/$old")) {
        echo "Renaming $old -> $new\n";
        rename("$dir/$old", "$dir/$new");
    }
}
