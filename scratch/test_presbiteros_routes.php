<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function testUserRoutes($userId) {
    auth()->logout();
    $user = App\Models\User::withoutTenant()->find($userId);
    echo "====================================================\n";
    echo "PROBANDO USUARIO ID {$user->id}: {$user->name} ({$user->email})\n";
    echo "Roles: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
    echo "Zonas: " . json_encode($user->getZonasList()) . " | Distritos: " . json_encode($user->getDistritosList()) . "\n";
    echo "Status: {$user->status} | MustChangePassword: " . ($user->must_change_password ? 'SÍ' : 'NO') . "\n";
    auth()->login($user);

    $routes = [
        ['GET', '/dashboard', App\Http\Controllers\Admin\DashboardController::class, 'index'],
        ['GET', '/admin/pastores', App\Http\Controllers\Admin\PastorController::class, 'index'],
        ['GET', '/admin/extensiones', App\Http\Controllers\Admin\ExtensionController::class, 'index'],
        ['GET', '/admin/extensiones/dashboard', App\Http\Controllers\Admin\ExtensionController::class, 'dashboard'],
    ];

    foreach ($routes as [$method, $uri, $controllerClass, $action]) {
        try {
            $request = Illuminate\Http\Request::create($uri, $method);
            $request->setUserResolver(fn() => $user);
            $controller = app($controllerClass);
            $response = $controller->$action($request);
            $rendered = $response->toResponse($request);
            $status = $rendered->getStatusCode();
            $props = $rendered->original['page']['props'] ?? [];
            
            $extra = '';
            if (isset($props['pastores']['total'])) {
                $extra = " -> Total pastores: " . $props['pastores']['total'];
            } elseif (isset($props['extensiones']['total'])) {
                $extra = " -> Total extensiones: " . $props['extensiones']['total'];
            } elseif (isset($props['stats']['total_extensiones'])) {
                $extra = " -> Total extensiones (dashboard): " . $props['stats']['total_extensiones'];
            } elseif (isset($props['totalPastores'])) {
                $extra = " -> Total pastores (dashboard): " . $props['totalPastores'];
            }
            
            echo "  ✓ {$method} {$uri} => HTTP {$status}{$extra}\n";
        } catch (\Throwable $e) {
            echo "  ✗ {$method} {$uri} => ERROR: " . $e->getMessage() . "\n";
        }
    }
}

testUserRoutes(16); // Humberto Diaz (Zona 9)
testUserRoutes(28); // Reinaldo Tova (Zona 21 y 16)
testUserRoutes(4);  // Maikel Paez (Zona 1)
