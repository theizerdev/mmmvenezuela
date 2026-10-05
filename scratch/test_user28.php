<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::withoutTenant()->find(16);
$user->zona_2 = '10'; // Asignamos zona 10 en memoria SIN tocar distrito_2 (distrito_2 sigue null)
auth()->login($user);

echo "Usuario simulado con 2 zonas: {$user->name}\n";
echo "Zonas: " . json_encode($user->getZonasList()) . "\n";
echo "Distrito 1: {$user->distrito} | Distrito 2: " . ($user->distrito_2 ?? 'NULL') . "\n";

$pastoresVisibles = App\Models\Pastor::count();
$esperados = App\Models\Pastor::withoutTenant()->whereIn('zona', ['9', '10'])->count();
echo "Pastores visibles para usuario con 2 zonas: {$pastoresVisibles}\n";
echo "Esperados en BD (Zona 9 + Zona 10): {$esperados}\n";
if ($pastoresVisibles === $esperados) {
    echo "¡PERFECTO! Muestra correctamente los pastores de AMBAS zonas aunque distrito_2 sea null.\n";
} else {
    echo "ERROR: No coinciden los pastores.\n";
}
