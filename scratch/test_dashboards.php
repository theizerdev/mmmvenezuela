<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = App\Models\User::first();
auth()->login($user);

echo "Simulando Dashboard Ministerial...\n";
$dash = app(App\Http\Controllers\Admin\DashboardController::class)->index();
echo "Dashboard OK: " . get_class($dash) . "\n";
$reflector = new ReflectionClass($dash);
$prop = $reflector->getProperty('props');
$prop->setAccessible(true);
$dashProps = $prop->getValue($dash);
echo "Extensiones Stats en Dashboard:\n";
print_r($dashProps['extensionesStats']);

echo "\nSimulando Dashboard de Extensiones...\n";
$ext = app(App\Http\Controllers\Admin\ExtensionController::class)->dashboard(request());
echo "Dashboard Extensiones OK: " . get_class($ext) . "\n";
$extProps = $prop->getValue($ext);
echo "Stats en Extensiones Dashboard:\n";
echo "Total Miembros General: " . $extProps['stats']['total_miembros_general'] . "\n";
echo "Miembros Activos: " . $extProps['stats']['miembros_activos'] . " (" . $extProps['stats']['porcentaje_activos'] . "%)\n";
echo "Miembros Probantes: " . $extProps['stats']['miembros_probantes'] . " (" . $extProps['stats']['porcentaje_probantes'] . "%)\n";
echo "Iglesias / Extensiones: " . $extProps['stats']['total_extensiones'] . " (" . $extProps['stats']['porcentaje_iglesias'] . "%)\n";
echo "Campos Blancos: " . $extProps['stats']['total_campos_blancos'] . " (" . $extProps['stats']['porcentaje_campos_blancos'] . "%)\n";
echo "Total Congregaciones: " . $extProps['stats']['total_congregaciones'] . "\n";

$total = App\Models\Iglesia::withoutGlobalScopes()->count();
$conCoords = App\Models\Iglesia::withoutGlobalScopes()->whereNotNull('latitud')->whereNotNull('longitud')->where('latitud', '!=', '')->where('longitud', '!=', '')->count();
echo "\n--- Análisis de Coordenadas Geográficas ---\n";
echo "Total Iglesias en DB: {$total}\n";
echo "Con lat/lng válidos: {$conCoords}\n";
echo "Sin coordenadas (no aparecen en el mapa): " . ($total - $conCoords) . "\n";

$porEstado = App\Models\Iglesia::withoutGlobalScopes()
    ->leftJoin('estados', 'iglesias.estado_id', '=', 'estados.id')
    ->selectRaw("estados.nombre as estado, count(iglesias.id) as total, sum(case when iglesias.latitud is not null and iglesias.latitud != '' then 1 else 0 end) as con_coords")
    ->groupBy('estados.nombre')
    ->orderBy('total', 'desc')
    ->get();

echo "\nSimulando Explorador Geográfico Nacional (Mapa)...\n";
$mapaRes = app(App\Http\Controllers\Admin\ExtensionController::class)->mapa(request());
echo "Mapa Response OK: " . get_class($mapaRes) . "\n";
$mapaProps = $prop->getValue($mapaRes);
echo "Total Pines para Mapa: " . count($mapaProps['pines']) . "\n";
echo "Total Estados: " . count($mapaProps['estados']) . "\n";
echo "Total Zonas: " . count($mapaProps['zonas']) . "\n";
if (count($mapaProps['pines']) > 0) {
    $primerPin = $mapaProps['pines'][0];
    echo "Primer Pin: {$primerPin['nombre']} (Zona {$primerPin['zona']}, Dist. {$primerPin['distrito']}, Pastor: {$primerPin['pastor']})\n";
}


