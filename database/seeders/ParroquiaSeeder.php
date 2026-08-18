<?php

namespace Database\Seeders;

use App\Models\Municipio;
use App\Models\Parroquia;
use Illuminate\Database\Seeder;

class ParroquiaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $municipios = Municipio::with('estado')->get()->keyBy(function ($m) {
            return $m->estado->nombre.'|'.$m->nombre;
        });

        if ($municipios->isEmpty()) {
            return;
        }

        $parroquias = [
            // Distrito Capital -> Libertador
            'Distrito Capital|Libertador' => [
                ['nombre' => 'Altagracia', 'codigo' => 'VE-A-LIB-01', 'latitud' => 10.5111, 'longitud' => -66.9142],
                ['nombre' => 'Antímano', 'codigo' => 'VE-A-LIB-02', 'latitud' => 10.4722, 'longitud' => -66.9806],
                ['nombre' => 'Candelaria', 'codigo' => 'VE-A-LIB-03', 'latitud' => 10.5056, 'longitud' => -66.9042],
                ['nombre' => 'Caricuao', 'codigo' => 'VE-A-LIB-04', 'latitud' => 10.4333, 'longitud' => -66.9833],
                ['nombre' => 'Catedral', 'codigo' => 'VE-A-LIB-05', 'latitud' => 10.5064, 'longitud' => -66.9144],
                ['nombre' => 'Coche', 'codigo' => 'VE-A-LIB-06', 'latitud' => 10.4500, 'longitud' => -66.9167],
                ['nombre' => 'El Junquito', 'codigo' => 'VE-A-LIB-07', 'latitud' => 10.4667, 'longitud' => -67.0833],
                ['nombre' => 'El Paraíso', 'codigo' => 'VE-A-LIB-08', 'latitud' => 10.4889, 'longitud' => -66.9361],
                ['nombre' => 'El Recreo', 'codigo' => 'VE-A-LIB-09', 'latitud' => 10.4944, 'longitud' => -66.8806],
                ['nombre' => 'El Valle', 'codigo' => 'VE-A-LIB-10', 'latitud' => 10.4639, 'longitud' => -66.9083],
                ['nombre' => 'La Pastora', 'codigo' => 'VE-A-LIB-11', 'latitud' => 10.5194, 'longitud' => -66.9222],
                ['nombre' => 'La Vega', 'codigo' => 'VE-A-LIB-12', 'latitud' => 10.4667, 'longitud' => -66.9500],
                ['nombre' => 'Macarao', 'codigo' => 'VE-A-LIB-13', 'latitud' => 10.4167, 'longitud' => -67.0167],
                ['nombre' => 'San Agustín', 'codigo' => 'VE-A-LIB-14', 'latitud' => 10.4917, 'longitud' => -66.9028],
                ['nombre' => 'San Bernardino', 'codigo' => 'VE-A-LIB-15', 'latitud' => 10.5167, 'longitud' => -66.8972],
                ['nombre' => 'San José', 'codigo' => 'VE-A-LIB-16', 'latitud' => 10.5194, 'longitud' => -66.9083],
                ['nombre' => 'San Juan', 'codigo' => 'VE-A-LIB-17', 'latitud' => 10.4972, 'longitud' => -66.9278],
                ['nombre' => 'San Pedro', 'codigo' => 'VE-A-LIB-18', 'latitud' => 10.4833, 'longitud' => -66.8917],
                ['nombre' => 'Santa Rosalía', 'codigo' => 'VE-A-LIB-19', 'latitud' => 10.4889, 'longitud' => -66.9139],
                ['nombre' => 'Santa Teresa', 'codigo' => 'VE-A-LIB-20', 'latitud' => 10.5000, 'longitud' => -66.9181],
                ['nombre' => 'Sucre (Catia)', 'codigo' => 'VE-A-LIB-21', 'latitud' => 10.5139, 'longitud' => -66.9389],
                ['nombre' => '23 de Enero', 'codigo' => 'VE-A-LIB-22', 'latitud' => 10.5083, 'longitud' => -66.9333],
            ],

            // Aragua -> Girardot
            'Aragua|Girardot' => [
                ['nombre' => 'Pedro José Ovalles', 'codigo' => 'VE-D-GIR-01', 'latitud' => 10.2189, 'longitud' => -67.5850],
                ['nombre' => 'Joaquín Crespo', 'codigo' => 'VE-D-GIR-02', 'latitud' => 10.2300, 'longitud' => -67.5750],
                ['nombre' => 'José Casanova Godoy', 'codigo' => 'VE-D-GIR-03', 'latitud' => 10.2220, 'longitud' => -67.6000],
                ['nombre' => 'Madre María de San José', 'codigo' => 'VE-D-GIR-04', 'latitud' => 10.2450, 'longitud' => -67.5920],
                ['nombre' => 'Andrés Eloy Blanco', 'codigo' => 'VE-D-GIR-05', 'latitud' => 10.2380, 'longitud' => -67.6100],
                ['nombre' => 'Los Tacarigua', 'codigo' => 'VE-D-GIR-06', 'latitud' => 10.2280, 'longitud' => -67.6250],
                ['nombre' => 'Las Delicias', 'codigo' => 'VE-D-GIR-07', 'latitud' => 10.2700, 'longitud' => -67.5800],
                ['nombre' => 'Choroní', 'codigo' => 'VE-D-GIR-08', 'latitud' => 10.4917, 'longitud' => -67.5722],
            ],

            // Aragua -> Mario Briceño Iragorry
            'Aragua|Mario Briceño Iragorry' => [
                ['nombre' => 'El Limón', 'codigo' => 'VE-D-MBI-01', 'latitud' => 10.3056, 'longitud' => -67.6322],
                ['nombre' => 'Caña de Azúcar', 'codigo' => 'VE-D-MBI-02', 'latitud' => 10.2778, 'longitud' => -67.6361],
            ],

            // Aragua -> Santiago Mariño
            'Aragua|Santiago Mariño' => [
                ['nombre' => 'Turmero', 'codigo' => 'VE-D-SMA-01', 'latitud' => 10.2289, 'longitud' => -67.4744],
                ['nombre' => 'Chuao', 'codigo' => 'VE-D-SMA-02', 'latitud' => 10.4944, 'longitud' => -67.5306],
                ['nombre' => 'Samán de Güere', 'codigo' => 'VE-D-SMA-03', 'latitud' => 10.2194, 'longitud' => -67.5194],
                ['nombre' => 'Alfredo Pacheco Miranda', 'codigo' => 'VE-D-SMA-04', 'latitud' => 10.2083, 'longitud' => -67.4944],
            ],

            // Zulia -> Maracaibo
            'Zulia|Maracaibo' => [
                ['nombre' => 'Olegario Villalobos', 'codigo' => 'VE-V-MAR-01', 'latitud' => 10.6667, 'longitud' => -71.6167],
                ['nombre' => 'Juana de Ávila', 'codigo' => 'VE-V-MAR-02', 'latitud' => 10.6833, 'longitud' => -71.6333],
                ['nombre' => 'Coquivacoa', 'codigo' => 'VE-V-MAR-03', 'latitud' => 10.7000, 'longitud' => -71.6167],
                ['nombre' => 'Chiquinquirá', 'codigo' => 'VE-V-MAR-04', 'latitud' => 10.6444, 'longitud' => -71.6250],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-V-MAR-05', 'latitud' => 10.6400, 'longitud' => -71.6100],
                ['nombre' => 'Caracciolo Parra Pérez', 'codigo' => 'VE-V-MAR-06', 'latitud' => 10.6639, 'longitud' => -71.6528],
                ['nombre' => 'Cacique Mara', 'codigo' => 'VE-V-MAR-07', 'latitud' => 10.6389, 'longitud' => -71.6444],
                ['nombre' => 'Santa Lucía', 'codigo' => 'VE-V-MAR-08', 'latitud' => 10.6472, 'longitud' => -71.6056],
                ['nombre' => 'Francisco Eugenio Bustamante', 'codigo' => 'VE-V-MAR-09', 'latitud' => 10.6278, 'longitud' => -71.6778],
            ],

            // Carabobo -> Valencia
            'Carabobo|Valencia' => [
                ['nombre' => 'Candelaria', 'codigo' => 'VE-G-VAL-01', 'latitud' => 10.1778, 'longitud' => -68.0056],
                ['nombre' => 'Catedral', 'codigo' => 'VE-G-VAL-02', 'latitud' => 10.1806, 'longitud' => -68.0028],
                ['nombre' => 'El Socorro', 'codigo' => 'VE-G-VAL-03', 'latitud' => 10.1833, 'longitud' => -68.0111],
                ['nombre' => 'Miguel Peña', 'codigo' => 'VE-G-VAL-04', 'latitud' => 10.1417, 'longitud' => -68.0167],
                ['nombre' => 'Rafael Urdaneta', 'codigo' => 'VE-G-VAL-05', 'latitud' => 10.1500, 'longitud' => -67.9333],
                ['nombre' => 'San José', 'codigo' => 'VE-G-VAL-06', 'latitud' => 10.2222, 'longitud' => -68.0056],
                ['nombre' => 'San Blas', 'codigo' => 'VE-G-VAL-07', 'latitud' => 10.1750, 'longitud' => -67.9944],
                ['nombre' => 'Santa Rosa', 'codigo' => 'VE-G-VAL-08', 'latitud' => 10.1611, 'longitud' => -68.0000],
            ],

            // Carabobo -> Naguanagua
            'Carabobo|Naguanagua' => [
                ['nombre' => 'Naguanagua', 'codigo' => 'VE-G-NAG-01', 'latitud' => 10.2547, 'longitud' => -68.0125],
            ],

            // Carabobo -> San Diego
            'Carabobo|San Diego' => [
                ['nombre' => 'San Diego', 'codigo' => 'VE-G-SDI-01', 'latitud' => 10.2458, 'longitud' => -67.9542],
            ],

            // Lara -> Iribarren
            'Lara|Iribarren' => [
                ['nombre' => 'Catedral', 'codigo' => 'VE-K-IRI-01', 'latitud' => 10.0667, 'longitud' => -69.3167],
                ['nombre' => 'Concepción', 'codigo' => 'VE-K-IRI-02', 'latitud' => 10.0611, 'longitud' => -69.3333],
                ['nombre' => 'El Cují', 'codigo' => 'VE-K-IRI-03', 'latitud' => 10.1333, 'longitud' => -69.3333],
                ['nombre' => 'Guerrera Ana Soto (Juan de Villegas)', 'codigo' => 'VE-K-IRI-04', 'latitud' => 10.0500, 'longitud' => -69.3833],
                ['nombre' => 'Santa Rosa', 'codigo' => 'VE-K-IRI-05', 'latitud' => 10.0528, 'longitud' => -69.2806],
                ['nombre' => 'Tamaca', 'codigo' => 'VE-K-IRI-06', 'latitud' => 10.1778, 'longitud' => -69.3167],
                ['nombre' => 'Unión', 'codigo' => 'VE-K-IRI-07', 'latitud' => 10.0889, 'longitud' => -69.3444],
            ],

            // Miranda -> Guaicaipuro
            'Miranda|Guaicaipuro' => [
                ['nombre' => 'Los Teques', 'codigo' => 'VE-M-GUA-01', 'latitud' => 10.3444, 'longitud' => -67.0417],
                ['nombre' => 'El Jarillo', 'codigo' => 'VE-M-GUA-02', 'latitud' => 10.3556, 'longitud' => -67.1611],
                ['nombre' => 'San Pedro', 'codigo' => 'VE-M-GUA-03', 'latitud' => 10.3722, 'longitud' => -67.0944],
                ['nombre' => 'Paracotos', 'codigo' => 'VE-M-GUA-04', 'latitud' => 10.2667, 'longitud' => -66.9472],
            ],

            // Miranda -> Chacao
            'Miranda|Chacao' => [
                ['nombre' => 'Chacao', 'codigo' => 'VE-M-CHA-01', 'latitud' => 10.4961, 'longitud' => -66.8522],
            ],

            // Miranda -> Baruta
            'Miranda|Baruta' => [
                ['nombre' => 'El Cafetal', 'codigo' => 'VE-M-BAR-01', 'latitud' => 10.4639, 'longitud' => -66.8389],
                ['nombre' => 'Las Minas de Baruta', 'codigo' => 'VE-M-BAR-02', 'latitud' => 10.4417, 'longitud' => -66.8639],
                ['nombre' => 'Nuestra Señora del Rosario de Baruta', 'codigo' => 'VE-M-BAR-03', 'latitud' => 10.4344, 'longitud' => -66.8742],
            ],

            // Miranda -> Sucre
            'Miranda|Sucre' => [
                ['nombre' => 'Petare', 'codigo' => 'VE-M-SUC-01', 'latitud' => 10.4800, 'longitud' => -66.8083],
                ['nombre' => 'Leoncio Martínez', 'codigo' => 'VE-M-SUC-02', 'latitud' => 10.4944, 'longitud' => -66.8250],
                ['nombre' => 'Caucagüita', 'codigo' => 'VE-M-SUC-03', 'latitud' => 10.4778, 'longitud' => -66.7278],
                ['nombre' => 'Filas de Mariche', 'codigo' => 'VE-M-SUC-04', 'latitud' => 10.4472, 'longitud' => -66.7444],
                ['nombre' => 'La Dolorita', 'codigo' => 'VE-M-SUC-05', 'latitud' => 10.4722, 'longitud' => -66.7722],
            ],

            // Mérida -> Libertador
            'Mérida|Libertador' => [
                ['nombre' => 'Antonio Spinetti Dini', 'codigo' => 'VE-L-LIB-01', 'latitud' => 8.6167, 'longitud' => -71.1389],
                ['nombre' => 'Caracciolo Parra Pérez', 'codigo' => 'VE-L-LIB-02', 'latitud' => 8.6083, 'longitud' => -71.1556],
                ['nombre' => 'Domingo Peña', 'codigo' => 'VE-L-LIB-03', 'latitud' => 8.5778, 'longitud' => -71.1694],
                ['nombre' => 'El Llano', 'codigo' => 'VE-L-LIB-04', 'latitud' => 8.5944, 'longitud' => -71.1472],
                ['nombre' => 'Milla', 'codigo' => 'VE-L-LIB-05', 'latitud' => 8.6083, 'longitud' => -71.1389],
                ['nombre' => 'Sagrario', 'codigo' => 'VE-L-LIB-06', 'latitud' => 8.5972, 'longitud' => -71.1444],
            ],

            // Táchira -> San Cristóbal
            'Táchira|San Cristóbal' => [
                ['nombre' => 'La Concordia', 'codigo' => 'VE-S-SCR-01', 'latitud' => 7.7556, 'longitud' => -72.2278],
                ['nombre' => 'Pedro María Morantes', 'codigo' => 'VE-S-SCR-02', 'latitud' => 7.7778, 'longitud' => -72.2139],
                ['nombre' => 'San Juan Bautista', 'codigo' => 'VE-S-SCR-03', 'latitud' => 7.7722, 'longitud' => -72.2306],
                ['nombre' => 'San Sebastián', 'codigo' => 'VE-S-SCR-04', 'latitud' => 7.7611, 'longitud' => -72.2250],
            ],

            // Anzoátegui -> Simón Bolívar
            'Anzoátegui|Simón Bolívar' => [
                ['nombre' => 'El Carmen', 'codigo' => 'VE-B-SBO-01', 'latitud' => 10.1389, 'longitud' => -64.6944],
                ['nombre' => 'San Cristóbal', 'codigo' => 'VE-B-SBO-02', 'latitud' => 10.1306, 'longitud' => -64.7028],
                ['nombre' => 'Naricual', 'codigo' => 'VE-B-SBO-03', 'latitud' => 10.0528, 'longitud' => -64.6056],
            ],

            // Bolívar -> Caroní
            'Bolívar|Caroní' => [
                ['nombre' => 'Cachamay', 'codigo' => 'VE-F-CAR-01', 'latitud' => 8.3500, 'longitud' => -62.6833],
                ['nombre' => 'Chirica', 'codigo' => 'VE-F-CAR-02', 'latitud' => 8.3306, 'longitud' => -62.6139],
                ['nombre' => 'Dalla Costa', 'codigo' => 'VE-F-CAR-03', 'latitud' => 8.3417, 'longitud' => -62.6361],
                ['nombre' => 'Unare', 'codigo' => 'VE-F-CAR-04', 'latitud' => 8.2917, 'longitud' => -62.7444],
                ['nombre' => 'Universidad', 'codigo' => 'VE-F-CAR-05', 'latitud' => 8.3278, 'longitud' => -62.7056],
            ],

            // La Guaira -> Vargas
            'La Guaira|Vargas' => [
                ['nombre' => 'La Guaira', 'codigo' => 'VE-W-VAR-01', 'latitud' => 10.6000, 'longitud' => -66.9333],
                ['nombre' => 'Caraballeda', 'codigo' => 'VE-W-VAR-02', 'latitud' => 10.6194, 'longitud' => -66.8528],
                ['nombre' => 'Carayaca', 'codigo' => 'VE-W-VAR-03', 'latitud' => 10.5361, 'longitud' => -67.1139],
                ['nombre' => 'Catia La Mar', 'codigo' => 'VE-W-VAR-04', 'latitud' => 10.6056, 'longitud' => -67.0306],
                ['nombre' => 'Macuto', 'codigo' => 'VE-W-VAR-05', 'latitud' => 10.6111, 'longitud' => -66.8972],
                ['nombre' => 'Maiquetía', 'codigo' => 'VE-W-VAR-06', 'latitud' => 10.5944, 'longitud' => -66.9556],
                ['nombre' => 'Naiguatá', 'codigo' => 'VE-W-VAR-07', 'latitud' => 10.6194, 'longitud' => -66.7389],
            ],
        ];

        foreach ($parroquias as $key => $listaParroquias) {
            $municipio = $municipios->get($key);

            if ($municipio) {
                foreach ($listaParroquias as $parr) {
                    Parroquia::updateOrCreate(
                        [
                            'municipio_id' => $municipio->id,
                            'nombre' => $parr['nombre'],
                        ],
                        [
                            'codigo' => $parr['codigo'],
                            'capital' => $parr['capital'] ?? $parr['nombre'],
                            'latitud' => $parr['latitud'],
                            'longitud' => $parr['longitud'],
                            'activo' => true,
                        ]
                    );
                }
            }
        }
    }
}
