<?php

namespace Database\Seeders;

use App\Models\Empresa;
use App\Models\Sucursal;
use Illuminate\Database\Seeder;

class EmpresaSucursalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Crear o actualizar la empresa principal MMM Venezuela con ID 1
        $empresa = Empresa::updateOrCreate([
            'id' => 1,
        ], [
            'razon_social' => 'IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA MOVIMIENTO MISIONERO MUNDIAL',
            'documento' => 'J-301874463',
            'direccion' => 'Av. Sucre de Catia, cruce Calle El Carmen, Local 5B, Caracas',
            'telefono' => '0212-8600173',
            'email' => 'contacto@mmmvenezuela.org',
            'status' => true,
        ]);

        // 2. Crear o actualizar la sucursal principal Sede Central Catia con ID 1
        Sucursal::updateOrCreate([
            'id' => 1,
        ], [
            'empresa_id' => $empresa->id,
            'nombre' => 'Sede Central Catia',
            'telefono' => '0212-8600173',
            'direccion' => 'Av. Sucre de Catia, cruce Calle El Carmen, Local 5B, Caracas',
            'status' => true,
        ]);
    }
}
