<?php
require __DIR__ . '/../../../../../../../../laragon/www/mmmvenezuela/vendor/autoload.php';
$app = require_once __DIR__ . '/../../../../../../../../laragon/www/mmmvenezuela/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$controller = new App\Http\Controllers\Public\PastorRegistroPublicoController();
$res = $controller->verificarCedula('21.082.021');
$data = json_decode($res->getContent(), true);
echo "Existe: " . ($data['existe'] ? 'true' : 'false') . "\n";
echo "Pastor ID: " . ($data['pastor_id'] ?? 'null') . "\n";
echo "Nombre: " . ($data['nombre'] ?? 'null') . "\n";
echo "Documento encontrado: " . ($data['pastor']['documento'] ?? 'null') . "\n";