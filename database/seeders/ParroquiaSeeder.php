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
            // 1. Distrito Capital -> Libertador (22 Parroquias)
            'Distrito Capital|Libertador' => [
                ['nombre' => 'Altagracia', 'codigo' => 'VE-A-LIB-01', 'capital' => 'Altagracia', 'latitud' => 10.5111, 'longitud' => -66.9142],
                ['nombre' => 'Antímano', 'codigo' => 'VE-A-LIB-02', 'capital' => 'Antímano', 'latitud' => 10.4722, 'longitud' => -66.9806],
                ['nombre' => 'Candelaria', 'codigo' => 'VE-A-LIB-03', 'capital' => 'Candelaria', 'latitud' => 10.5056, 'longitud' => -66.9042],
                ['nombre' => 'Caricuao', 'codigo' => 'VE-A-LIB-04', 'capital' => 'Caricuao', 'latitud' => 10.4333, 'longitud' => -66.9833],
                ['nombre' => 'Catedral', 'codigo' => 'VE-A-LIB-05', 'capital' => 'Catedral', 'latitud' => 10.5064, 'longitud' => -66.9144],
                ['nombre' => 'Coche', 'codigo' => 'VE-A-LIB-06', 'capital' => 'Coche', 'latitud' => 10.4500, 'longitud' => -66.9167],
                ['nombre' => 'El Junquito', 'codigo' => 'VE-A-LIB-07', 'capital' => 'El Junquito', 'latitud' => 10.4667, 'longitud' => -67.0833],
                ['nombre' => 'El Paraíso', 'codigo' => 'VE-A-LIB-08', 'capital' => 'El Paraíso', 'latitud' => 10.4889, 'longitud' => -66.9361],
                ['nombre' => 'El Recreo', 'codigo' => 'VE-A-LIB-09', 'capital' => 'El Recreo', 'latitud' => 10.4944, 'longitud' => -66.8806],
                ['nombre' => 'El Valle', 'codigo' => 'VE-A-LIB-10', 'capital' => 'El Valle', 'latitud' => 10.4639, 'longitud' => -66.9083],
                ['nombre' => 'La Pastora', 'codigo' => 'VE-A-LIB-11', 'capital' => 'La Pastora', 'latitud' => 10.5194, 'longitud' => -66.9222],
                ['nombre' => 'La Vega', 'codigo' => 'VE-A-LIB-12', 'capital' => 'La Vega', 'latitud' => 10.4667, 'longitud' => -66.9500],
                ['nombre' => 'Macarao', 'codigo' => 'VE-A-LIB-13', 'capital' => 'Macarao', 'latitud' => 10.4167, 'longitud' => -67.0167],
                ['nombre' => 'San Agustín', 'codigo' => 'VE-A-LIB-14', 'capital' => 'San Agustín', 'latitud' => 10.4917, 'longitud' => -66.9028],
                ['nombre' => 'San Bernardino', 'codigo' => 'VE-A-LIB-15', 'capital' => 'San Bernardino', 'latitud' => 10.5167, 'longitud' => -66.8972],
                ['nombre' => 'San José', 'codigo' => 'VE-A-LIB-16', 'capital' => 'San José', 'latitud' => 10.5194, 'longitud' => -66.9083],
                ['nombre' => 'San Juan', 'codigo' => 'VE-A-LIB-17', 'capital' => 'San Juan', 'latitud' => 10.4972, 'longitud' => -66.9278],
                ['nombre' => 'San Pedro', 'codigo' => 'VE-A-LIB-18', 'capital' => 'San Pedro', 'latitud' => 10.4833, 'longitud' => -66.8917],
                ['nombre' => 'Santa Rosalía', 'codigo' => 'VE-A-LIB-19', 'capital' => 'Santa Rosalía', 'latitud' => 10.4889, 'longitud' => -66.9139],
                ['nombre' => 'Santa Teresa', 'codigo' => 'VE-A-LIB-20', 'capital' => 'Santa Teresa', 'latitud' => 10.5000, 'longitud' => -66.9181],
                ['nombre' => 'Sucre (Catia)', 'codigo' => 'VE-A-LIB-21', 'capital' => 'Catia', 'latitud' => 10.5139, 'longitud' => -66.9389],
                ['nombre' => '23 de Enero', 'codigo' => 'VE-A-LIB-22', 'capital' => '23 de Enero', 'latitud' => 10.5083, 'longitud' => -66.9333],
            ],

            // 2. Amazonas
            'Amazonas|Atures' => [
                ['nombre' => 'Fernando Girón Tovar', 'codigo' => 'VE-Z-ATU-01', 'capital' => 'Puerto Ayacucho', 'latitud' => 5.6639, 'longitud' => -67.5858],
                ['nombre' => 'Luis Alberto Gómez', 'codigo' => 'VE-Z-ATU-02', 'capital' => 'Puerto Ayacucho', 'latitud' => 5.6500, 'longitud' => -67.5700],
                ['nombre' => 'Pahueña', 'codigo' => 'VE-Z-ATU-03', 'capital' => 'Limoncaro', 'latitud' => 5.7500, 'longitud' => -67.4500],
                ['nombre' => 'Yapacana', 'codigo' => 'VE-Z-ATU-04', 'capital' => 'Yapacana', 'latitud' => 5.5000, 'longitud' => -67.3000],
            ],
            'Amazonas|Autana' => [
                ['nombre' => 'Samariapo', 'codigo' => 'VE-Z-AUT-01', 'capital' => 'Samariapo', 'latitud' => 5.2333, 'longitud' => -67.8000],
                ['nombre' => 'Sipapo', 'codigo' => 'VE-Z-AUT-02', 'capital' => 'Sipapo', 'latitud' => 5.0833, 'longitud' => -67.7500],
                ['nombre' => 'Isla Ratón', 'codigo' => 'VE-Z-AUT-03', 'capital' => 'Isla Ratón', 'latitud' => 5.1200, 'longitud' => -67.8000],
                ['nombre' => 'Guayapo', 'codigo' => 'VE-Z-AUT-04', 'capital' => 'Guayapo', 'latitud' => 4.9500, 'longitud' => -67.6500],
            ],
            'Amazonas|Atabapo' => [
                ['nombre' => 'San Fernando de Atabapo', 'codigo' => 'VE-Z-ATA-01', 'capital' => 'San Fernando de Atabapo', 'latitud' => 4.0500, 'longitud' => -67.7000],
                ['nombre' => 'Anabaven', 'codigo' => 'VE-Z-ATA-02', 'capital' => 'Anabaven', 'latitud' => 3.9000, 'longitud' => -67.6000],
                ['nombre' => 'Ucata', 'codigo' => 'VE-Z-ATA-03', 'capital' => 'Ucata', 'latitud' => 4.2000, 'longitud' => -67.8000],
            ],
            'Amazonas|Alto Orinoco' => [
                ['nombre' => 'La Esmeralda', 'codigo' => 'VE-Z-AOR-01', 'capital' => 'La Esmeralda', 'latitud' => 3.1736, 'longitud' => -65.5461],
                ['nombre' => 'Huachamacare', 'codigo' => 'VE-Z-AOR-02', 'capital' => 'Acanaña', 'latitud' => 3.3000, 'longitud' => -65.7000],
                ['nombre' => 'Marawaka', 'codigo' => 'VE-Z-AOR-03', 'capital' => 'Toky', 'latitud' => 3.5000, 'longitud' => -65.2000],
            ],
            'Amazonas|Manapiare' => [
                ['nombre' => 'Manapiare', 'codigo' => 'VE-Z-MAN-01', 'capital' => 'San Juan de Manapiare', 'latitud' => 5.3167, 'longitud' => -66.0500],
                ['nombre' => 'Alto Ventuari', 'codigo' => 'VE-Z-MAN-02', 'capital' => 'San Pedro', 'latitud' => 5.6000, 'longitud' => -65.5000],
                ['nombre' => 'Bajo Ventuari', 'codigo' => 'VE-Z-MAN-03', 'capital' => 'Moya', 'latitud' => 5.1000, 'longitud' => -66.3000],
            ],
            'Amazonas|Maroa' => [
                ['nombre' => 'Maroa', 'codigo' => 'VE-Z-MAR-01', 'capital' => 'Maroa', 'latitud' => 2.7167, 'longitud' => -67.5500],
                ['nombre' => 'Victorino', 'codigo' => 'VE-Z-MAR-02', 'capital' => 'Victorino', 'latitud' => 2.8000, 'longitud' => -67.4500],
            ],
            'Amazonas|Río Negro' => [
                ['nombre' => 'San Carlos de Río Negro', 'codigo' => 'VE-Z-RNE-01', 'capital' => 'San Carlos de Río Negro', 'latitud' => 1.9167, 'longitud' => -67.0833],
                ['nombre' => 'Solano', 'codigo' => 'VE-Z-RNE-02', 'capital' => 'Solano', 'latitud' => 1.9800, 'longitud' => -66.9500],
            ],

            // 3. Anzoátegui
            'Anzoátegui|Simón Bolívar' => [
                ['nombre' => 'El Carmen', 'codigo' => 'VE-B-SBO-01', 'capital' => 'Barcelona', 'latitud' => 10.1333, 'longitud' => -64.7000],
                ['nombre' => 'San Cristóbal', 'codigo' => 'VE-B-SBO-02', 'capital' => 'Barcelona', 'latitud' => 10.1450, 'longitud' => -64.6800],
                ['nombre' => 'Bergantín', 'codigo' => 'VE-B-SBO-03', 'capital' => 'Bergantín', 'latitud' => 10.0000, 'longitud' => -64.3667],
                ['nombre' => 'Caigua', 'codigo' => 'VE-B-SBO-04', 'capital' => 'Caigua', 'latitud' => 10.0500, 'longitud' => -64.7333],
                ['nombre' => 'El Pilar', 'codigo' => 'VE-B-SBO-05', 'capital' => 'El Pilar', 'latitud' => 10.0833, 'longitud' => -64.5833],
                ['nombre' => 'Naricual', 'codigo' => 'VE-B-SBO-06', 'capital' => 'Naricual', 'latitud' => 10.0800, 'longitud' => -64.6300],
            ],
            'Anzoátegui|Juan Antonio Sotillo' => [
                ['nombre' => 'Puerto La Cruz', 'codigo' => 'VE-B-JAS-01', 'capital' => 'Puerto La Cruz', 'latitud' => 10.2167, 'longitud' => -64.6333],
                ['nombre' => 'Pozuelos', 'codigo' => 'VE-B-JAS-02', 'capital' => 'Pozuelos', 'latitud' => 10.1833, 'longitud' => -64.6000],
            ],
            'Anzoátegui|Anaco' => [
                ['nombre' => 'Anaco', 'codigo' => 'VE-B-ANA-01', 'capital' => 'Anaco', 'latitud' => 9.4294, 'longitud' => -64.4628],
                ['nombre' => 'San Joaquín', 'codigo' => 'VE-B-ANA-02', 'capital' => 'San Joaquín', 'latitud' => 9.3833, 'longitud' => -64.4333],
            ],
            'Anzoátegui|Simón Rodríguez' => [
                ['nombre' => 'Edmundo Barrios', 'codigo' => 'VE-B-SRO-01', 'capital' => 'El Tigre', 'latitud' => 8.8867, 'longitud' => -64.2494],
                ['nombre' => 'Miguel Otero Silva', 'codigo' => 'VE-B-SRO-02', 'capital' => 'El Tigre Norte', 'latitud' => 8.9100, 'longitud' => -64.2600],
            ],
            'Anzoátegui|Guanta' => [
                ['nombre' => 'Guanta', 'codigo' => 'VE-B-GUA-01', 'capital' => 'Guanta', 'latitud' => 10.2372, 'longitud' => -64.5939],
                ['nombre' => 'Chorrerón', 'codigo' => 'VE-B-GUA-02', 'capital' => 'Chorrerón', 'latitud' => 10.2200, 'longitud' => -64.5700],
            ],
            'Anzoátegui|Diego Bautista Urbaneja' => [
                ['nombre' => 'Lechería', 'codigo' => 'VE-B-DBU-01', 'capital' => 'Lechería', 'latitud' => 10.1944, 'longitud' => -64.6931],
                ['nombre' => 'El Morro', 'codigo' => 'VE-B-DBU-02', 'capital' => 'El Morro', 'latitud' => 10.2100, 'longitud' => -64.6850],
            ],
            'Anzoátegui|Pedro María Freites' => [
                ['nombre' => 'Cantaura', 'codigo' => 'VE-B-FRE-01', 'capital' => 'Cantaura', 'latitud' => 9.3000, 'longitud' => -64.3500],
                ['nombre' => 'Santa Rosa', 'codigo' => 'VE-B-FRE-02', 'capital' => 'Santa Rosa', 'latitud' => 9.1500, 'longitud' => -64.1000],
                ['nombre' => 'Urica', 'codigo' => 'VE-B-FRE-03', 'capital' => 'Urica', 'latitud' => 9.7167, 'longitud' => -64.3000],
            ],
            'Anzoátegui|Píritu' => [
                ['nombre' => 'Píritu', 'codigo' => 'VE-B-PIR-01', 'capital' => 'Píritu', 'latitud' => 10.0500, 'longitud' => -65.0333],
                ['nombre' => 'San Antonio', 'codigo' => 'VE-B-PIR-02', 'capital' => 'San Antonio', 'latitud' => 10.0100, 'longitud' => -65.0500],
            ],
            'Anzoátegui|San José de Guanipa' => [
                ['nombre' => 'San José de Guanipa', 'codigo' => 'VE-B-GUA-01', 'capital' => 'El Tigrito', 'latitud' => 8.8833, 'longitud' => -64.1667],
            ],
            'Anzoátegui|Fernando de Peñalver' => [
                ['nombre' => 'Puerto Píritu', 'codigo' => 'VE-B-PEN-01', 'capital' => 'Puerto Píritu', 'latitud' => 10.0667, 'longitud' => -65.1333],
                ['nombre' => 'San Miguel', 'codigo' => 'VE-B-PEN-02', 'capital' => 'San Miguel', 'latitud' => 9.9500, 'longitud' => -65.1500],
                ['nombre' => 'Sucre', 'codigo' => 'VE-B-PEN-03', 'capital' => 'El Viñedo', 'latitud' => 10.0200, 'longitud' => -65.1100],
            ],

            // 4. Apure
            'Apure|San Fernando' => [
                ['nombre' => 'San Fernando', 'codigo' => 'VE-C-SFE-01', 'capital' => 'San Fernando de Apure', 'latitud' => 7.8878, 'longitud' => -67.4724],
                ['nombre' => 'El Recreo', 'codigo' => 'VE-C-SFE-02', 'capital' => 'El Recreo', 'latitud' => 7.8600, 'longitud' => -67.4200],
                ['nombre' => 'Peñalver', 'codigo' => 'VE-C-SFE-03', 'capital' => 'Arichuna', 'latitud' => 7.9167, 'longitud' => -67.2833],
                ['nombre' => 'San Rafael de Atamaica', 'codigo' => 'VE-C-SFE-04', 'capital' => 'San Rafael de Atamaica', 'latitud' => 7.6333, 'longitud' => -67.4833],
            ],
            'Apure|Biruaca' => [
                ['nombre' => 'Biruaca', 'codigo' => 'VE-C-BIR-01', 'capital' => 'Biruaca', 'latitud' => 7.8500, 'longitud' => -67.5167],
            ],
            'Apure|Páez' => [
                ['nombre' => 'Guasdualito', 'codigo' => 'VE-C-PAE-01', 'capital' => 'Guasdualito', 'latitud' => 7.2414, 'longitud' => -70.7325],
                ['nombre' => 'Aramendi', 'codigo' => 'VE-C-PAE-02', 'capital' => 'Palmarito', 'latitud' => 7.5667, 'longitud' => -70.4333],
                ['nombre' => 'El Amparo', 'codigo' => 'VE-C-PAE-03', 'capital' => 'El Amparo', 'latitud' => 7.0833, 'longitud' => -70.7500],
                ['nombre' => 'San Camilo', 'codigo' => 'VE-C-PAE-04', 'capital' => 'El Nula', 'latitud' => 7.2833, 'longitud' => -71.5500],
                ['nombre' => 'Urdaneta', 'codigo' => 'VE-C-PAE-05', 'capital' => 'La Victoria', 'latitud' => 7.2167, 'longitud' => -70.9167],
            ],
            'Apure|Achaguas' => [
                ['nombre' => 'Achaguas', 'codigo' => 'VE-C-ACH-01', 'capital' => 'Achaguas', 'latitud' => 7.7667, 'longitud' => -68.2333],
                ['nombre' => 'Apurito', 'codigo' => 'VE-C-ACH-02', 'capital' => 'Apurito', 'latitud me' => 7.9167, 'longitud' => -68.4667],
                ['nombre' => 'El Yagual', 'codigo' => 'VE-C-ACH-03', 'capital' => 'El Yagual', 'latitud' => 7.5500, 'longitud' => -68.4167],
                ['nombre' => 'Guachara', 'codigo' => 'VE-C-ACH-04', 'capital' => 'Guachara', 'latitud' => 7.5000, 'longitud' => -68.7500],
                ['nombre' => 'Mucuritas', 'codigo' => 'VE-C-ACH-05', 'capital' => 'El Samán', 'latitud' => 7.8333, 'longitud' => -68.6667],
            ],
            'Apure|Muñoz' => [
                ['nombre' => 'Bruzual', 'codigo' => 'VE-C-MUN-01', 'capital' => 'Bruzual', 'latitud' => 8.0500, 'longitud' => -69.3333],
                ['nombre' => 'Mantecal', 'codigo' => 'VE-C-MUN-02', 'capital' => 'Mantecal', 'latitud' => 7.5667, 'longitud' => -69.1333],
                ['nombre' => 'Quintero', 'codigo' => 'VE-C-MUN-03', 'capital' => 'Quintero', 'latitud' => 7.9500, 'longitud' => -69.1667],
            ],
            'Apure|Pedro Camejo' => [
                ['nombre' => 'San Juan de Payara', 'codigo' => 'VE-C-PCA-01', 'capital' => 'San Juan de Payara', 'latitud' => 7.3333, 'longitud' => -67.6000],
                ['nombre' => 'Codazzi', 'codigo' => 'VE-C-PCA-02', 'capital' => 'Puerto Páez', 'latitud' => 6.2000, 'longitud' => -67.4500],
                ['nombre' => 'Cunaviche', 'codigo' => 'VE-C-PCA-03', 'capital' => 'Cunaviche', 'latitud' => 7.3833, 'longitud' => -67.4500],
            ],
            'Apure|Rómulo Gallegos' => [
                ['nombre' => 'Elorza', 'codigo' => 'VE-C-RGA-01', 'capital' => 'Elorza', 'latitud' => 7.0667, 'longitud' => -69.5000],
                ['nombre' => 'La Trinidad', 'codigo' => 'VE-C-RGA-02', 'capital' => 'La Trinidad', 'latitud' => 7.1500, 'longitud' => -69.3500],
            ],

            // 5. Aragua
            'Aragua|Girardot' => [
                ['nombre' => 'Pedro José Ovalles', 'codigo' => 'VE-D-GIR-01', 'capital' => 'Pedro José Ovalles', 'latitud' => 10.2189, 'longitud' => -67.5850],
                ['nombre' => 'Joaquín Crespo', 'codigo' => 'VE-D-GIR-02', 'capital' => 'Joaquín Crespo', 'latitud' => 10.2300, 'longitud' => -67.5750],
                ['nombre' => 'José Casanova Godoy', 'codigo' => 'VE-D-GIR-03', 'capital' => 'José Casanova Godoy', 'latitud' => 10.2220, 'longitud' => -67.6000],
                ['nombre' => 'Madre María de San José', 'codigo' => 'VE-D-GIR-04', 'capital' => 'Madre María', 'latitud' => 10.2450, 'longitud' => -67.5920],
                ['nombre' => 'Andrés Eloy Blanco', 'codigo' => 'VE-D-GIR-05', 'capital' => 'Andrés Eloy Blanco', 'latitud' => 10.2380, 'longitud' => -67.6100],
                ['nombre' => 'Los Tacarigua', 'codigo' => 'VE-D-GIR-06', 'capital' => 'Los Tacarigua', 'latitud' => 10.2280, 'longitud' => -67.6250],
                ['nombre' => 'Las Delicias', 'codigo' => 'VE-D-GIR-07', 'capital' => 'Las Delicias', 'latitud' => 10.2700, 'longitud' => -67.5800],
                ['nombre' => 'Choroní', 'codigo' => 'VE-D-GIR-08', 'capital' => 'Choroní', 'latitud' => 10.4917, 'longitud' => -67.5722],
            ],
            'Aragua|Mario Briceño Iragorry' => [
                ['nombre' => 'El Limón', 'codigo' => 'VE-D-MBI-01', 'capital' => 'El Limón', 'latitud' => 10.3056, 'longitud' => -67.6322],
                ['nombre' => 'Caña de Azúcar', 'codigo' => 'VE-D-MBI-02', 'capital' => 'Caña de Azúcar', 'latitud' => 10.2778, 'longitud' => -67.6361],
            ],
            'Aragua|Santiago Mariño' => [
                ['nombre' => 'Turmero', 'codigo' => 'VE-D-SMA-01', 'capital' => 'Turmero', 'latitud' => 10.2289, 'longitud' => -67.4744],
                ['nombre' => 'Chuao', 'codigo' => 'VE-D-SMA-02', 'capital' => 'Chuao', 'latitud' => 10.4944, 'longitud' => -67.5306],
                ['nombre' => 'Samán de Güere', 'codigo' => 'VE-D-SMA-03', 'capital' => 'Samán de Güere', 'latitud' => 10.2194, 'longitud' => -67.5194],
                ['nombre' => 'Alfredo Pacheco Miranda', 'codigo' => 'VE-D-SMA-04', 'capital' => 'San Mateo', 'latitud' => 10.2083, 'longitud' => -67.4944],
            ],
            'Aragua|José Félix Ribas' => [
                ['nombre' => 'La Victoria', 'codigo' => 'VE-D-JFR-01', 'capital' => 'La Victoria', 'latitud' => 10.2264, 'longitud' => -67.3314],
                ['nombre' => 'Castor Nieves Ríos', 'codigo' => 'VE-D-JFR-02', 'capital' => 'La Victoria', 'latitud' => 10.2350, 'longitud' => -67.3400],
                ['nombre' => 'Las Delicias', 'codigo' => 'VE-D-JFR-03', 'capital' => 'Las Delicias', 'latitud' => 10.2400, 'longitud' => -67.3200],
                ['nombre' => 'Pao de Zárate', 'codigo' => 'VE-D-JFR-04', 'capital' => 'Pao de Zárate', 'latitud' => 10.1500, 'longitud' => -67.2800],
                ['nombre' => 'Zuata', 'codigo' => 'VE-D-JFR-05', 'capital' => 'Zuata', 'latitud' => 10.1900, 'longitud' => -67.3500],
            ],
            'Aragua|Sucre' => [
                ['nombre' => 'Cagua', 'codigo' => 'VE-D-SUC-01', 'capital' => 'Cagua', 'latitud' => 10.1858, 'longitud' => -67.4592],
                ['nombre' => 'Bella Vista', 'codigo' => 'VE-D-SUC-02', 'capital' => 'Bella Vista', 'latitud' => 10.1700, 'longitud' => -67.4400],
            ],
            'Aragua|Zamora' => [
                ['nombre' => 'Villa de Cura', 'codigo' => 'VE-D-ZAM-01', 'capital' => 'Villa de Cura', 'latitud' => 10.0389, 'longitud' => -67.4881],
                ['nombre' => 'Magdalena', 'codigo' => 'VE-D-ZAM-02', 'capital' => 'Magdalena', 'latitud' => 10.0800, 'longitud' => -67.5200],
                ['nombre' => 'San Francisco de Asís', 'codigo' => 'VE-D-ZAM-03', 'capital' => 'San Francisco de Asís', 'latitud' => 10.0900, 'longitud' => -67.5500],
                ['nombre' => 'Valles de Tucutunemo', 'codigo' => 'VE-D-ZAM-04', 'capital' => 'Los Bagres', 'latitud' => 10.0000, 'longitud' => -67.4300],
            ],
            'Aragua|Libertador' => [
                ['nombre' => 'Palo Negro', 'codigo' => 'VE-D-LIB-01', 'capital' => 'Palo Negro', 'latitud' => 10.1742, 'longitud' => -67.5517],
                ['nombre' => 'San Martín de Porres', 'codigo' => 'VE-D-LIB-02', 'capital' => 'La Pica', 'latitud' => 10.1600, 'longitud' => -67.5700],
            ],
            'Aragua|José Ángel Lamas' => [
                ['nombre' => 'Santa Cruz', 'codigo' => 'VE-D-JAL-01', 'capital' => 'Santa Cruz', 'latitud' => 10.1833, 'longitud' => -67.5167],
            ],
            'Aragua|Bolívar' => [
                ['nombre' => 'San Mateo', 'codigo' => 'VE-D-BOL-01', 'capital' => 'San Mateo', 'latitud' => 10.2139, 'longitud' => -67.4250],
            ],
            'Aragua|Santos Michelena' => [
                ['nombre' => 'Las Tejerías', 'codigo' => 'VE-D-SMI-01', 'capital' => 'Las Tejerías', 'latitud' => 10.2500, 'longitud' => -67.1833],
                ['nombre' => 'Tiara', 'codigo' => 'VE-D-SMI-02', 'capital' => 'Tiara', 'latitud' => 10.1800, 'longitud' => -67.1500],
            ],
            'Aragua|Tovar' => [
                ['nombre' => 'Colonia Tovar', 'codigo' => 'VE-D-TOV-01', 'capital' => 'Colonia Tovar', 'latitud' => 10.4000, 'longitud' => -67.2833],
            ],
            'Aragua|Ocumare de la Costa de Oro' => [
                ['nombre' => 'Ocumare de la Costa', 'codigo' => 'VE-D-OCO-01', 'capital' => 'Ocumare de la Costa', 'latitud' => 10.4567, 'longitud' => -67.7692],
            ],

            // 6. Barinas
            'Barinas|Barinas' => [
                ['nombre' => 'Barinas', 'codigo' => 'VE-E-BAR-01', 'capital' => 'Barinas', 'latitud' => 8.6226, 'longitud' => -70.2075],
                ['nombre' => 'Alto Barinas', 'codigo' => 'VE-E-BAR-02', 'capital' => 'Alto Barinas', 'latitud' => 8.6100, 'longitud' => -70.2400],
                ['nombre' => 'Torunos', 'codigo' => 'VE-E-BAR-03', 'capital' => 'Torunos', 'latitud' => 8.5000, 'longitud' => -70.1500],
                ['nombre' => 'San Silvestre', 'codigo' => 'VE-E-BAR-04', 'capital' => 'San Silvestre', 'latitud' => 8.2833, 'longitud' => -70.0167],
                ['nombre' => 'Santa Inés', 'codigo' => 'VE-E-BAR-05', 'capital' => 'Santa Inés', 'latitud' => 8.4333, 'longitud' => -69.8833],
                ['nombre' => 'Santa Lucía', 'codigo' => 'VE-E-BAR-06', 'capital' => 'Santa Lucía', 'latitud' => 8.5833, 'longitud' => -69.9500],
            ],
            'Barinas|Alberto Arvelo Torrealba' => [
                ['nombre' => 'Sabaneta', 'codigo' => 'VE-E-AAT-01', 'capital' => 'Sabaneta', 'latitud' => 8.7667, 'longitud' => -69.9333],
                ['nombre' => 'Rodríguez Domínguez', 'codigo' => 'VE-E-AAT-02', 'capital' => 'Vegón de Dolores', 'latitud' => 8.8200, 'longitud' => -69.8800],
            ],
            'Barinas|Pedraza' => [
                ['nombre' => 'Ciudad Bolivia', 'codigo' => 'VE-E-PED-01', 'capital' => 'Ciudad Bolivia', 'latitud' => 8.3500, 'longitud' => -70.5667],
                ['nombre' => 'José Ignacio del Pumar', 'codigo' => 'VE-E-PED-02', 'capital' => 'Pinta', 'latitud' => 8.2000, 'longitud' => -70.4000],
                ['nombre' => 'Pedro Briceño Méndez', 'codigo' => 'VE-E-PED-03', 'capital' => 'Caparo', 'latitud' => 7.9833, 'longitud' => -70.7833],
            ],
            'Barinas|Antonio José de Sucre' => [
                ['nombre' => 'Socopó', 'codigo' => 'VE-E-AJS-01', 'capital' => 'Socopó', 'latitud' => 8.2333, 'longitud' => -70.8333],
                ['nombre' => 'Nicolás Pulido', 'codigo' => 'VE-E-AJS-02', 'capital' => 'Chameta', 'latitud' => 8.1667, 'longitud' => -70.9167],
            ],
            'Barinas|Cruz Paredes' => [
                ['nombre' => 'Barrancas', 'codigo' => 'VE-E-CPA-01', 'capital' => 'Barrancas', 'latitud' => 8.7500, 'longitud' => -70.1833],
                ['nombre' => 'El Socorro', 'codigo' => 'VE-E-CPA-02', 'capital' => 'La Caramuca', 'latitud' => 8.7000, 'longitud' => -70.2200],
            ],

            // 7. Bolívar
            'Bolívar|Caroní' => [
                ['nombre' => 'Cachamay', 'codigo' => 'VE-F-CAR-01', 'capital' => 'Puerto Ordaz', 'latitud' => 8.3000, 'longitud' => -62.7167],
                ['nombre' => 'Chirica', 'codigo' => 'VE-F-CAR-02', 'capital' => 'San Félix', 'latitud' => 8.3333, 'longitud' => -62.6333],
                ['nombre' => 'Dalla Costa', 'codigo' => 'VE-F-CAR-03', 'capital' => 'San Félix', 'latitud' => 8.3500, 'longitud' => -62.6167],
                ['nombre' => '11 de Abril', 'codigo' => 'VE-F-CAR-04', 'capital' => 'San Félix', 'latitud' => 8.3667, 'longitud' => -62.6000],
                ['nombre' => 'Simón Bolívar', 'codigo' => 'VE-F-CAR-05', 'capital' => 'San Félix', 'latitud' => 8.3700, 'longitud' => -62.6200],
                ['nombre' => 'Unare', 'codigo' => 'VE-F-CAR-06', 'capital' => 'Puerto Ordaz', 'latitud' => 8.2833, 'longitud' => -62.7667],
                ['nombre' => 'Universidad', 'codigo' => 'VE-F-CAR-07', 'capital' => 'Puerto Ordaz', 'latitud' => 8.2900, 'longitud' => -62.7300],
                ['nombre' => 'Vista Hermosa', 'codigo' => 'VE-F-CAR-08', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1167, 'longitud' => -63.5333],
            ],
            'Bolívar|Angostura del Orinoco' => [
                ['nombre' => 'Catedral', 'codigo' => 'VE-F-AOR-01', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1292, 'longitud' => -63.5408],
                ['nombre' => 'Agua Salada', 'codigo' => 'VE-F-AOR-02', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1100, 'longitud' => -63.5600],
                ['nombre' => 'La Sabanita', 'codigo' => 'VE-F-AOR-03', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1000, 'longitud' => -63.5500],
                ['nombre' => 'Marhuanta', 'codigo' => 'VE-F-AOR-04', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1300, 'longitud' => -63.4800],
            ],
            'Bolívar|Piar' => [
                ['nombre' => 'Upata', 'codigo' => 'VE-F-PIA-01', 'capital' => 'Upata', 'latitud' => 8.0167, 'longitud' => -62.4000],
                ['nombre' => 'Andrés Eloy Blanco', 'codigo' => 'VE-F-PIA-02', 'capital' => 'El Pao', 'latitud' => 8.0833, 'longitud' => -62.6333],
                ['nombre' => 'Pedro Cova', 'codigo' => 'VE-F-PIA-03', 'capital' => 'El Manteco', 'latitud' => 7.3333, 'longitud' => -62.5000],
            ],
            'Bolívar|Sifontes' => [
                ['nombre' => 'Tumeremo', 'codigo' => 'VE-F-SIF-01', 'capital' => 'Tumeremo', 'latitud' => 7.3000, 'longitud' => -61.5000],
                ['nombre' => 'Dalla Costa', 'codigo' => 'VE-F-SIF-02', 'capital' => 'El Dorado', 'latitud' => 6.7167, 'longitud' => -61.6167],
                ['nombre' => 'San Isidro', 'codigo' => 'VE-F-SIF-03', 'capital' => 'Las Claritas', 'latitud' => 6.1833, 'longitud' => -61.4667],
            ],
            'Bolívar|Gran Sabana' => [
                ['nombre' => 'Santa Elena de Uairén', 'codigo' => 'VE-F-GSA-01', 'capital' => 'Santa Elena de Uairén', 'latitud' => 4.6000, 'longitud' => -61.1083],
                ['nombre' => 'Ikabarú', 'codigo' => 'VE-F-GSA-02', 'capital' => 'Ikabarú', 'latitud' => 4.3333, 'longitud' => -61.7500],
            ],

            // 8. Carabobo
            'Carabobo|Valencia' => [
                ['nombre' => 'Candelaria', 'codigo' => 'VE-G-VAL-01', 'capital' => 'Candelaria', 'latitud' => 10.1778, 'longitud' => -68.0056],
                ['nombre' => 'Catedral', 'codigo' => 'VE-G-VAL-02', 'capital' => 'Catedral', 'latitud' => 10.1806, 'longitud' => -68.0028],
                ['nombre' => 'El Socorro', 'codigo' => 'VE-G-VAL-03', 'capital' => 'El Socorro', 'latitud' => 10.1833, 'longitud' => -68.0111],
                ['nombre' => 'Miguel Peña', 'codigo' => 'VE-G-VAL-04', 'capital' => 'Miguel Peña', 'latitud' => 10.1417, 'longitud' => -68.0167],
                ['nombre' => 'Rafael Urdaneta', 'codigo' => 'VE-G-VAL-05', 'capital' => 'Rafael Urdaneta', 'latitud' => 10.1500, 'longitud' => -67.9333],
                ['nombre' => 'San José', 'codigo' => 'VE-G-VAL-06', 'capital' => 'San José', 'latitud' => 10.2222, 'longitud' => -68.0056],
                ['nombre' => 'San Blas', 'codigo' => 'VE-G-VAL-07', 'capital' => 'San Blas', 'latitud' => 10.1750, 'longitud' => -67.9944],
                ['nombre' => 'Santa Rosa', 'codigo' => 'VE-G-VAL-08', 'capital' => 'Santa Rosa', 'latitud' => 10.1611, 'longitud' => -68.0000],
                ['nombre' => 'Urbana Negro Primero', 'codigo' => 'VE-G-VAL-09', 'capital' => 'Los Naranjos', 'latitud' => 9.9833, 'longitud' => -68.0833],
            ],
            'Carabobo|Naguanagua' => [
                ['nombre' => 'Naguanagua', 'codigo' => 'VE-G-NAG-01', 'capital' => 'Naguanagua', 'latitud' => 10.2547, 'longitud' => -68.0125],
            ],
            'Carabobo|San Diego' => [
                ['nombre' => 'San Diego', 'codigo' => 'VE-G-SDI-01', 'capital' => 'San Diego', 'latitud' => 10.2458, 'longitud' => -67.9542],
            ],
            'Carabobo|Puerto Cabello' => [
                ['nombre' => 'Bartolomé Salom', 'codigo' => 'VE-G-PCA-01', 'capital' => 'Puerto Cabello', 'latitud' => 10.4731, 'longitud' => -68.0125],
                ['nombre' => 'Democracia', 'codigo' => 'VE-G-PCA-02', 'capital' => 'Puerto Cabello', 'latitud' => 10.4650, 'longitud' => -68.0200],
                ['nombre' => 'Fraternidad', 'codigo' => 'VE-G-PCA-03', 'capital' => 'Puerto Cabello', 'latitud' => 10.4700, 'longitud' => -68.0050],
                ['nombre' => 'Goigoaza', 'codigo' => 'VE-G-PCA-04', 'capital' => 'Goigoaza', 'latitud' => 10.4500, 'longitud' => -68.0300],
                ['nombre' => 'Juan José Flores', 'codigo' => 'VE-G-PCA-05', 'capital' => 'Puerto Cabello', 'latitud' => 10.4600, 'longitud' => -68.0400],
                ['nombre' => 'Borburata', 'codigo' => 'VE-G-PCA-06', 'capital' => 'Borburata', 'latitud' => 10.4417, 'longitud' => -67.9611],
                ['nombre' => 'Patanemo', 'codigo' => 'VE-G-PCA-07', 'capital' => 'Patanemo', 'latitud' => 10.4333, 'longitud' => -67.9167],
            ],
            'Carabobo|Guacara' => [
                ['nombre' => 'Guacara', 'codigo' => 'VE-G-GUA-01', 'capital' => 'Guacara', 'latitud' => 10.2289, 'longitud' => -67.8778],
                ['nombre' => 'Yagua', 'codigo' => 'VE-G-GUA-02', 'capital' => 'Yagua', 'latitud' => 10.2667, 'longitud' => -67.8833],
                ['nombre' => 'Ciudad Alianza', 'codigo' => 'VE-G-GUA-03', 'capital' => 'Ciudad Alianza', 'latitud' => 10.2100, 'longitud' => -67.9000],
            ],
            'Carabobo|Los Guayos' => [
                ['nombre' => 'Los Guayos', 'codigo' => 'VE-G-LGU-01', 'capital' => 'Los Guayos', 'latitud' => 10.1878, 'longitud' => -67.9333],
            ],

            // 9. Cojedes
            'Cojedes|Ezequiel Zamora' => [
                ['nombre' => 'San Carlos de Austria', 'codigo' => 'VE-H-EZAM-01', 'capital' => 'San Carlos', 'latitud' => 9.6612, 'longitud' => -68.5827],
                ['nombre' => 'Juan de Ángel Ortiz', 'codigo' => 'VE-H-EZAM-02', 'capital' => 'Las Vegas', 'latitud' => 9.6800, 'longitud' => -68.5500],
                ['nombre' => 'Manuel Manrique', 'codigo' => 'VE-H-EZAM-03', 'capital' => 'Manrique', 'latitud' => 9.7833, 'longitud' => -68.5833],
            ],
            'Cojedes|Tinaquillo' => [
                ['nombre' => 'Tinaquillo', 'codigo' => 'VE-H-TIN-01', 'capital' => 'Tinaquillo', 'latitud' => 9.9186, 'longitud' => -68.3047],
            ],
            'Cojedes|Tinaco' => [
                ['nombre' => 'Tinaco', 'codigo' => 'VE-H-TCO-01', 'capital' => 'Tinaco', 'latitud' => 9.7028, 'longitud' => -68.4350],
            ],

            // 10. Delta Amacuro
            'Delta Amacuro|Tucupita' => [
                ['nombre' => 'San José', 'codigo' => 'VE-Y-TUC-01', 'capital' => 'Tucupita', 'latitud' => 9.0611, 'longitud' => -62.0494],
                ['nombre' => 'Virgen del Valle', 'codigo' => 'VE-Y-TUC-02', 'capital' => 'Tucupita', 'latitud' => 9.0700, 'longitud' => -62.0400],
                ['nombre' => 'San Rafael', 'codigo' => 'VE-Y-TUC-03', 'capital' => 'San Rafael', 'latitud' => 9.1167, 'longitud' => -62.0000],
                ['nombre' => 'José Vidal Marcano', 'codigo' => 'VE-Y-TUC-04', 'capital' => 'Hacienda del Medio', 'latitud' => 9.0400, 'longitud' => -62.0700],
            ],
            'Delta Amacuro|Pedernales' => [
                ['nombre' => 'Pedernales', 'codigo' => 'VE-Y-PED-01', 'capital' => 'Pedernales', 'latitud' => 9.9667, 'longitud' => -62.2500],
                ['nombre' => 'Luis Beltrán Prieto Figueroa', 'codigo' => 'VE-Y-PED-02', 'capital' => 'Capure', 'latitud' => 9.9167, 'longitud' => -62.2167],
            ],

            // 11. Falcón
            'Falcón|Miranda' => [
                ['nombre' => 'Santa Ana de Coro', 'codigo' => 'VE-I-MIR-01', 'capital' => 'Santa Ana de Coro', 'latitud' => 11.4042, 'longitud' => -69.6739],
                ['nombre' => 'San Antonio', 'codigo' => 'VE-I-MIR-02', 'capital' => 'Coro', 'latitud' => 11.4100, 'longitud' => -69.6800],
                ['nombre' => 'San Gabriel', 'codigo' => 'VE-I-MIR-03', 'capital' => 'Coro', 'latitud' => 11.4000, 'longitud' => -69.6600],
                ['nombre' => 'Sabaneta', 'codigo' => 'VE-I-MIR-04', 'capital' => 'Sabaneta', 'latitud' => 11.3833, 'longitud' => -69.8333],
            ],
            'Falcón|Carirubana' => [
                ['nombre' => 'Punto Fijo', 'codigo' => 'VE-I-CAR-01', 'capital' => 'Punto Fijo', 'latitud' => 11.7000, 'longitud' => -70.2000],
                ['nombre' => 'Carirubana', 'codigo' => 'VE-I-CAR-02', 'capital' => 'Carirubana', 'latitud' => 11.6833, 'longitud' => -70.1833],
                ['nombre' => 'Norte', 'codigo' => 'VE-I-CAR-03', 'capital' => 'Punto Fijo', 'latitud' => 11.7200, 'longitud' => -70.1900],
                ['nombre' => 'Punta Cardón', 'codigo' => 'VE-I-CAR-04', 'capital' => 'Punta Cardón', 'latitud' => 11.6500, 'longitud' => -70.2167],
            ],
            'Falcón|Silva' => [
                ['nombre' => 'Tucacas', 'codigo' => 'VE-I-SIL-01', 'capital' => 'Tucacas', 'latitud' => 10.8000, 'longitud' => -68.3167],
                ['nombre' => 'Boca de Aroa', 'codigo' => 'VE-I-SIL-02', 'capital' => 'Boca de Aroa', 'latitud' => 10.6833, 'longitud' => -68.3167],
            ],

            // 12. Guárico
            'Guárico|Juan Germán Roscio' => [
                ['nombre' => 'San Juan de los Morros', 'codigo' => 'VE-J-JGR-01', 'capital' => 'San Juan de los Morros', 'latitud' => 9.9111, 'longitud' => -67.3539],
                ['nombre' => 'Parapara', 'codigo' => 'VE-J-JGR-02', 'capital' => 'Parapara', 'latitud' => 9.7833, 'longitud' => -67.2833],
                ['nombre' => 'Cantagallo', 'codigo' => 'VE-J-JGR-03', 'capital' => 'Cantagallo', 'latitud' => 9.9333, 'longitud' => -67.2500],
            ],
            'Guárico|Francisco de Miranda' => [
                ['nombre' => 'Calabozo', 'codigo' => 'VE-J-FMI-01', 'capital' => 'Calabozo', 'latitud' => 8.9242, 'longitud' => -67.4294],
                ['nombre' => 'El Sombrero', 'codigo' => 'VE-J-FMI-02', 'capital' => 'El Sombrero', 'latitud' => 9.3833, 'longitud' => -67.0500],
                ['nombre' => 'El Rastro', 'codigo' => 'VE-J-FMI-03', 'capital' => 'El Rastro', 'latitud' => 9.1000, 'longitud' => -67.3833],
            ],
            'Guárico|Leonardo Infante' => [
                ['nombre' => 'Valle de la Pascua', 'codigo' => 'VE-J-LIN-01', 'capital' => 'Valle de la Pascua', 'latitud' => 9.2167, 'longitud' => -66.0167],
                ['nombre' => 'Espino', 'codigo' => 'VE-J-LIN-02', 'capital' => 'Espino', 'latitud' => 8.5667, 'longitud' => -66.0167],
            ],

            // 13. Lara
            'Lara|Iribarren' => [
                ['nombre' => 'Concepción', 'codigo' => 'VE-K-IRI-01', 'capital' => 'Barquisimeto', 'latitud' => 10.0647, 'longitud' => -69.3570],
                ['nombre' => 'Catedral', 'codigo' => 'VE-K-IRI-02', 'capital' => 'Barquisimeto', 'latitud' => 10.0680, 'longitud' => -69.3400],
                ['nombre' => 'El Cují', 'codigo' => 'VE-K-IRI-03', 'capital' => 'El Cují', 'latitud' => 10.1500, 'longitud' => -69.3333],
                ['nombre' => 'Tamaca', 'codigo' => 'VE-K-IRI-04', 'capital' => 'Tamaca', 'latitud' => 10.1833, 'longitud' => -69.3167],
                ['nombre' => 'Santa Rosa', 'codigo' => 'VE-K-IRI-05', 'capital' => 'Santa Rosa', 'latitud' => 10.0458, 'longitud' => -69.2889],
                ['nombre' => 'Unión', 'codigo' => 'VE-K-IRI-06', 'capital' => 'Barquisimeto', 'latitud' => 10.0800, 'longitud' => -69.3600],
                ['nombre' => 'Ana Soto (Juan de Villegas)', 'codigo' => 'VE-K-IRI-07', 'capital' => 'Barquisimeto Oeste', 'latitud' => 10.0500, 'longitud' => -69.4167],
                ['nombre' => 'Juárez', 'codigo' => 'VE-K-IRI-08', 'capital' => 'Río Claro', 'latitud' => 9.9167, 'longitud' => -69.3667],
                ['nombre' => 'Buena Vista', 'codigo' => 'VE-K-IRI-09', 'capital' => 'Buena Vista', 'latitud' => 9.9333, 'longitud' => -69.4833],
            ],
            'Lara|Palavecino' => [
                ['nombre' => 'Cabudare', 'codigo' => 'VE-K-PAL-01', 'capital' => 'Cabudare', 'latitud' => 10.0322, 'longitud' => -69.2611],
                ['nombre' => 'José Gregorio Bastidas', 'codigo' => 'VE-K-PAL-02', 'capital' => 'Los Rastrojos', 'latitud' => 10.0167, 'longitud' => -69.2333],
                ['nombre' => 'Agua Viva', 'codigo' => 'VE-K-PAL-03', 'capital' => 'Agua Viva', 'latitud' => 10.0100, 'longitud' => -69.2800],
            ],
            'Lara|Torres' => [
                ['nombre' => 'Trinidad Samuel', 'codigo' => 'VE-K-TOR-01', 'capital' => 'Carora', 'latitud' => 10.1744, 'longitud' => -70.0786],
                ['nombre' => 'Antonio Díaz', 'codigo' => 'VE-K-TOR-02', 'capital' => 'Curarigua', 'latitud' => 10.0000, 'longitud' => -69.9333],
                ['nombre' => 'Camacaro', 'codigo' => 'VE-K-TOR-03', 'capital' => 'Río Tocuyo', 'latitud' => 10.3167, 'longitud' => -70.0000],
            ],
            'Lara|Morán' => [
                ['nombre' => 'El Tocuyo', 'codigo' => 'VE-K-MOR-01', 'capital' => 'El Tocuyo', 'latitud' => 9.7878, 'longitud' => -69.7919],
                ['nombre' => 'Humocaro Alto', 'codigo' => 'VE-K-MOR-02', 'capital' => 'Humocaro Alto', 'latitud' => 9.6000, 'longitud' => -69.9667],
                ['nombre' => 'Humocaro Bajo', 'codigo' => 'VE-K-MOR-03', 'capital' => 'Humocaro Bajo', 'latitud' => 9.6500, 'longitud' => -69.9167],
                ['nombre' => 'Guárico', 'codigo' => 'VE-K-MOR-04', 'capital' => 'Guárico', 'latitud' => 9.6833, 'longitud' => -69.8000],
            ],

            // 14. La Guaira
            'La Guaira|Vargas' => [
                ['nombre' => 'Carayaca', 'codigo' => 'VE-W-VAR-01', 'capital' => 'Carayaca', 'latitud' => 10.5361, 'longitud' => -67.1139],
                ['nombre' => 'Caraballeda', 'codigo' => 'VE-W-VAR-02', 'capital' => 'Caraballeda', 'latitud' => 10.6139, 'longitud' => -66.8528],
                ['nombre' => 'Catia La Mar', 'codigo' => 'VE-W-VAR-03', 'capital' => 'Catia La Mar', 'latitud' => 10.6056, 'longitud' => -67.0306],
                ['nombre' => 'El Junko', 'codigo' => 'VE-W-VAR-04', 'capital' => 'El Junko', 'latitud' => 10.4600, 'longitud' => -67.0700],
                ['nombre' => 'La Guaira', 'codigo' => 'VE-W-VAR-05', 'capital' => 'La Guaira', 'latitud' => 10.6000, 'longitud' => -66.9333],
                ['nombre' => 'Macuto', 'codigo' => 'VE-W-VAR-06', 'capital' => 'Macuto', 'latitud' => 10.6111, 'longitud' => -66.8972],
                ['nombre' => 'Maiquetía', 'codigo' => 'VE-W-VAR-07', 'capital' => 'Maiquetía', 'latitud' => 10.5944, 'longitud' => -66.9556],
                ['nombre' => 'Naiguatá', 'codigo' => 'VE-W-VAR-08', 'capital' => 'Naiguatá', 'latitud' => 10.6194, 'longitud' => -66.7389],
                ['nombre' => 'Caruaao', 'codigo' => 'VE-W-VAR-09', 'capital' => 'La Sabana', 'latitud' => 10.6167, 'longitud' => -66.5667],
                ['nombre' => 'Carlos Soublette', 'codigo' => 'VE-W-VAR-10', 'capital' => 'Maiquetía Este', 'latitud' => 10.5900, 'longitud' => -66.9400],
                ['nombre' => 'Urimare', 'codigo' => 'VE-W-VAR-11', 'capital' => 'Catia La Mar Este', 'latitud' => 10.6000, 'longitud' => -67.0000],
            ],

            // 15. Mérida
            'Mérida|Libertador' => [
                ['nombre' => 'El Sagrario', 'codigo' => 'VE-L-LIB-01', 'capital' => 'Mérida Centro', 'latitud' => 8.5983, 'longitud' => -71.1450],
                ['nombre' => 'Arias', 'codigo' => 'VE-L-LIB-02', 'capital' => 'Belén', 'latitud' => 8.6050, 'longitud' => -71.1400],
                ['nombre' => 'Caracciolo Parra Pérez', 'codigo' => 'VE-L-LIB-03', 'capital' => 'Mérida', 'latitud' => 8.5900, 'longitud' => -71.1600],
                ['nombre' => 'Domingo Peña', 'codigo' => 'VE-L-LIB-04', 'capital' => 'Santa Juana', 'latitud' => 8.5800, 'longitud' => -71.1550],
                ['nombre' => 'El Llano', 'codigo' => 'VE-L-LIB-05', 'capital' => 'Mérida', 'latitud' => 8.5950, 'longitud' => -71.1480],
                ['nombre' => 'Gonzalo Picón Febres', 'codigo' => 'VE-L-LIB-06', 'capital' => 'San Lázaro', 'latitud' => 8.6100, 'longitud' => -71.1350],
                ['nombre' => 'Jacinto Plaza', 'codigo' => 'VE-L-LIB-07', 'capital' => 'El Chamita', 'latitud' => 8.5667, 'longitud' => -71.1667],
                ['nombre' => 'Juan Rodríguez Suárez', 'codigo' => 'VE-L-LIB-08', 'capital' => 'La Parroquia', 'latitud' => 8.5750, 'longitud' => -71.1750],
                ['nombre' => 'Lasso de la Vega', 'codigo' => 'VE-L-LIB-09', 'capital' => 'La Pedregosa', 'latitud' => 8.5600, 'longitud' => -71.1900],
                ['nombre' => 'Milla', 'codigo' => 'VE-L-LIB-10', 'capital' => 'Milla', 'latitud' => 8.6150, 'longitud' => -71.1400],
                ['nombre' => 'Osuna Rodríguez', 'codigo' => 'VE-L-LIB-11', 'capital' => 'Los Curos', 'latitud' => 8.5650, 'longitud' => -71.1850],
                ['nombre' => 'El Morro', 'codigo' => 'VE-L-LIB-12', 'capital' => 'El Morro', 'latitud' => 8.3833, 'longitud' => -71.1333],
                ['nombre' => 'Los Nevados', 'codigo' => 'VE-L-LIB-13', 'capital' => 'Los Nevados', 'latitud' => 8.4500, 'longitud' => -71.0833],
            ],
            'Mérida|Alberto Adriani' => [
                ['nombre' => 'El Vigía', 'codigo' => 'VE-L-AAD-01', 'capital' => 'El Vigía', 'latitud' => 8.6186, 'longitud' => -71.6517],
                ['nombre' => 'Gabriel Picón González', 'codigo' => 'VE-L-AAD-02', 'capital' => 'La Palmita', 'latitud' => 8.5667, 'longitud' => -71.5500],
                ['nombre' => 'Héctor Amable Mora', 'codigo' => 'VE-L-AAD-03', 'capital' => 'Mucujepe', 'latitud' => 8.6833, 'longitud' => -71.6333],
                ['nombre' => 'Pulido Méndez', 'codigo' => 'VE-L-AAD-04', 'capital' => 'La Blanca', 'latitud' => 8.6300, 'longitud' => -71.6700],
            ],
            'Mérida|Campo Elías' => [
                ['nombre' => 'Montalbán', 'codigo' => 'VE-L-CEL-01', 'capital' => 'Ejido', 'latitud' => 8.5472, 'longitud' => -71.2408],
                ['nombre' => 'Matriz', 'codigo' => 'VE-L-CEL-02', 'capital' => 'Ejido Centro', 'latitud' => 8.5500, 'longitud' => -71.2450],
                ['nombre' => 'Acequias', 'codigo' => 'VE-L-CEL-03', 'capital' => 'Acequias', 'latitud' => 8.4167, 'longitud' => -71.2667],
                ['nombre' => 'Jají', 'codigo' => 'VE-L-CEL-04', 'capital' => 'Jají', 'latitud' => 8.5833, 'longitud' => -71.3500],
                ['nombre' => 'La Mesa', 'codigo' => 'VE-L-CEL-05', 'capital' => 'La Mesa de Ejido', 'latitud' => 8.5167, 'longitud' => -71.3000],
                ['nombre' => 'San José del Sur', 'codigo' => 'VE-L-CEL-06', 'capital' => 'San José del Sur', 'latitud' => 8.4667, 'longitud' => -71.2500],
            ],

            // 16. Miranda
            'Miranda|Guaicaipuro' => [
                ['nombre' => 'Los Teques', 'codigo' => 'VE-M-GUA-01', 'capital' => 'Los Teques', 'latitud' => 10.3444, 'longitud' => -67.0417],
                ['nombre' => 'Altagracia de la Montaña', 'codigo' => 'VE-M-GUA-02', 'capital' => 'Altagracia de la Montaña', 'latitud' => 10.1500, 'longitud' => -67.0500],
                ['nombre' => 'Cecilio Acosta', 'codigo' => 'VE-M-GUA-03', 'capital' => 'San Diego de los Altos', 'latitud' => 10.3833, 'longitud' => -66.9333],
                ['nombre' => 'El Jarillo', 'codigo' => 'VE-M-GUA-04', 'capital' => 'El Jarillo', 'latitud' => 10.3667, 'longitud' => -67.1667],
                ['nombre' => 'San Pedro', 'codigo' => 'VE-M-GUA-05', 'capital' => 'San Pedro de los Altos', 'latitud' => 10.3333, 'longitud' => -67.0833],
                ['nombre' => 'Tácata', 'codigo' => 'VE-M-GUA-06', 'capital' => 'Tácata', 'latitud' => 10.2000, 'longitud' => -67.0000],
                ['nombre' => 'Paracotos', 'codigo' => 'VE-M-GUA-07', 'capital' => 'Paracotos', 'latitud' => 10.2667, 'longitud' => -66.9500],
            ],
            'Miranda|Chacao' => [
                ['nombre' => 'Chacao', 'codigo' => 'VE-M-CHA-01', 'capital' => 'Chacao', 'latitud' => 10.4961, 'longitud' => -66.8522],
            ],
            'Miranda|Baruta' => [
                ['nombre' => 'Nuestra Señora del Rosario de Baruta', 'codigo' => 'VE-M-BAR-01', 'capital' => 'Baruta', 'latitud' => 10.4344, 'longitud' => -66.8742],
                ['nombre' => 'El Cafetal', 'codigo' => 'VE-M-BAR-02', 'capital' => 'El Cafetal', 'latitud' => 10.4667, 'longitud' => -66.8333],
                ['nombre' => 'Las Minas de Baruta', 'codigo' => 'VE-M-BAR-03', 'capital' => 'Las Minas', 'latitud' => 10.4300, 'longitud' => -66.8500],
            ],
            'Miranda|Sucre' => [
                ['nombre' => 'Petare', 'codigo' => 'VE-M-SUC-01', 'capital' => 'Petare', 'latitud' => 10.4800, 'longitud' => -66.8083],
                ['nombre' => 'Caucagüita', 'codigo' => 'VE-M-SUC-02', 'capital' => 'Caucagüita', 'latitud' => 10.4833, 'longitud' => -66.7500],
                ['nombre' => 'Filas de Mariche', 'codigo' => 'VE-M-SUC-03', 'capital' => 'Mariche', 'latitud' => 10.4500, 'longitud' => -66.7667],
                ['nombre' => 'La Dolorita', 'codigo' => 'VE-M-SUC-04', 'capital' => 'La Dolorita', 'latitud' => 10.4700, 'longitud' => -66.7800],
                ['nombre' => 'Leoncio Martínez', 'codigo' => 'VE-M-SUC-05', 'capital' => 'Los Dos Caminos', 'latitud' => 10.4950, 'longitud' => -66.8300],
            ],
            'Miranda|Plaza' => [
                ['nombre' => 'Guarenas', 'codigo' => 'VE-M-PLA-01', 'capital' => 'Guarenas', 'latitud' => 10.4636, 'longitud' => -66.6133],
            ],
            'Miranda|Zamora' => [
                ['nombre' => 'Guatire', 'codigo' => 'VE-M-ZAM-01', 'capital' => 'Guatire', 'latitud' => 10.4722, 'longitud' => -66.5414],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-M-ZAM-02', 'capital' => 'Araira', 'latitud' => 10.4667, 'longitud' => -66.4833],
            ],
            'Miranda|El Hatillo' => [
                ['nombre' => 'El Hatillo', 'codigo' => 'VE-M-HAT-01', 'capital' => 'El Hatillo', 'latitud' => 10.4261, 'longitud' => -66.8258],
            ],
            'Miranda|Carrizal' => [
                ['nombre' => 'Carrizal', 'codigo' => 'VE-M-CAR-01', 'capital' => 'Carrizal', 'latitud' => 10.3500, 'longitud' => -66.9833],
            ],
            'Miranda|Los Salias' => [
                ['nombre' => 'San Antonio de los Altos', 'codigo' => 'VE-M-LSA-01', 'capital' => 'San Antonio de los Altos', 'latitud' => 10.3700, 'longitud' => -66.9600],
            ],
            'Miranda|Cristóbal Rojas' => [
                ['nombre' => 'Charallave', 'codigo' => 'VE-M-CRO-01', 'capital' => 'Charallave', 'latitud' => 10.2467, 'longitud' => -66.8622],
                ['nombre' => 'Las Brisas', 'codigo' => 'VE-M-CRO-02', 'capital' => 'Las Brisas', 'latitud' => 10.2700, 'longitud' => -66.8800],
            ],
            'Miranda|Urdaneta' => [
                ['nombre' => 'Cúa', 'codigo' => 'VE-M-URD-01', 'capital' => 'Cúa', 'latitud' => 10.1633, 'longitud' => -66.8847],
                ['nombre' => 'Nueva Cúa', 'codigo' => 'VE-M-URD-02', 'capital' => 'Nueva Cúa', 'latitud' => 10.1500, 'longitud' => -66.8400],
            ],
            'Miranda|Independencia' => [
                ['nombre' => 'Santa Teresa del Tuy', 'codigo' => 'VE-M-IND-01', 'capital' => 'Santa Teresa del Tuy', 'latitud' => 10.2333, 'longitud' => -66.6667],
                ['nombre' => 'El Cartanal', 'codigo' => 'VE-M-IND-02', 'capital' => 'El Cartanal', 'latitud' => 10.2167, 'longitud' => -66.7167],
            ],
            'Miranda|Brión' => [
                ['nombre' => 'Higuerote', 'codigo' => 'VE-M-BRI-01', 'capital' => 'Higuerote', 'latitud' => 10.4833, 'longitud' => -66.1000],
                ['nombre' => 'Curiepe', 'codigo' => 'VE-M-BRI-02', 'capital' => 'Curiepe', 'latitud' => 10.4833, 'longitud' => -66.1667],
                ['nombre' => 'Tacarigua', 'codigo' => 'VE-M-BRI-03', 'capital' => 'Tacarigua de Brión', 'latitud' => 10.4000, 'longitud' => -66.1500],
            ],
            'Miranda|Páez' => [
                ['nombre' => 'Río Chico', 'codigo' => 'VE-M-PAE-01', 'capital' => 'Río Chico', 'latitud' => 10.3167, 'longitud' => -65.9833],
                ['nombre' => 'El Guapo', 'codigo' => 'VE-M-PAE-02', 'capital' => 'El Guapo', 'latitud' => 10.1833, 'longitud' => -65.9833],
                ['nombre' => 'Paparo', 'codigo' => 'VE-M-PAE-03', 'capital' => 'Paparo', 'latitud' => 10.3833, 'longitud' => -65.9500],
                ['nombre' => 'Tacarigua de la Laguna', 'codigo' => 'VE-M-PAE-04', 'capital' => 'Tacarigua de la Laguna', 'latitud' => 10.2667, 'longitud' => -65.8167],
            ],

            // 17. Monagas
            'Monagas|Maturín' => [
                ['nombre' => 'San Simón', 'codigo' => 'VE-N-MAT-01', 'capital' => 'Maturín Centro', 'latitud' => 9.7500, 'longitud' => -63.1833],
                ['nombre' => 'Alto de Los Godos', 'codigo' => 'VE-N-MAT-02', 'capital' => 'Los Godos', 'latitud' => 9.7400, 'longitud' => -63.2000],
                ['nombre' => 'Boquerón', 'codigo' => 'VE-N-MAT-03', 'capital' => 'Boquerón', 'latitud' => 9.7900, 'longitud' => -63.1700],
                ['nombre' => 'Las Cocuizas', 'codigo' => 'VE-N-MAT-04', 'capital' => 'Las Cocuizas', 'latitud' => 9.7600, 'longitud' => -63.1400],
                ['nombre' => 'Santa Cruz', 'codigo' => 'VE-N-MAT-05', 'capital' => 'Santa Cruz de Maturín', 'latitud' => 9.7300, 'longitud' => -63.2200],
                ['nombre' => 'Jusepín', 'codigo' => 'VE-N-MAT-06', 'capital' => 'Jusepín', 'latitud' => 9.7500, 'longitud' => -63.4833],
                ['nombre' => 'El Corozo', 'codigo' => 'VE-N-MAT-07', 'capital' => 'El Corozo', 'latitud' => 9.6833, 'longitud' => -63.3500],
                ['nombre' => 'El Tejero', 'codigo' => 'VE-N-MAT-08', 'capital' => 'El Tejero', 'latitud' => 9.6667, 'longitud' => -63.5333],
                ['nombre' => 'San Vicente', 'codigo' => 'VE-N-MAT-09', 'capital' => 'San Vicente', 'latitud' => 9.7833, 'longitud' => -63.3167],
            ],
            'Monagas|Ezequiel Zamora' => [
                ['nombre' => 'Punta de Mata', 'codigo' => 'VE-N-EZAM-01', 'capital' => 'Punta de Mata', 'latitud' => 9.7028, 'longitud' => -63.6300],
                ['nombre' => 'El Tejero', 'codigo' => 'VE-N-EZAM-02', 'capital' => 'El Tejero', 'latitud' => 9.6667, 'longitud' => -63.5333],
            ],
            'Monagas|Cedeño' => [
                ['nombre' => 'Caicara de Maturín', 'codigo' => 'VE-N-CED-01', 'capital' => 'Caicara de Maturín', 'latitud' => 9.8167, 'longitud' => -63.6167],
                ['nombre' => 'Areo', 'codigo' => 'VE-N-CED-02', 'capital' => 'Areo', 'latitud' => 9.6000, 'longitud' => -63.7000],
                ['nombre' => 'San Félix', 'codigo' => 'VE-N-CED-03', 'capital' => 'San Félix de Cedeño', 'latitud' => 9.7833, 'longitud' => -63.7500],
                ['nombre' => 'Viento Fresco', 'codigo' => 'VE-N-CED-04', 'capital' => 'Viento Fresco', 'latitud' => 9.8833, 'longitud' => -63.5500],
            ],
            'Monagas|Piar' => [
                ['nombre' => 'Aragua de Maturín', 'codigo' => 'VE-N-PIA-01', 'capital' => 'Aragua de Maturín', 'latitud' => 9.9667, 'longitud' => -63.4833],
                ['nombre' => 'Aparicio', 'codigo' => 'VE-N-PIA-02', 'capital' => 'Aparicio', 'latitud' => 9.9000, 'longitud' => -63.4500],
                ['nombre' => 'Chaguaramal', 'codigo' => 'VE-N-PIA-03', 'capital' => 'Chaguaramal', 'latitud' => 10.0500, 'longitud' => -63.4500],
                ['nombre' => 'Guanaguana', 'codigo' => 'VE-N-PIA-04', 'capital' => 'Guanaguana', 'latitud' => 10.0333, 'longitud' => -63.5167],
            ],

            // 18. Nueva Esparta
            'Nueva Esparta|Mariño' => [
                ['nombre' => 'Porlamar', 'codigo' => 'VE-O-MAR-01', 'capital' => 'Porlamar', 'latitud' => 10.9581, 'longitud' => -63.8506],
            ],
            'Nueva Esparta|Maneiro' => [
                ['nombre' => 'Pampatar', 'codigo' => 'VE-O-MAN-01', 'capital' => 'Pampatar', 'latitud' => 10.9983, 'longitud' => -63.7978],
                ['nombre' => 'Aguirre', 'codigo' => 'VE-O-MAN-02', 'capital' => 'Los Cerritos', 'latitud' => 10.9800, 'longitud' => -63.8100],
            ],
            'Nueva Esparta|Arismendi' => [
                ['nombre' => 'La Asunción', 'codigo' => 'VE-O-ARI-01', 'capital' => 'La Asunción', 'latitud' => 11.0333, 'longitud' => -63.8628],
            ],
            'Nueva Esparta|Gómez' => [
                ['nombre' => 'Santa Ana', 'codigo' => 'VE-O-GOM-01', 'capital' => 'Santa Ana', 'latitud' => 11.0667, 'longitud' => -63.9167],
                ['nombre' => 'Guevara', 'codigo' => 'VE-O-GOM-02', 'capital' => 'Tacarigua', 'latitud' => 11.0500, 'longitud' => -63.9000],
                ['nombre' => 'Matasiete', 'codigo' => 'VE-O-GOM-03', 'capital' => 'La Asunción Norte', 'latitud' => 11.0800, 'longitud' => -63.8800],
                ['nombre' => 'Sucre', 'codigo' => 'VE-O-GOM-04', 'capital' => 'Altagracia', 'latitud' => 11.1000, 'longitud' => -63.9300],
            ],
            'Nueva Esparta|Antolín del Campo' => [
                ['nombre' => 'La Plaza de Paraguay', 'codigo' => 'VE-O-ADC-01', 'capital' => 'La Plaza de Paraguay', 'latitud' => 11.1000, 'longitud' => -63.8667],
            ],
            'Nueva Esparta|Díaz' => [
                ['nombre' => 'San Juan Bautista', 'codigo' => 'VE-O-DIA-01', 'capital' => 'San Juan Bautista', 'latitud' => 10.9833, 'longitud' => -63.9500],
                ['nombre' => 'Zabala', 'codigo' => 'VE-O-DIA-02', 'capital' => 'El Yaque', 'latitud' => 10.9000, 'longitud' => -63.9667],
            ],
            'Nueva Esparta|Marcano' => [
                ['nombre' => 'Juangriego', 'codigo' => 'VE-O-MCA-01', 'capital' => 'Juangriego', 'latitud' => 11.0833, 'longitud' => -63.9667],
                ['nombre' => 'Adrian', 'codigo' => 'VE-O-MCA-02', 'capital' => 'Los Millanes', 'latitud' => 11.0700, 'longitud' => -63.9800],
            ],
            'Nueva Esparta|Tubores' => [
                ['nombre' => 'Punta de Piedras', 'codigo' => 'VE-O-TUB-01', 'capital' => 'Punta de Piedras', 'latitud' => 10.9000, 'longitud' => -64.0833],
                ['nombre' => 'Los Bagres', 'codigo' => 'VE-O-TUB-02', 'capital' => 'Los Bagres', 'latitud' => 10.9333, 'longitud' => -64.0333],
            ],
            'Nueva Esparta|Península de Macanao' => [
                ['nombre' => 'Boca de Río', 'codigo' => 'VE-O-MAC-01', 'capital' => 'Boca de Río', 'latitud' => 10.9667, 'longitud' => -64.1833],
                ['nombre' => 'San Francisco', 'codigo' => 'VE-O-MAC-02', 'capital' => 'Boca de Pozo', 'latitud' => 10.9833, 'longitud' => -64.2833],
            ],
            'Nueva Esparta|Villalba' => [
                ['nombre' => 'San Pedro de Coche', 'codigo' => 'VE-O-VIL-01', 'capital' => 'San Pedro de Coche', 'latitud' => 10.7833, 'longitud' => -63.9333],
                ['nombre' => 'Vicente Fuentes', 'codigo' => 'VE-O-VIL-02', 'capital' => 'El Guamache de Coche', 'latitud' => 10.7667, 'longitud' => -63.9667],
            ],

            // 19. Portuguesa
            'Portuguesa|Páez' => [
                ['nombre' => 'Acarigua', 'codigo' => 'VE-P-PAE-01', 'capital' => 'Acarigua', 'latitud' => 9.5500, 'longitud' => -69.2000],
                ['nombre' => 'Payara', 'codigo' => 'VE-P-PAE-02', 'capital' => 'Payara', 'latitud' => 9.5833, 'longitud' => -69.0500],
                ['nombre' => 'Pito', 'codigo' => 'VE-P-PAE-03', 'capital' => 'Pito', 'latitud' => 9.4333, 'longitud' => -69.1167],
                ['nombre' => 'Ramón Peraza', 'codigo' => 'VE-P-PAE-04', 'capital' => 'Acarigua Sur', 'latitud' => 9.5300, 'longitud' => -69.1800],
            ],
            'Portuguesa|Guanare' => [
                ['nombre' => 'Guanare', 'codigo' => 'VE-P-GUA-01', 'capital' => 'Guanare', 'latitud' => 9.0417, 'longitud' => -69.7483],
                ['nombre' => 'Córdoba', 'codigo' => 'VE-P-GUA-02', 'capital' => 'Córdoba', 'latitud' => 9.1833, 'longitud' => -69.7167],
                ['nombre' => 'San José de la Montaña', 'codigo' => 'VE-P-GUA-03', 'capital' => 'San José de la Montaña', 'latitud' => 9.2500, 'longitud' => -69.8333],
                ['nombre' => 'San Juan de Guanaguanare', 'codigo' => 'VE-P-GUA-04', 'capital' => 'Guanare Este', 'latitud' => 9.0500, 'longitud' => -69.7200],
                ['nombre' => 'Virgen de la Coromoto', 'codigo' => 'VE-P-GUA-05', 'capital' => 'Quebrada de la Virgen', 'latitud' => 9.1000, 'longitud' => -69.7800],
            ],
            'Portuguesa|Araure' => [
                ['nombre' => 'Araure', 'codigo' => 'VE-P-ARA-01', 'capital' => 'Araure', 'latitud' => 9.5600, 'longitud' => -69.2136],
                ['nombre' => 'Río Acarigua', 'codigo' => 'VE-P-ARA-02', 'capital' => 'Río Acarigua', 'latitud' => 9.6167, 'longitud' => -69.2833],
            ],
            'Portuguesa|Turén' => [
                ['nombre' => 'Villa Bruzual', 'codigo' => 'VE-P-TUR-01', 'capital' => 'Villa Bruzual', 'latitud' => 9.3333, 'longitud' => -69.1167],
                ['nombre' => 'Canelones', 'codigo' => 'VE-P-TUR-02', 'capital' => 'La Misión', 'latitud' => 9.2500, 'longitud' => -69.0667],
                ['nombre' => 'Santa Cruz', 'codigo' => 'VE-P-TUR-03', 'capital' => 'Santa Cruz', 'latitud' => 9.4000, 'longitud' => -69.0333],
                ['nombre' => 'San Isidro Labrador', 'codigo' => 'VE-P-TUR-04', 'capital' => 'Colonia Agrícola', 'latitud' => 9.3000, 'longitud' => -69.1500],
            ],

            // 20. Sucre
            'Sucre|Sucre' => [
                ['nombre' => 'Altagracia', 'codigo' => 'VE-R-SUC-01', 'capital' => 'Cumaná', 'latitud' => 10.4500, 'longitud' => -64.1667],
                ['nombre' => 'Ayacucho', 'codigo' => 'VE-R-SUC-02', 'capital' => 'Cumaná', 'latitud' => 10.4600, 'longitud' => -64.1750],
                ['nombre' => 'Santa Inés', 'codigo' => 'VE-R-SUC-03', 'capital' => 'Cumaná Centro', 'latitud' => 10.4550, 'longitud' => -64.1700],
                ['nombre' => 'San Juan', 'codigo' => 'VE-R-SUC-04', 'capital' => 'San Juan', 'latitud' => 10.3500, 'longitud' => -64.1000],
                ['nombre' => 'Raúl Leoni', 'codigo' => 'VE-R-SUC-05', 'capital' => 'Puerto Santa Fe', 'latitud' => 10.2833, 'longitud' => -64.4167],
                ['nombre' => 'Valentín Valiente', 'codigo' => 'VE-R-SUC-06', 'capital' => 'Cumaná Este', 'latitud' => 10.4400, 'longitud' => -64.1500],
                ['nombre' => 'Gran Mariscal', 'codigo' => 'VE-R-SUC-07', 'capital' => 'Los Altos de Sucre', 'latitud' => 10.2500, 'longitud' => -64.3000],
            ],
            'Sucre|Bermúdez' => [
                ['nombre' => 'Santa Catalina', 'codigo' => 'VE-R-BER-01', 'capital' => 'Carúpano', 'latitud' => 10.6667, 'longitud' => -63.2500],
                ['nombre' => 'Santa Rosa', 'codigo' => 'VE-R-BER-02', 'capital' => 'Carúpano', 'latitud' => 10.6550, 'longitud' => -63.2400],
                ['nombre' => 'San José', 'codigo' => 'VE-R-BER-03', 'capital' => 'Carúpano', 'latitud' => 10.6700, 'longitud' => -63.2600],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-R-BER-04', 'capital' => 'Playa Grande', 'latitud' => 10.6500, 'longitud' => -63.2833],
            ],
            'Sucre|Valdez' => [
                ['nombre' => 'Güiria', 'codigo' => 'VE-R-VAL-01', 'capital' => 'Güiria', 'latitud' => 10.5772, 'longitud' => -62.3006],
                ['nombre' => 'Bideau', 'codigo' => 'VE-R-VAL-02', 'capital' => 'Ensenada de Cituara', 'latitud' => 10.6333, 'longitud' => -62.1500],
                ['nombre' => 'Cristóbal Colón', 'codigo' => 'VE-R-VAL-03', 'capital' => 'Macuro', 'latitud' => 10.6500, 'longitud' => -61.9333],
                ['nombre' => 'Punta de Piedras', 'codigo' => 'VE-R-VAL-04', 'capital' => 'Yaguaraparo Este', 'latitud' => 10.5833, 'longitud' => -62.4167],
            ],

            // 21. Táchira
            'Táchira|San Cristóbal' => [
                ['nombre' => 'San Cristóbal', 'codigo' => 'VE-S-SCR-01', 'capital' => 'San Cristóbal Centro', 'latitud' => 7.7669, 'longitud' => -72.2250],
                ['nombre' => 'La Concordia', 'codigo' => 'VE-S-SCR-02', 'capital' => 'La Concordia', 'latitud' => 7.7500, 'longitud' => -72.2333],
                ['nombre' => 'Pedro María Morantes', 'codigo' => 'VE-S-SCR-03', 'capital' => 'San Cristóbal Este', 'latitud' => 7.7800, 'longitud' => -72.2100],
                ['nombre' => 'San Juan Bautista', 'codigo' => 'VE-S-SCR-04', 'capital' => 'San Juan Bautista', 'latitud' => 7.7700, 'longitud' => -72.2400],
                ['nombre' => 'Francisco Romero Lobo', 'codigo' => 'VE-S-SCR-05', 'capital' => 'Macanillo', 'latitud' => 7.8167, 'longitud' => -72.1333],
            ],
            'Táchira|Cárdenas' => [
                ['nombre' => 'Táriba', 'codigo' => 'VE-S-CAR-01', 'capital' => 'Táriba', 'latitud' => 7.8208, 'longitud' => -72.2222],
                ['nombre' => 'Amenodoro Rangel Lamus', 'codigo' => 'VE-S-CAR-02', 'capital' => 'Palo Gordo', 'latitud' => 7.8400, 'longitud' => -72.2000],
                ['nombre' => 'La Palmita', 'codigo' => 'VE-S-CAR-03', 'capital' => 'La Palmita', 'latitud' => 7.8500, 'longitud' => -72.2400],
            ],
            'Táchira|Jáuregui' => [
                ['nombre' => 'La Grita', 'codigo' => 'VE-S-JAU-01', 'capital' => 'La Grita', 'latitud' => 8.1333, 'longitud' => -71.9833],
                ['nombre' => 'Emilio Constantino Guerrero', 'codigo' => 'VE-S-JAU-02', 'capital' => 'Pueblo Hondo', 'latitud' => 8.2333, 'longitud' => -71.9000],
                ['nombre' => 'Monseñor Miguel Antonio Salas', 'codigo' => 'VE-S-JAU-03', 'capital' => 'Sabana Grande', 'latitud' => 8.1833, 'longitud' => -71.9500],
            ],
            'Táchira|Junín' => [
                ['nombre' => 'Rubio', 'codigo' => 'VE-S-JUN-01', 'capital' => 'Rubio', 'latitud' => 7.7058, 'longitud' => -72.3556],
                ['nombre' => 'Bramón', 'codigo' => 'VE-S-JUN-02', 'capital' => 'Bramón', 'latitud' => 7.6667, 'longitud' => -72.4167],
                ['nombre' => 'La Petrólea', 'codigo' => 'VE-S-JUN-03', 'capital' => 'Río Chiquito', 'latitud' => 7.5667, 'longitud' => -72.3833],
                ['nombre' => 'Quinimarí', 'codigo' => 'VE-S-JUN-04', 'capital' => 'San Vicente de la Revancha', 'latitud' => 7.5167, 'longitud' => -72.3333],
            ],
            'Táchira|Ayacucho' => [
                ['nombre' => 'San Juan de Colón', 'codigo' => 'VE-S-AYA-01', 'capital' => 'San Juan de Colón', 'latitud' => 8.0333, 'longitud' => -72.2500],
                ['nombre' => 'Rivas Dávila', 'codigo' => 'VE-S-AYA-02', 'capital' => 'San Pedro del Río', 'latitud' => 7.9667, 'longitud' => -72.2833],
                ['nombre' => 'San Pedro del Río', 'codigo' => 'VE-S-AYA-03', 'capital' => 'San Pedro del Río', 'latitud' => 7.9800, 'longitud' => -72.2900],
            ],

            // 22. Trujillo
            'Trujillo|Valera' => [
                ['nombre' => 'Juan Ignacio Montilla', 'codigo' => 'VE-T-VAL-01', 'capital' => 'Valera Centro', 'latitud' => 9.3178, 'longitud' => -70.6036],
                ['nombre' => 'La Beatriz', 'codigo' => 'VE-T-VAL-02', 'capital' => 'La Beatriz', 'latitud' => 9.3300, 'longitud' => -70.5900],
                ['nombre' => 'Mendoza Fría', 'codigo' => 'VE-T-VAL-03', 'capital' => 'Mendoza Fría', 'latitud' => 9.2500, 'longitud' => -70.6167],
                ['nombre' => 'Mercedes Díaz', 'codigo' => 'VE-T-VAL-04', 'capital' => 'Valera Este', 'latitud' => 9.3100, 'longitud' => -70.6100],
                ['nombre' => 'San Luis', 'codigo' => 'VE-T-VAL-05', 'capital' => 'San Luis', 'latitud' => 9.3400, 'longitud' => -70.6200],
            ],
            'Trujillo|Trujillo' => [
                ['nombre' => 'Matriz', 'codigo' => 'VE-T-TRU-01', 'capital' => 'Trujillo Centro', 'latitud' => 9.3667, 'longitud' => -70.4333],
                ['nombre' => 'Chiquinquirá', 'codigo' => 'VE-T-TRU-02', 'capital' => 'Trujillo Sur', 'latitud' => 9.3600, 'longitud' => -70.4400],
                ['nombre' => 'Cristóbal Mendoza', 'codigo' => 'VE-T-TRU-03', 'capital' => 'Trujillo Norte', 'latitud' => 9.3800, 'longitud' => -70.4200],
                ['nombre' => 'Cruz Carrillo', 'codigo' => 'VE-T-TRU-04', 'capital' => 'Trujillo Este', 'latitud' => 9.3700, 'longitud' => -70.4100],
                ['nombre' => 'Monseñor Carrillo', 'codigo' => 'VE-T-TRU-05', 'capital' => 'Trujillo', 'latitud' => 9.3550, 'longitud' => -70.4350],
                ['nombre' => 'San Benildo', 'codigo' => 'VE-T-TRU-06', 'capital' => 'San Benildo', 'latitud' => 9.3500, 'longitud' => -70.4500],
            ],
            'Trujillo|Boconó' => [
                ['nombre' => 'Boconó', 'codigo' => 'VE-T-BOC-01', 'capital' => 'Boconó', 'latitud' => 9.2500, 'longitud' => -70.2667],
                ['nombre' => 'El Carmen', 'codigo' => 'VE-T-BOC-02', 'capital' => 'El Carmen', 'latitud' => 9.2600, 'longitud' => -70.2700],
                ['nombre' => 'Rafael Rangel', 'codigo' => 'VE-T-BOC-03', 'capital' => 'San José de Tostós', 'latitud' => 9.1833, 'longitud' => -70.3500],
                ['nombre' => 'San José', 'codigo' => 'VE-T-BOC-04', 'capital' => 'Tostós', 'latitud' => 9.1700, 'longitud' => -70.3600],
                ['nombre' => 'San Miguel', 'codigo' => 'VE-T-BOC-05', 'capital' => 'San Miguel', 'latitud' => 9.3167, 'longitud' => -70.2167],
                ['nombre' => 'Burbusay', 'codigo' => 'VE-T-BOC-06', 'capital' => 'Burbusay', 'latitud' => 9.3833, 'longitud' => -70.2833],
                ['nombre' => 'General Rivas', 'codigo' => 'VE-T-BOC-07', 'capital' => 'Las Mesitas', 'latitud' => 9.1500, 'longitud' => -70.2000],
                ['nombre' => 'Guaramacal', 'codigo' => 'VE-T-BOC-08', 'capital' => 'Guaramacal', 'latitud' => 9.0833, 'longitud' => -70.1667],
                ['nombre' => 'Vega de Guaramacal', 'codigo' => 'VE-T-BOC-09', 'capital' => 'Vega de Guaramacal', 'latitud' => 9.0500, 'longitud' => -70.1333],
            ],

            // 23. Yaracuy
            'Yaracuy|San Felipe' => [
                ['nombre' => 'San Felipe', 'codigo' => 'VE-U-SFE-01', 'capital' => 'San Felipe', 'latitud' => 10.3397, 'longitud' => -68.7425],
                ['nombre' => 'Albarico', 'codigo' => 'VE-U-SFE-02', 'capital' => 'Albarico', 'latitud' => 10.3167, 'longitud' => -68.6833],
                ['nombre' => 'San Javier', 'codigo' => 'VE-U-SFE-03', 'capital' => 'San Javier', 'latitud' => 10.3833, 'longitud' => -68.7667],
            ],
            'Yaracuy|Independencia' => [
                ['nombre' => 'Independencia', 'codigo' => 'VE-U-IND-01', 'capital' => 'Independencia', 'latitud' => 10.3300, 'longitud' => -68.7500],
            ],
            'Yaracuy|Peña' => [
                ['nombre' => 'Yaritagua', 'codigo' => 'VE-U-PEN-01', 'capital' => 'Yaritagua', 'latitud' => 10.0786, 'longitud' => -69.1239],
                ['nombre' => 'San Andrés', 'codigo' => 'VE-U-PEN-02', 'capital' => 'San Andrés', 'latitud' => 10.0333, 'longitud' => -69.0667],
            ],
            'Yaracuy|Bruzual' => [
                ['nombre' => 'Chivacoa', 'codigo' => 'VE-U-BRU-01', 'capital' => 'Chivacoa', 'latitud' => 10.1583, 'longitud' => -68.8958],
                ['nombre' => 'Campo Elías', 'codigo' => 'VE-U-BRU-02', 'capital' => 'Campo Elías', 'latitud' => 10.1833, 'longitud' => -68.8167],
            ],
            'Yaracuy|Nirgua' => [
                ['nombre' => 'Nirgua', 'codigo' => 'VE-U-NIR-01', 'capital' => 'Nirgua', 'latitud' => 10.1500, 'longitud' => -68.5667],
                ['nombre' => 'Salom', 'codigo' => 'VE-U-NIR-02', 'capital' => 'Salom', 'latitud' => 10.2167, 'longitud' => -68.5000],
                ['nombre' => 'Temerla', 'codigo' => 'VE-U-NIR-03', 'capital' => 'Temerla', 'latitud' => 10.0833, 'longitud' => -68.6167],
            ],

            // 24. Zulia
            'Zulia|Maracaibo' => [
                ['nombre' => 'Olegario Villalobos', 'codigo' => 'VE-V-MAR-01', 'capital' => 'Olegario Villalobos', 'latitud' => 10.6667, 'longitud' => -71.6167],
                ['nombre' => 'Juana de Ávila', 'codigo' => 'VE-V-MAR-02', 'capital' => 'Juana de Ávila', 'latitud' => 10.6833, 'longitud' => -71.6333],
                ['nombre' => 'Coquivacoa', 'codigo' => 'VE-V-MAR-03', 'capital' => 'Coquivacoa', 'latitud' => 10.7000, 'longitud' => -71.6167],
                ['nombre' => 'Chiquinquirá', 'codigo' => 'VE-V-MAR-04', 'capital' => 'Chiquinquirá', 'latitud' => 10.6444, 'longitud' => -71.6250],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-V-MAR-05', 'capital' => 'Bolívar', 'latitud' => 10.6400, 'longitud' => -71.6100],
                ['nombre' => 'Caracciolo Parra Pérez', 'codigo' => 'VE-V-MAR-06', 'capital' => 'Caracciolo Parra Pérez', 'latitud' => 10.6639, 'longitud' => -71.6528],
                ['nombre' => 'Cacique Mara', 'codigo' => 'VE-V-MAR-07', 'capital' => 'Cacique Mara', 'latitud' => 10.6389, 'longitud' => -71.6444],
                ['nombre' => 'Santa Lucía', 'codigo' => 'VE-V-MAR-08', 'capital' => 'Santa Lucía', 'latitud' => 10.6472, 'longitud' => -71.6056],
                ['nombre' => 'Francisco Eugenio Bustamante', 'codigo' => 'VE-V-MAR-09', 'capital' => 'Francisco Eugenio Bustamante', 'latitud' => 10.6278, 'longitud' => -71.6778],
                ['nombre' => 'Idelfonso Vásquez', 'codigo' => 'VE-V-MAR-10', 'capital' => 'Idelfonso Vásquez', 'latitud' => 10.7050, 'longitud' => -71.6600],
                ['nombre' => 'San Isidro', 'codigo' => 'VE-V-MAR-11', 'capital' => 'San Isidro', 'latitud' => 10.6500, 'longitud' => -71.7200],
                ['nombre' => 'Venancio Pulgar', 'codigo' => 'VE-V-MAR-12', 'capital' => 'Venancio Pulgar', 'latitud' => 10.6800, 'longitud' => -71.6800],
                ['nombre' => 'Antonio Borjas Romero', 'codigo' => 'VE-V-MAR-13', 'capital' => 'Antonio Borjas Romero', 'latitud' => 10.6600, 'longitud' => -71.7000],
                ['nombre' => 'Manuel Dagnino', 'codigo' => 'VE-V-MAR-14', 'capital' => 'Manuel Dagnino', 'latitud' => 10.6100, 'longitud' => -71.6400],
                ['nombre' => 'Luis Hurtado Higuera', 'codigo' => 'VE-V-MAR-15', 'capital' => 'Luis Hurtado Higuera', 'latitud' => 10.6000, 'longitud' => -71.6600],
                ['nombre' => 'Cristo de Aranza', 'codigo' => 'VE-V-MAR-16', 'capital' => 'Cristo de Aranza', 'latitud' => 10.6200, 'longitud' => -71.6200],
                ['nombre' => 'Cecilio Acosta', 'codigo' => 'VE-V-MAR-17', 'capital' => 'Cecilio Acosta', 'latitud' => 10.6300, 'longitud' => -71.6350],
                ['nombre' => 'Raúl Leoni', 'codigo' => 'VE-V-MAR-18', 'capital' => 'Raúl Leoni', 'latitud' => 10.6450, 'longitud' => -71.6600],
            ],
            'Zulia|San Francisco' => [
                ['nombre' => 'San Francisco', 'codigo' => 'VE-V-SFR-01', 'capital' => 'San Francisco', 'latitud' => 10.5739, 'longitud' => -71.6500],
                ['nombre' => 'El Bajo', 'codigo' => 'VE-V-SFR-02', 'capital' => 'El Bajo', 'latitud' => 10.4833, 'longitud' => -71.6333],
                ['nombre' => 'Domitila Flores', 'codigo' => 'VE-V-SFR-03', 'capital' => 'Domitila Flores', 'latitud' => 10.5500, 'longitud' => -71.6700],
                ['nombre' => 'Francisco Ochoa', 'codigo' => 'VE-V-SFR-04', 'capital' => 'Sierra Maestra', 'latitud' => 10.5900, 'longitud' => -71.6400],
                ['nombre' => 'Los Cortijos', 'codigo' => 'VE-V-SFR-05', 'capital' => 'Los Cortijos', 'latitud' => 10.5300, 'longitud' => -71.7000],
                ['nombre' => 'Marcial Hernández', 'codigo' => 'VE-V-SFR-06', 'capital' => 'Sur América', 'latitud' => 10.5600, 'longitud' => -71.6800],
                ['nombre' => 'José Domingo Rus', 'codigo' => 'VE-V-SFR-07', 'capital' => 'Urbanización El Soler', 'latitud' => 10.5200, 'longitud' => -71.6600],
            ],
            'Zulia|Cabimas' => [
                ['nombre' => 'Ambrosio', 'codigo' => 'VE-V-CAB-01', 'capital' => 'Cabimas Norte', 'latitud' => 10.4100, 'longitud' => -71.4500],
                ['nombre' => 'Carmen Herrera', 'codigo' => 'VE-V-CAB-02', 'capital' => 'Cabimas Centro', 'latitud' => 10.3956, 'longitud' => -71.4428],
                ['nombre' => 'La Rosa', 'codigo' => 'VE-V-CAB-03', 'capital' => 'Cabimas Sur', 'latitud' => 10.3800, 'longitud' => -71.4400],
                ['nombre' => 'Germán Ríos Linares', 'codigo' => 'VE-V-CAB-04', 'capital' => 'Los Laureles', 'latitud' => 10.4200, 'longitud' => -71.4300],
                ['nombre' => 'San Benito', 'codigo' => 'VE-V-CAB-05', 'capital' => 'San Benito', 'latitud' => 10.3900, 'longitud' => -71.4200],
                ['nombre' => 'Rómulo Betancourt', 'codigo' => 'VE-V-CAB-06', 'capital' => 'Nueva Cabimas', 'latitud' => 10.3700, 'longitud' => -71.4300],
                ['nombre' => 'Jorge Hernández', 'codigo' => 'VE-V-CAB-07', 'capital' => 'El Lucero', 'latitud' => 10.3600, 'longitud' => -71.4200],
                ['nombre' => 'Punta Gorda', 'codigo' => 'VE-V-CAB-08', 'capital' => 'Punta Gorda', 'latitud' => 10.3400, 'longitud' => -71.4500],
                ['nombre' => 'Arístides Calvani', 'codigo' => 'VE-V-CAB-09', 'capital' => 'Palito Blanco', 'latitud' => 10.3500, 'longitud me' => -71.2500],
            ],
            'Zulia|Lagunillas' => [
                ['nombre' => 'Alonso de Ojeda', 'codigo' => 'VE-V-LAG-01', 'capital' => 'Ciudad Ojeda', 'latitud' => 10.2031, 'longitud' => -71.3125],
                ['nombre' => 'Libertad', 'codigo' => 'VE-V-LAG-02', 'capital' => 'Ciudad Ojeda Sur', 'latitud' => 10.1800, 'longitud' => -71.3100],
                ['nombre' => 'Campo Lara', 'codigo' => 'VE-V-LAG-03', 'capital' => 'Campo Lara', 'latitud' => 10.1500, 'longitud' => -71.1000],
                ['nombre' => 'Eleazar López Contreras', 'codigo' => 'VE-V-LAG-04', 'capital' => 'Picapica', 'latitud' => 10.2500, 'longitud' => -71.1500],
                ['nombre' => 'Venezuela', 'codigo' => 'VE-V-LAG-05', 'capital' => 'Lagunillas', 'latitud' => 10.1300, 'longitud' => -71.2500],
            ],
            'Zulia|Mara' => [
                ['nombre' => 'San Rafael del Moján', 'codigo' => 'VE-V-MARA-01', 'capital' => 'San Rafael del Moján', 'latitud' => 10.9639, 'longitud' => -71.7347],
                ['nombre' => 'La Sierrita', 'codigo' => 'VE-V-MARA-02', 'capital' => 'La Sierrita', 'latitud' => 10.8800, 'longitud' => -71.8200],
                ['nombre' => 'Tamare', 'codigo' => 'VE-V-MARA-03', 'capital' => 'Tamare', 'latitud' => 10.9200, 'longitud' => -71.7600],
                ['nombre' => 'Ricaurte', 'codigo' => 'VE-V-MARA-04', 'capital' => 'Santa Cruz de Mara', 'latitud me' => 10.8200, 'longitud' => -71.7200],
                ['nombre' => 'Luis de Vicente', 'codigo' => 'VE-V-MARA-05', 'capital' => 'Carrasquero', 'latitud' => 11.0200, 'longitud' => -71.9500],
            ],
            'Zulia|Santa Rita' => [
                ['nombre' => 'Santa Rita', 'codigo' => 'VE-V-SRI-01', 'capital' => 'Santa Rita', 'latitud' => 10.5369, 'longitud' => -71.5122],
                ['nombre' => 'El Mene', 'codigo' => 'VE-V-SRI-02', 'capital' => 'El Mene', 'latitud' => 10.5700, 'longitud' => -71.5100],
                ['nombre' => 'Pedro Lucas Urribarrí', 'codigo' => 'VE-V-SRI-03', 'capital' => 'El Guanábano', 'latitud' => 10.4500, 'longitud' => -71.3200],
                ['nombre' => 'José Cenobio Urribarrí', 'codigo' => 'VE-V-SRI-04', 'capital' => 'Palmarejo', 'latitud' => 10.6000, 'longitud' => -71.5100],
            ],
            'Zulia|Rosario de Perijá' => [
                ['nombre' => 'El Rosario', 'codigo' => 'VE-V-RPE-01', 'capital' => 'La Villa del Rosario', 'latitud' => 10.3167, 'longitud' => -72.3167],
                ['nombre' => 'Sixto Zambrano', 'codigo' => 'VE-V-RPE-02', 'capital' => 'San Ignacio', 'latitud' => 10.2000, 'longitud' => -72.4500],
                ['nombre' => 'Donaldo García', 'codigo' => 'VE-V-RPE-03', 'capital' => 'Jalisco', 'latitud' => 10.3500, 'longitud' => -72.2000],
            ],
            'Zulia|Machiques de Perijá' => [
                ['nombre' => 'Machiques', 'codigo' => 'VE-V-MPE-01', 'capital' => 'Machiques', 'latitud' => 10.0642, 'longitud' => -72.5450],
                ['nombre' => 'San José de Perijá', 'codigo' => 'VE-V-MPE-02', 'capital' => 'San José de Perijá', 'latitud' => 10.0000, 'longitud' => -72.4000],
                ['nombre' => 'Bartolomé de las Casas', 'codigo' => 'VE-V-MPE-03', 'capital' => 'Las Piedras', 'latitud' => 9.9000, 'longitud' => -72.6500],
                ['nombre' => 'Río Negro', 'codigo' => 'VE-V-MPE-04', 'capital' => 'Río Negro', 'latitud' => 9.8500, 'longitud' => -72.8000],
            ],
            'Zulia|Baralt' => [
                ['nombre' => 'San Timoteo', 'codigo' => 'VE-V-BAR-01', 'capital' => 'San Timoteo', 'latitud' => 9.7833, 'longitud' => -71.0500],
                ['nombre' => 'Mene Grande', 'codigo' => 'VE-V-BAR-02', 'capital' => 'Mene Grande', 'latitud' => 9.8167, 'longitud' => -70.9333],
                ['nombre' => 'General Urdaneta', 'codigo' => 'VE-V-BAR-03', 'capital' => 'Pueblo Nuevo del Cheral', 'latitud' => 9.7167, 'longitud' => -70.9833],
                ['nombre' => 'Libertador', 'codigo' => 'VE-V-BAR-04', 'capital' => 'El Mene', 'latitud' => 9.6833, 'longitud' => -70.8833],
                ['nombre' => 'Manuel Guanipa Matos', 'codigo' => 'VE-V-BAR-05', 'capital' => 'El Venado', 'latitud' => 9.9333, 'longitud' => -70.8000],
                ['nombre' => 'Marcelino Sanabria', 'codigo' => 'VE-V-BAR-06', 'capital' => 'El Siete', 'latitud' => 9.7500, 'longitud' => -71.1000],
            ],
            'Zulia|Miranda' => [
                ['nombre' => 'Altagracia', 'codigo' => 'VE-V-MIR-01', 'capital' => 'Los Puertos de Altagracia', 'latitud' => 10.6833, 'longitud' => -71.5167],
                ['nombre' => 'Faría', 'codigo' => 'VE-V-MIR-02', 'capital' => 'Quisiro', 'latitud' => 10.8833, 'longitud' => -71.3167],
                ['nombre' => 'Ana María Campos', 'codigo' => 'VE-V-MIR-03', 'capital' => 'El Mecocal', 'latitud' => 10.7167, 'longitud' => -71.4000],
                ['nombre' => 'San Antonio', 'codigo' => 'VE-V-MIR-04', 'capital' => 'El Consejo', 'latitud' => 10.6500, 'longitud' => -71.3500],
                ['nombre' => 'San José', 'codigo' => 'VE-V-MIR-05', 'capital' => 'Sabaneta de Palma', 'latitud' => 10.7667, 'longitud' => -71.4833],
            ],
            'Zulia|Colón' => [
                ['nombre' => 'San Carlos del Zulia', 'codigo' => 'VE-V-COL-01', 'capital' => 'San Carlos del Zulia', 'latitud' => 9.0000, 'longitud' => -71.9167],
                ['nombre' => 'Santa Cruz del Zulia', 'codigo' => 'VE-V-COL-02', 'capital' => 'Santa Cruz del Zulia', 'latitud' => 8.9667, 'longitud' => -71.8333],
                ['nombre' => 'Santa Bárbara', 'codigo' => 'VE-V-COL-03', 'capital' => 'Santa Bárbara del Zulia', 'latitud' => 8.9833, 'longitud' => -71.9167],
                ['nombre' => 'Urribarrí', 'codigo' => 'VE-V-COL-04', 'capital' => 'El Choral', 'latitud' => 9.1500, 'longitud' => -71.7500],
                ['nombre' => 'Moralito', 'codigo' => 'VE-V-COL-05', 'capital' => 'El Moralito', 'latitud' => 8.8500, 'longitud' => -71.8500],
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
                            'codigo' => $parr['codigo'] ?? null,
                            'capital' => $parr['capital'] ?? $parr['nombre'],
                            'latitud' => $parr['latitud'] ?? null,
                            'longitud' => $parr['longitud'] ?? null,
                            'activo' => true,
                        ]
                    );
                }
            }
        }
    }
}
