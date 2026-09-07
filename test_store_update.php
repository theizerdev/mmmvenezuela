<?php
require __DIR__ . '/../../../../../../../../laragon/www/mmmvenezuela/vendor/autoload.php';
$app = require_once __DIR__ . '/../../../../../../../../laragon/www/mmmvenezuela/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Pastor;
use App\Http\Controllers\Public\PastorRegistroPublicoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();

try {
    $countBefore = Pastor::withoutTenant()->count();
    $pastor12Before = Pastor::withoutTenant()->find(12);

    echo "Total pastores antes: {$countBefore}\n";
    echo "Pastor 12 antes - Nombres: '{$pastor12Before->nombres}', Teléfono: '{$pastor12Before->telefono_tlf}'\n";

    // Simular envío de formulario SIN pastor_id (solo con la cédula 21082021)
    $request = new Request([
        'pastor_id' => '',
        'nombres' => 'Dulce Sarai',
        'apellidos' => 'Nuñez Editada',
        'tipo_documento' => 'V',
        'numero_documento' => '21082021',
        'documento' => 'V-21082021',
        'nivel_ministerial' => 'Ministro Ordenado',
        'telefono_tlf' => '04121234567',
        'estado_civil' => 'Casado(a)',
        'tiene_extension' => false,
        'extension_rol_pastor' => 'asistente',
    ]);

    $controller = new PastorRegistroPublicoController();
    $response = $controller->store($request);

    $countAfter = Pastor::withoutTenant()->count();
    $pastor12After = Pastor::withoutTenant()->find(12);

    echo "Total pastores después: {$countAfter}\n";
    echo "Pastor 12 después - Nombres: '{$pastor12After->nombres}', Apellidos: '{$pastor12After->apellidos}', Teléfono: '{$pastor12After->telefono_tlf}'\n";

    if ($countAfter === $countBefore) {
        echo "ÉXITO: NO se crearon registros duplicados. Se actualizó la ficha existente.\n";
    } else {
        echo "ERROR: Se crearon registros nuevos! Antes: {$countBefore}, Después: {$countAfter}\n";
    }

    $flash = session('success');
    echo "Mensaje Flash: " . ($flash['mensaje'] ?? 'Sin mensaje') . "\n";

} finally {
    // Siempre hacer rollback para no alterar datos de prueba en la base de datos
    DB::rollBack();
    echo "Transacción revertida (rollback completado con éxito).\n";
}
