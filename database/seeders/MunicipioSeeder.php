<?php

namespace Database\Seeders;

use App\Models\Estado;
use App\Models\Municipio;
use Illuminate\Database\Seeder;

class MunicipioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estados = Estado::pluck('id', 'nombre')->toArray();

        if (empty($estados)) {
            return;
        }

        $municipios = [
            // Distrito Capital
            'Distrito Capital' => [
                ['nombre' => 'Libertador', 'codigo' => 'VE-A-LIB', 'capital' => 'Caracas', 'latitud' => 10.5000, 'longitud' => -66.9167],
            ],

            // Aragua
            'Aragua' => [
                ['nombre' => 'Girardot', 'codigo' => 'VE-D-GIR', 'capital' => 'Maracay', 'latitud' => 10.2354, 'longitud' => -67.5911],
                ['nombre' => 'Mario Briceño Iragorry', 'codigo' => 'VE-D-MBI', 'capital' => 'El Limón', 'latitud' => 10.3056, 'longitud' => -67.6322],
                ['nombre' => 'Santiago Mariño', 'codigo' => 'VE-D-SMA', 'capital' => 'Turmero', 'latitud' => 10.2289, 'longitud' => -67.4744],
                ['nombre' => 'José Félix Ribas', 'codigo' => 'VE-D-JFR', 'capital' => 'La Victoria', 'latitud' => 10.2264, 'longitud' => -67.3314],
                ['nombre' => 'Sucre', 'codigo' => 'VE-D-SUC', 'capital' => 'Cagua', 'latitud' => 10.1858, 'longitud' => -67.4592],
                ['nombre' => 'Zamora', 'codigo' => 'VE-D-ZAM', 'capital' => 'Villa de Cura', 'latitud' => 10.0389, 'longitud' => -67.4881],
                ['nombre' => 'Libertador', 'codigo' => 'VE-D-LIB', 'capital' => 'Palo Negro', 'latitud' => 10.1742, 'longitud' => -67.5517],
            ],

            // Zulia
            'Zulia' => [
                ['nombre' => 'Maracaibo', 'codigo' => 'VE-V-MAR', 'capital' => 'Maracaibo', 'latitud' => 10.6500, 'longitud' => -71.6333],
                ['nombre' => 'San Francisco', 'codigo' => 'VE-V-SFR', 'capital' => 'San Francisco', 'latitud' => 10.5739, 'longitud' => -71.6500],
                ['nombre' => 'Cabimas', 'codigo' => 'VE-V-CAB', 'capital' => 'Cabimas', 'latitud' => 10.3956, 'longitud' => -71.4428],
                ['nombre' => 'Lagunillas', 'codigo' => 'VE-V-LAG', 'capital' => 'Ciudad Ojeda', 'latitud' => 10.2031, 'longitud' => -71.3125],
                ['nombre' => 'Mara', 'codigo' => 'VE-V-MARA', 'capital' => 'San Rafael del Moján', 'latitud' => 10.9639, 'longitud' => -71.7347],
                ['nombre' => 'Santa Rita', 'codigo' => 'VE-V-SRI', 'capital' => 'Santa Rita', 'latitud' => 10.5369, 'longitud' => -71.5122],
            ],

            // Carabobo
            'Carabobo' => [
                ['nombre' => 'Valencia', 'codigo' => 'VE-G-VAL', 'capital' => 'Valencia', 'latitud' => 10.1620, 'longitud' => -68.0077],
                ['nombre' => 'Naguanagua', 'codigo' => 'VE-G-NAG', 'capital' => 'Naguanagua', 'latitud' => 10.2547, 'longitud' => -68.0125],
                ['nombre' => 'San Diego', 'codigo' => 'VE-G-SDI', 'capital' => 'San Diego', 'latitud' => 10.2458, 'longitud' => -67.9542],
                ['nombre' => 'Puerto Cabello', 'codigo' => 'VE-G-PCA', 'capital' => 'Puerto Cabello', 'latitud' => 10.4731, 'longitud' => -68.0125],
                ['nombre' => 'Guacara', 'codigo' => 'VE-G-GUA', 'capital' => 'Guacara', 'latitud' => 10.2289, 'longitud' => -67.8778],
                ['nombre' => 'Los Guayos', 'codigo' => 'VE-G-LGU', 'capital' => 'Los Guayos', 'latitud' => 10.1878, 'longitud' => -67.9333],
            ],

            // Lara
            'Lara' => [
                ['nombre' => 'Iribarren', 'codigo' => 'VE-K-IRI', 'capital' => 'Barquisimeto', 'latitud' => 10.0647, 'longitud' => -69.3570],
                ['nombre' => 'Palavecino', 'codigo' => 'VE-K-PAL', 'capital' => 'Cabudare', 'latitud' => 10.0322, 'longitud' => -69.2611],
                ['nombre' => 'Torres', 'codigo' => 'VE-K-TOR', 'capital' => 'Carora', 'latitud' => 10.1744, 'longitud' => -70.0786],
                ['nombre' => 'Morán', 'codigo' => 'VE-K-MOR', 'capital' => 'El Tocuyo', 'latitud' => 9.7878, 'longitud' => -69.7919],
                ['nombre' => 'Jiménez', 'codigo' => 'VE-K-JIM', 'capital' => 'Quíbor', 'latitud' => 9.9281, 'longitud' => -69.6214],
            ],

            // Miranda
            'Miranda' => [
                ['nombre' => 'Guaicaipuro', 'codigo' => 'VE-M-GUA', 'capital' => 'Los Teques', 'latitud' => 10.3444, 'longitud' => -67.0417],
                ['nombre' => 'Chacao', 'codigo' => 'VE-M-CHA', 'capital' => 'Chacao', 'latitud' => 10.4961, 'longitud' => -66.8522],
                ['nombre' => 'Baruta', 'codigo' => 'VE-M-BAR', 'capital' => 'Nuestra Señora del Rosario de Baruta', 'latitud' => 10.4344, 'longitud' => -66.8742],
                ['nombre' => 'Sucre', 'codigo' => 'VE-M-SUC', 'capital' => 'Petare', 'latitud' => 10.4800, 'longitud' => -66.8083],
                ['nombre' => 'Plaza', 'codigo' => 'VE-M-PLA', 'capital' => 'Guarenas', 'latitud' => 10.4636, 'longitud' => -66.6133],
                ['nombre' => 'Zamora', 'codigo' => 'VE-M-ZAM', 'capital' => 'Guatire', 'latitud' => 10.4722, 'longitud' => -66.5414],
                ['nombre' => 'El Hatillo', 'codigo' => 'VE-M-HAT', 'capital' => 'El Hatillo', 'latitud' => 10.4261, 'longitud' => -66.8258],
            ],

            // Mérida
            'Mérida' => [
                ['nombre' => 'Libertador', 'codigo' => 'VE-L-LIB', 'capital' => 'Mérida', 'latitud' => 8.5983, 'longitud' => -71.1450],
                ['nombre' => 'Alberto Adriani', 'codigo' => 'VE-L-AAD', 'capital' => 'El Vigía', 'latitud' => 8.6186, 'longitud' => -71.6517],
                ['nombre' => 'Campo Elías', 'codigo' => 'VE-L-CEL', 'capital' => 'Ejido', 'latitud' => 8.5472, 'longitud' => -71.2408],
                ['nombre' => 'Sucre', 'codigo' => 'VE-L-SUC', 'capital' => 'Lagunillas', 'latitud' => 8.5089, 'longitud' => -71.3917],
                ['nombre' => 'Tovar', 'codigo' => 'VE-L-TOV', 'capital' => 'Tovar', 'latitud' => 8.3375, 'longitud' => -71.7583],
            ],

            // Táchira
            'Táchira' => [
                ['nombre' => 'San Cristóbal', 'codigo' => 'VE-S-SCR', 'capital' => 'San Cristóbal', 'latitud' => 7.7669, 'longitud' => -72.2250],
                ['nombre' => 'Cárdenas', 'codigo' => 'VE-S-CAR', 'capital' => 'Triba', 'latitud' => 7.8208, 'longitud' => -72.2222],
                ['nombre' => 'Jáuregui', 'codigo' => 'VE-S-JAU', 'capital' => 'La Grita', 'latitud' => 8.1333, 'longitud' => -71.9833],
                ['nombre' => 'Junín', 'codigo' => 'VE-S-JUN', 'capital' => 'Rubio', 'latitud' => 7.7058, 'longitud' => -72.3556],
                ['nombre' => 'Ayacucho', 'codigo' => 'VE-S-AYA', 'capital' => 'San Juan de Colón', 'latitud' => 8.0333, 'longitud' => -72.2500],
            ],

            // Anzoátegui
            'Anzoátegui' => [
                ['nombre' => 'Simón Bolívar', 'codigo' => 'VE-B-SBO', 'capital' => 'Barcelona', 'latitud' => 10.1333, 'longitud' => -64.7000],
                ['nombre' => 'Juan Antonio Sotillo', 'codigo' => 'VE-B-JAS', 'capital' => 'Puerto La Cruz', 'latitud' => 10.2167, 'longitud' => -64.6333],
                ['nombre' => 'Anaco', 'codigo' => 'VE-B-ANA', 'capital' => 'Anaco', 'latitud' => 9.4294, 'longitud' => -64.4628],
                ['nombre' => 'Simón Rodríguez', 'codigo' => 'VE-B-SRO', 'capital' => 'El Tigre', 'latitud' => 8.8867, 'longitud' => -64.2494],
                ['nombre' => 'Guanta', 'codigo' => 'VE-B-GUA', 'capital' => 'Guanta', 'latitud' => 10.2372, 'longitud' => -64.5939],
                ['nombre' => 'Diego Bautista Urbaneja', 'codigo' => 'VE-B-DBU', 'capital' => 'Lechería', 'latitud' => 10.1944, 'longitud' => -64.6931],
            ],

            // Bolívar
            'Bolívar' => [
                ['nombre' => 'Caroní', 'codigo' => 'VE-F-CAR', 'capital' => 'Ciudad Guayana', 'latitud' => 8.3611, 'longitud' => -62.6494],
                ['nombre' => 'Angostura del Orinoco', 'codigo' => 'VE-F-AOR', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1292, 'longitud' => -63.5408],
                ['nombre' => 'Piar', 'codigo' => 'VE-F-PIA', 'capital' => 'Upata', 'latitud' => 8.0167, 'longitud' => -62.4000],
                ['nombre' => 'Sifontes', 'codigo' => 'VE-F-SIF', 'capital' => 'Tumeremo', 'latitud' => 7.3000, 'longitud' => -61.5000],
                ['nombre' => 'Gran Sabana', 'codigo' => 'VE-F-GSA', 'capital' => 'Santa Elena de Uairén', 'latitud' => 4.6000, 'longitud' => -61.1083],
            ],

            // La Guaira
            'La Guaira' => [
                ['nombre' => 'Vargas', 'codigo' => 'VE-W-VAR', 'capital' => 'La Guaira', 'latitud' => 10.6000, 'longitud' => -66.9333],
            ],

            // Nueva Esparta
            'Nueva Esparta' => [
                ['nombre' => 'Mariño', 'codigo' => 'VE-O-MAR', 'capital' => 'Porlamar', 'latitud' => 10.9581, 'longitud' => -63.8506],
                ['nombre' => 'Maneiro', 'codigo' => 'VE-O-MAN', 'capital' => 'Pampatar', 'latitud' => 10.9983, 'longitud' => -63.7978],
                ['nombre' => 'Arismendi', 'codigo' => 'VE-O-ARI', 'capital' => 'La Asunción', 'latitud' => 11.0333, 'longitud' => -63.8628],
                ['nombre' => 'Garcés', 'codigo' => 'VE-O-GAR', 'capital' => 'Juangriego', 'latitud' => 11.0833, 'longitud' => -63.9667],
            ],

            // Falcón
            'Falcón' => [
                ['nombre' => 'Miranda', 'codigo' => 'VE-I-MIR', 'capital' => 'Santa Ana de Coro', 'latitud' => 11.4042, 'longitud' => -69.6739],
                ['nombre' => 'Carirubana', 'codigo' => 'VE-I-CAR', 'capital' => 'Punto Fijo', 'latitud' => 11.7000, 'longitud' => -70.2000],
                ['nombre' => 'Silva', 'codigo' => 'VE-I-SIL', 'capital' => 'Tucacas', 'latitud' => 10.8000, 'longitud' => -68.3167],
                ['nombre' => 'Los Taques', 'codigo' => 'VE-I-LTA', 'capital' => 'Santa Cruz de Los Taques', 'latitud' => 11.8333, 'longitud' => -70.2667],
            ],

            // Sucre
            'Sucre' => [
                ['nombre' => 'Sucre', 'codigo' => 'VE-R-SUC', 'capital' => 'Cumaná', 'latitud' => 10.4500, 'longitud' => -64.1667],
                ['nombre' => 'Bermúdez', 'codigo' => 'VE-R-BER', 'capital' => 'Carúpano', 'latitud' => 10.6667, 'longitud' => -63.2500],
                ['nombre' => 'Valdez', 'codigo' => 'VE-R-VAL', 'capital' => 'Güiria', 'latitud' => 10.5772, 'longitud' => -62.3006],
            ],

            // Monagas
            'Monagas' => [
                ['nombre' => 'Maturín', 'codigo' => 'VE-N-MAT', 'capital' => 'Maturín', 'latitud' => 9.7500, 'longitud' => -63.1833],
                ['nombre' => 'Ezequiel Zamora', 'codigo' => 'VE-N-EZAM', 'capital' => 'Punta de Mata', 'latitud' => 9.7028, 'longitud' => -63.6300],
                ['nombre' => 'Cedeño', 'codigo' => 'VE-N-CED', 'capital' => 'Caicara de Maturín', 'latitud' => 9.8167, 'longitud' => -63.6167],
            ],

            // Portuguesa
            'Portuguesa' => [
                ['nombre' => 'Páez', 'codigo' => 'VE-P-PAE', 'capital' => 'Acarigua', 'latitud' => 9.5500, 'longitud' => -69.2000],
                ['nombre' => 'Guanare', 'codigo' => 'VE-P-GUA', 'capital' => 'Guanare', 'latitud' => 9.0417, 'longitud' => -69.7483],
                ['nombre' => 'Araure', 'codigo' => 'VE-P-ARA', 'capital' => 'Araure', 'latitud' => 9.5600, 'longitud' => -69.2136],
            ],

            // Barinas
            'Barinas' => [
                ['nombre' => 'Barinas', 'codigo' => 'VE-E-BAR', 'capital' => 'Barinas', 'latitud' => 8.6226, 'longitud' => -70.2075],
                ['nombre' => 'Alberto Arvelo Torrealba', 'codigo' => 'VE-E-AAT', 'capital' => 'Sabaneta', 'latitud' => 8.7667, 'longitud' => -69.9333],
                ['nombre' => 'Pedraza', 'codigo' => 'VE-E-PED', 'capital' => 'Ciudad Bolivia', 'latitud' => 8.3500, 'longitud' => -70.5667],
            ],

            // Guárico
            'Guárico' => [
                ['nombre' => 'Juan Germán Roscio', 'codigo' => 'VE-J-JGR', 'capital' => 'San Juan de los Morros', 'latitud' => 9.9111, 'longitud' => -67.3539],
                ['nombre' => 'Francisco de Miranda', 'codigo' => 'VE-J-FMI', 'capital' => 'Calabozo', 'latitud' => 8.9242, 'longitud' => -67.4294],
                ['nombre' => 'Leonardo Infante', 'codigo' => 'VE-J-LIN', 'capital' => 'Valle de la Pascua', 'latitud' => 9.2167, 'longitud' => -66.0167],
            ],

            // Trujillo
            'Trujillo' => [
                ['nombre' => 'Valera', 'codigo' => 'VE-T-VAL', 'capital' => 'Valera', 'latitud' => 9.3178, 'longitud' => -70.6036],
                ['nombre' => 'Trujillo', 'codigo' => 'VE-T-TRU', 'capital' => 'Trujillo', 'latitud' => 9.3667, 'longitud' => -70.4333],
                ['nombre' => 'Bocoñó', 'codigo' => 'VE-T-BOC', 'capital' => 'Boconó', 'latitud' => 9.2500, 'longitud' => -70.2667],
            ],

            // Yaracuy
            'Yaracuy' => [
                ['nombre' => 'San Felipe', 'codigo' => 'VE-U-SFE', 'capital' => 'San Felipe', 'latitud' => 10.3397, 'longitud' => -68.7425],
                ['nombre' => 'Independencia', 'codigo' => 'VE-U-IND', 'capital' => 'Independencia', 'latitud' => 10.3300, 'longitud' => -68.7500],
                ['nombre' => 'Peña', 'codigo' => 'VE-U-PEN', 'capital' => 'Yaritagua', 'latitud' => 10.0786, 'longitud' => -69.1239],
            ],

            // Apure
            'Apure' => [
                ['nombre' => 'San Fernando', 'codigo' => 'VE-C-SFE', 'capital' => 'San Fernando de Apure', 'latitud' => 7.8878, 'longitud' => -67.4724],
                ['nombre' => 'Biruaca', 'codigo' => 'VE-C-BIR', 'capital' => 'Biruaca', 'latitud' => 7.8500, 'longitud' => -67.5167],
                ['nombre' => 'Páez', 'codigo' => 'VE-C-PAE', 'capital' => 'Guasdualito', 'latitud' => 7.2414, 'longitud' => -70.7325],
            ],

            // Amazonas
            'Amazonas' => [
                ['nombre' => 'Atures', 'codigo' => 'VE-Z-ATU', 'capital' => 'Puerto Ayacucho', 'latitud' => 5.6639, 'longitud' => -67.5858],
                ['nombre' => 'Autana', 'codigo' => 'VE-Z-AUT', 'capital' => 'Isla Ratón', 'latitud' => 5.1200, 'longitud' => -67.8000],
            ],

            // Cojedes
            'Cojedes' => [
                ['nombre' => 'Ezequiel Zamora', 'codigo' => 'VE-H-EZAM', 'capital' => 'San Carlos', 'latitud' => 9.6612, 'longitud' => -68.5827],
                ['nombre' => 'Tinaquillo', 'codigo' => 'VE-H-TIN', 'capital' => 'Tinaquillo', 'latitud' => 9.9186, 'longitud' => -68.3047],
            ],

            // Delta Amacuro
            'Delta Amacuro' => [
                ['nombre' => 'Tucupita', 'codigo' => 'VE-Y-TUC', 'capital' => 'Tucupita', 'latitud' => 9.0611, 'longitud' => -62.0494],
                ['nombre' => 'Pedernales', 'codigo' => 'VE-Y-PED', 'capital' => 'Pedernales', 'latitud' => 9.9667, 'longitud' => -62.2500],
            ],
        ];

        foreach ($municipios as $estadoNombre => $listaMunicipios) {
            $estadoId = $estados[$estadoNombre] ?? null;

            if ($estadoId) {
                foreach ($listaMunicipios as $mun) {
                    Municipio::updateOrCreate(
                        [
                            'estado_id' => $estadoId,
                            'nombre' => $mun['nombre'],
                        ],
                        [
                            'codigo' => $mun['codigo'],
                            'capital' => $mun['capital'],
                            'latitud' => $mun['latitud'],
                            'longitud' => $mun['longitud'],
                            'activo' => true,
                        ]
                    );
                }
            }
        }
    }
}
