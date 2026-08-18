<?php

namespace Database\Seeders;

use App\Models\Estado;
use App\Models\Pais;
use Illuminate\Database\Seeder;

class EstadoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $venezuela = Pais::where('codigo_iso2', 'VE')->first();

        if (! $venezuela) {
            $this->command->error('❌ No se encontró el país Venezuela (VE) en la base de datos.');

            return;
        }

        $estadosVenezuela = [
            [
                'nombre' => 'Amazonas',
                'codigo' => 'VE-Z',
                'capital' => 'Puerto Ayacucho',
                'latitud' => 5.6639,
                'longitud' => -67.5858,
                'activo' => true,
            ],
            [
                'nombre' => 'Anzoátegui',
                'codigo' => 'VE-B',
                'capital' => 'Barcelona',
                'latitud' => 10.1333,
                'longitud' => -64.7000,
                'activo' => true,
            ],
            [
                'nombre' => 'Apure',
                'codigo' => 'VE-C',
                'capital' => 'San Fernando de Apure',
                'latitud' => 7.8878,
                'longitud' => -67.4724,
                'activo' => true,
            ],
            [
                'nombre' => 'Aragua',
                'codigo' => 'VE-D',
                'capital' => 'Maracay',
                'latitud' => 10.2354,
                'longitud' => -67.5911,
                'activo' => true,
            ],
            [
                'nombre' => 'Barinas',
                'codigo' => 'VE-E',
                'capital' => 'Barinas',
                'latitud' => 8.6226,
                'longitud' => -70.2075,
                'activo' => true,
            ],
            [
                'nombre' => 'Bolívar',
                'codigo' => 'VE-F',
                'capital' => 'Ciudad Bolívar',
                'latitud' => 8.1292,
                'longitud' => -63.5408,
                'activo' => true,
            ],
            [
                'nombre' => 'Carabobo',
                'codigo' => 'VE-G',
                'capital' => 'Valencia',
                'latitud' => 10.1620,
                'longitud' => -68.0077,
                'activo' => true,
            ],
            [
                'nombre' => 'Cojedes',
                'codigo' => 'VE-H',
                'capital' => 'San Carlos',
                'latitud' => 9.6612,
                'longitud' => -68.5827,
                'activo' => true,
            ],
            [
                'nombre' => 'Delta Amacuro',
                'codigo' => 'VE-Y',
                'capital' => 'Tucupita',
                'latitud' => 9.0611,
                'longitud' => -62.0494,
                'activo' => true,
            ],
            [
                'nombre' => 'Distrito Capital',
                'codigo' => 'VE-A',
                'capital' => 'Caracas',
                'latitud' => 10.5000,
                'longitud' => -66.9167,
                'activo' => true,
            ],
            [
                'nombre' => 'Falcón',
                'codigo' => 'VE-I',
                'capital' => 'Coro',
                'latitud' => 11.4045,
                'longitud' => -69.6734,
                'activo' => true,
            ],
            [
                'nombre' => 'Guárico',
                'codigo' => 'VE-J',
                'capital' => 'San Juan de los Morros',
                'latitud' => 9.9115,
                'longitud' => -67.3538,
                'activo' => true,
            ],
            [
                'nombre' => 'Lara',
                'codigo' => 'VE-K',
                'capital' => 'Barquisimeto',
                'latitud' => 10.0647,
                'longitud' => -69.3570,
                'activo' => true,
            ],
            [
                'nombre' => 'Mérida',
                'codigo' => 'VE-L',
                'capital' => 'Mérida',
                'latitud' => 8.5983,
                'longitud' => -71.1449,
                'activo' => true,
            ],
            [
                'nombre' => 'Miranda',
                'codigo' => 'VE-M',
                'capital' => 'Los Teques',
                'latitud' => 10.3444,
                'longitud' => -67.0433,
                'activo' => true,
            ],
            [
                'nombre' => 'Monagas',
                'codigo' => 'VE-N',
                'capital' => 'Maturín',
                'latitud' => 9.7457,
                'longitud' => -63.1832,
                'activo' => true,
            ],
            [
                'nombre' => 'Nueva Esparta',
                'codigo' => 'VE-O',
                'capital' => 'La Asunción',
                'latitud' => 11.0333,
                'longitud' => -63.8667,
                'activo' => true,
            ],
            [
                'nombre' => 'Portuguesa',
                'codigo' => 'VE-P',
                'capital' => 'Guanare',
                'latitud' => 9.0418,
                'longitud' => -69.7421,
                'activo' => true,
            ],
            [
                'nombre' => 'Sucre',
                'codigo' => 'VE-R',
                'capital' => 'Cumaná',
                'latitud' => 10.4537,
                'longitud' => -64.1826,
                'activo' => true,
            ],
            [
                'nombre' => 'Táchira',
                'codigo' => 'VE-S',
                'capital' => 'San Cristóbal',
                'latitud' => 7.7669,
                'longitud' => -72.2250,
                'activo' => true,
            ],
            [
                'nombre' => 'Trujillo',
                'codigo' => 'VE-T',
                'capital' => 'Trujillo',
                'latitud' => 9.3667,
                'longitud' => -70.4333,
                'activo' => true,
            ],
            [
                'nombre' => 'La Guaira',
                'codigo' => 'VE-W',
                'capital' => 'La Guaira',
                'latitud' => 10.5983,
                'longitud' => -66.9342,
                'activo' => true,
            ],
            [
                'nombre' => 'Yaracuy',
                'codigo' => 'VE-U',
                'capital' => 'San Felipe',
                'latitud' => 10.3399,
                'longitud' => -68.7425,
                'activo' => true,
            ],
            [
                'nombre' => 'Zulia',
                'codigo' => 'VE-V',
                'capital' => 'Maracaibo',
                'latitud' => 10.6544,
                'longitud' => -71.6402,
                'activo' => true,
            ],
        ];

        foreach ($estadosVenezuela as $estado) {
            Estado::updateOrCreate(
                [
                    'pais_id' => $venezuela->id,
                    'nombre' => $estado['nombre'],
                ],
                $estado
            );
        }

        $this->command->info('✅ Estados de Venezuela procesados exitosamente.');
        $this->command->info('📊 Total de estados procesados: '.count($estadosVenezuela));
    }
}
