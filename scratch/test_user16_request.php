<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(16);
auth()->login($user);

$request = Illuminate\Http\Request::create('/admin/pastores', 'GET');
$request->setUserResolver(fn() => $user);
$controller = app(App\Http\Controllers\Admin\PastorController::class);
$response = $controller->index($request);
$propData = $response->toResponse($request)->original['page']['props'];
echo "Pastores Total: " . ($propData['pastores']['total'] ?? 'N/A') . "\n";
echo "Pastores Stats: " . json_encode($propData['stats']) . "\n";

$extRequest = Illuminate\Http\Request::create('/admin/extensiones', 'GET');
$extRequest->setUserResolver(fn() => $user);
$extController = app(App\Http\Controllers\Admin\ExtensionController::class);
$extResponse = $extController->index($extRequest);
$extPropData = $extResponse->toResponse($extRequest)->original['page']['props'];
echo "Extensiones Total: " . ($extPropData['extensiones']['total'] ?? 'N/A') . "\n";
echo "Extensiones Stats: " . json_encode($extPropData['stats']) . "\n";
