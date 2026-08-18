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

            // Amazonas
            'Amazonas' => [
                ['nombre' => 'Atures', 'codigo' => 'VE-Z-ATU', 'capital' => 'Puerto Ayacucho', 'latitud' => 5.6639, 'longitud' => -67.5858],
                ['nombre' => 'Autana', 'codigo' => 'VE-Z-AUT', 'capital' => 'Isla Ratón', 'latitud' => 5.1200, 'longitud' => -67.8000],
                ['nombre' => 'Atabapo', 'codigo' => 'VE-Z-ATA', 'capital' => 'San Fernando de Atabapo', 'latitud' => 4.0500, 'longitud' => -67.7000],
                ['nombre' => 'Alto Orinoco', 'codigo' => 'VE-Z-AOR', 'capital' => 'La Esmeralda', 'latitud' => 3.1736, 'longitud' => -65.5461],
                ['nombre' => 'Manapiare', 'codigo' => 'VE-Z-MAN', 'capital' => 'San Juan de Manapiare', 'latitud' => 5.3167, 'longitud' => -66.0500],
                ['nombre' => 'Maroa', 'codigo' => 'VE-Z-MAR', 'capital' => 'Maroa', 'latitud' => 2.7167, 'longitud' => -67.5500],
                ['nombre' => 'Río Negro', 'codigo' => 'VE-Z-RNE', 'capital' => 'San Carlos de Río Negro', 'latitud' => 1.9167, 'longitud' => -67.0833],
            ],

            // Anzoátegui
            'Anzoátegui' => [
                ['nombre' => 'Simón Bolívar', 'codigo' => 'VE-B-SBO', 'capital' => 'Barcelona', 'latitud' => 10.1333, 'longitud' => -64.7000],
                ['nombre' => 'Juan Antonio Sotillo', 'codigo' => 'VE-B-JAS', 'capital' => 'Puerto La Cruz', 'latitud' => 10.2167, 'longitud' => -64.6333],
                ['nombre' => 'Anaco', 'codigo' => 'VE-B-ANA', 'capital' => 'Anaco', 'latitud' => 9.4294, 'longitud' => -64.4628],
                ['nombre' => 'Simón Rodríguez', 'codigo' => 'VE-B-SRO', 'capital' => 'El Tigre', 'latitud' => 8.8867, 'longitud' => -64.2494],
                ['nombre' => 'Guanta', 'codigo' => 'VE-B-GUA', 'capital' => 'Guanta', 'latitud' => 10.2372, 'longitud' => -64.5939],
                ['nombre' => 'Diego Bautista Urbaneja', 'codigo' => 'VE-B-DBU', 'capital' => 'Lechería', 'latitud' => 10.1944, 'longitud' => -64.6931],
                ['nombre' => 'Pedro María Freites', 'codigo' => 'VE-B-FRE', 'capital' => 'Cantaura', 'latitud' => 9.3000, 'longitud' => -64.3500],
                ['nombre' => 'Píritu', 'codigo' => 'VE-B-PIR', 'capital' => 'Píritu', 'latitud' => 10.0500, 'longitud' => -65.0333],
                ['nombre' => 'San José de Guanipa', 'codigo' => 'VE-B-GUA', 'capital' => 'El Tigrito', 'latitud' => 8.8833, 'longitud' => -64.1667],
                ['nombre' => 'Fernando de Peñalver', 'codigo' => 'VE-B-PEN', 'capital' => 'Puerto Píritu', 'latitud' => 10.0667, 'longitud' => -65.1333],
            ],

            // Apure
            'Apure' => [
                ['nombre' => 'San Fernando', 'codigo' => 'VE-C-SFE', 'capital' => 'San Fernando de Apure', 'latitud' => 7.8878, 'longitud' => -67.4724],
                ['nombre' => 'Biruaca', 'codigo' => 'VE-C-BIR', 'capital' => 'Biruaca', 'latitud' => 7.8500, 'longitud' => -67.5167],
                ['nombre' => 'Páez', 'codigo' => 'VE-C-PAE', 'capital' => 'Guasdualito', 'latitud' => 7.2414, 'longitud' => -70.7325],
                ['nombre' => 'Achaguas', 'codigo' => 'VE-C-ACH', 'capital' => 'Achaguas', 'latitud' => 7.7667, 'longitud' => -68.2333],
                ['nombre' => 'Muñoz', 'codigo' => 'VE-C-MUN', 'capital' => 'Bruzual', 'latitud' => 8.0500, 'longitud' => -69.3333],
                ['nombre' => 'Pedro Camejo', 'codigo' => 'VE-C-PCA', 'capital' => 'San Juan de Payara', 'latitud' => 7.3333, 'longitud' => -67.6000],
                ['nombre' => 'Rómulo Gallegos', 'codigo' => 'VE-C-RGA', 'capital' => 'Elorza', 'latitud' => 7.0667, 'longitud' => -69.5000],
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
                ['nombre' => 'José Ángel Lamas', 'codigo' => 'VE-D-JAL', 'capital' => 'Santa Cruz', 'latitud' => 10.1833, 'longitud' => -67.5167],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-D-BOL', 'capital' => 'San Mateo', 'latitud' => 10.2139, 'longitud' => -67.4250],
                ['nombre' => 'Santos Michelena', 'codigo' => 'VE-D-SMI', 'capital' => 'Las Tejerías', 'latitud' => 10.2500, 'longitud' => -67.1833],
                ['nombre' => 'Tovar', 'codigo' => 'VE-D-TOV', 'capital' => 'Colonia Tovar', 'latitud' => 10.4000, 'longitud' => -67.2833],
                ['nombre' => 'Ocumare de la Costa de Oro', 'codigo' => 'VE-D-OCO', 'capital' => 'Ocumare de la Costa', 'latitud' => 10.4567, 'longitud' => -67.7692],
            ],

            // Barinas
            'Barinas' => [
                ['nombre' => 'Barinas', 'codigo' => 'VE-E-BAR', 'capital' => 'Barinas', 'latitud' => 8.6226, 'longitud' => -70.2075],
                ['nombre' => 'Alberto Arvelo Torrealba', 'codigo' => 'VE-E-AAT', 'capital' => 'Sabaneta', 'latitud' => 8.7667, 'longitud' => -69.9333],
                ['nombre' => 'Pedraza', 'codigo' => 'VE-E-PED', 'capital' => 'Ciudad Bolivia', 'latitud' => 8.3500, 'longitud' => -70.5667],
                ['nombre' => 'Antonio José de Sucre', 'codigo' => 'VE-E-AJS', 'capital' => 'Socopó', 'latitud' => 8.2333, 'longitud' => -70.8333],
                ['nombre' => 'Cruz Paredes', 'codigo' => 'VE-E-CPA', 'capital' => 'Barrancas', 'latitud' => 8.7500, 'longitud' => -70.1833],
                ['nombre' => 'Ezequiel Zamora', 'codigo' => 'VE-E-EZAM', 'capital' => 'Santa Bárbara', 'latitud' => 7.8333, 'longitud' => -71.1833],
                ['nombre' => 'Obispos', 'codigo' => 'VE-E-OBI', 'capital' => 'Obispos', 'latitud' => 8.6000, 'longitud' => -69.9667],
                ['nombre' => 'Rojas', 'codigo' => 'VE-E-ROJ', 'capital' => 'Libertad', 'latitud' => 8.3333, 'longitud' => -69.6667],
                ['nombre' => 'Sosa', 'codigo' => 'VE-E-SOS', 'capital' => 'Ciudad de Nutrias', 'latitud' => 8.2167, 'longitud' => -69.2500],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-E-BOL', 'capital' => 'Barinitas', 'latitud' => 8.7500, 'longitud' => -70.4167],
            ],

            // Bolívar
            'Bolívar' => [
                ['nombre' => 'Caroní', 'codigo' => 'VE-F-CAR', 'capital' => 'Ciudad Guayana', 'latitud' => 8.3611, 'longitud' => -62.6494],
                ['nombre' => 'Angostura del Orinoco', 'codigo' => 'VE-F-AOR', 'capital' => 'Ciudad Bolívar', 'latitud' => 8.1292, 'longitud' => -63.5408],
                ['nombre' => 'Piar', 'codigo' => 'VE-F-PIA', 'capital' => 'Upata', 'latitud' => 8.0167, 'longitud' => -62.4000],
                ['nombre' => 'Sifontes', 'codigo' => 'VE-F-SIF', 'capital' => 'Tumeremo', 'latitud' => 7.3000, 'longitud' => -61.5000],
                ['nombre' => 'Gran Sabana', 'codigo' => 'VE-F-GSA', 'capital' => 'Santa Elena de Uairén', 'latitud' => 4.6000, 'longitud' => -61.1083],
                ['nombre' => 'El Callao', 'codigo' => 'VE-F-ECA', 'capital' => 'El Callao', 'latitud' => 7.3500, 'longitud' => -61.8167],
                ['nombre' => 'Roscio', 'codigo' => 'VE-F-ROS', 'capital' => 'Guasipati', 'latitud' => 7.4667, 'longitud' => -61.9000],
                ['nombre' => 'Padre Pedro Chien', 'codigo' => 'VE-F-PPC', 'capital' => 'El Palmar', 'latitud' => 7.9167, 'longitud' => -61.9500],
                ['nombre' => 'Sucre', 'codigo' => 'VE-F-SUC', 'capital' => 'Maripa', 'latitud' => 7.4333, 'longitud' => -65.1667],
                ['nombre' => 'Cedeño', 'codigo' => 'VE-F-CED', 'capital' => 'Caicara del Orinoco', 'latitud' => 7.6333, 'longitud' => -66.1667],
            ],

            // Carabobo
            'Carabobo' => [
                ['nombre' => 'Valencia', 'codigo' => 'VE-G-VAL', 'capital' => 'Valencia', 'latitud' => 10.1620, 'longitud' => -68.0077],
                ['nombre' => 'Naguanagua', 'codigo' => 'VE-G-NAG', 'capital' => 'Naguanagua', 'latitud' => 10.2547, 'longitud' => -68.0125],
                ['nombre' => 'San Diego', 'codigo' => 'VE-G-SDI', 'capital' => 'San Diego', 'latitud' => 10.2458, 'longitud' => -67.9542],
                ['nombre' => 'Puerto Cabello', 'codigo' => 'VE-G-PCA', 'capital' => 'Puerto Cabello', 'latitud' => 10.4731, 'longitud' => -68.0125],
                ['nombre' => 'Guacara', 'codigo' => 'VE-G-GUA', 'capital' => 'Guacara', 'latitud' => 10.2289, 'longitud' => -67.8778],
                ['nombre' => 'Los Guayos', 'codigo' => 'VE-G-LGU', 'capital' => 'Los Guayos', 'latitud' => 10.1878, 'longitud' => -67.9333],
                ['nombre' => 'San Joaquín', 'codigo' => 'VE-G-SJO', 'capital' => 'San Joaquín', 'latitud' => 10.2667, 'longitud' => -67.7833],
                ['nombre' => 'Diego Ibarra', 'codigo' => 'VE-G-DIB', 'capital' => 'Mariara', 'latitud' => 10.2972, 'longitud' => -67.7139],
                ['nombre' => 'Carlos Arvelo', 'codigo' => 'VE-G-CAR', 'capital' => 'Güigüe', 'latitud' => 10.0833, 'longitud' => -67.7833],
                ['nombre' => 'Bejuma', 'codigo' => 'VE-G-BEJ', 'capital' => 'Bejuma', 'latitud' => 10.1736, 'longitud' => -68.2597],
                ['nombre' => 'Miranda', 'codigo' => 'VE-G-MIR', 'capital' => 'Miranda', 'latitud' => 10.1583, 'longitud' => -68.3972],
                ['nombre' => 'Montalbán', 'codigo' => 'VE-G-MON', 'capital' => 'Montalbán', 'latitud' => 10.2111, 'longitud' => -68.3264],
                ['nombre' => 'Juan José Mora', 'codigo' => 'VE-G-JJM', 'capital' => 'Morón', 'latitud' => 10.4889, 'longitud' => -68.2000],
                ['nombre' => 'Libertador', 'codigo' => 'VE-G-LIB', 'capital' => 'Tocuyito', 'latitud' => 10.1000, 'longitud' => -68.0667],
            ],

            // Cojedes
            'Cojedes' => [
                ['nombre' => 'Ezequiel Zamora', 'codigo' => 'VE-H-EZAM', 'capital' => 'San Carlos', 'latitud' => 9.6612, 'longitud' => -68.5827],
                ['nombre' => 'Tinaquillo', 'codigo' => 'VE-H-TIN', 'capital' => 'Tinaquillo', 'latitud' => 9.9186, 'longitud' => -68.3047],
                ['nombre' => 'Tinaco', 'codigo' => 'VE-H-TCO', 'capital' => 'Tinaco', 'latitud' => 9.7028, 'longitud' => -68.4350],
                ['nombre' => 'Anzoátegui', 'codigo' => 'VE-H-ANZ', 'capital' => 'Cojedes', 'latitud' => 9.6167, 'longitud' => -68.9167],
                ['nombre' => 'Pao de San Juan Bautista', 'codigo' => 'VE-H-PAO', 'capital' => 'El Pao', 'latitud' => 9.6333, 'longitud' => -68.1333],
                ['nombre' => 'Rómulo Gallegos', 'codigo' => 'VE-H-RGA', 'capital' => 'Las Vegas', 'latitud' => 9.5500, 'longitud' => -68.6167],
                ['nombre' => 'Girardot', 'codigo' => 'VE-H-GIR', 'capital' => 'El Baúl', 'latitud' => 8.9500, 'longitud' => -68.2833],
                ['nombre' => 'Ricaurte', 'codigo' => 'VE-H-RIC', 'capital' => 'Libertad', 'latitud' => 9.5167, 'longitud' => -68.5000],
                ['nombre' => 'Lima Blanco', 'codigo' => 'VE-H-LBL', 'capital' => 'Macapo', 'latitud' => 9.8000, 'longitud' => -68.3667],
            ],

            // Delta Amacuro
            'Delta Amacuro' => [
                ['nombre' => 'Tucupita', 'codigo' => 'VE-Y-TUC', 'capital' => 'Tucupita', 'latitud' => 9.0611, 'longitud' => -62.0494],
                ['nombre' => 'Pedernales', 'codigo' => 'VE-Y-PED', 'capital' => 'Pedernales', 'latitud' => 9.9667, 'longitud' => -62.2500],
                ['nombre' => 'Antonio Díaz', 'codigo' => 'VE-Y-ADI', 'capital' => 'Curiapo', 'latitud' => 8.5833, 'longitud' => -60.9667],
                ['nombre' => 'Casacoima', 'codigo' => 'VE-Y-CAS', 'capital' => 'Sierra Imataca', 'latitud' => 8.5000, 'longitud' => -62.0500],
            ],

            // Falcón
            'Falcón' => [
                ['nombre' => 'Miranda', 'codigo' => 'VE-I-MIR', 'capital' => 'Santa Ana de Coro', 'latitud' => 11.4042, 'longitud' => -69.6739],
                ['nombre' => 'Carirubana', 'codigo' => 'VE-I-CAR', 'capital' => 'Punto Fijo', 'latitud' => 11.7000, 'longitud' => -70.2000],
                ['nombre' => 'Silva', 'codigo' => 'VE-I-SIL', 'capital' => 'Tucacas', 'latitud' => 10.8000, 'longitud' => -68.3167],
                ['nombre' => 'Los Taques', 'codigo' => 'VE-I-LTA', 'capital' => 'Santa Cruz de Los Taques', 'latitud' => 11.8333, 'longitud' => -70.2667],
                ['nombre' => 'Falcón', 'codigo' => 'VE-I-FAL', 'capital' => 'Pueblo Nuevo', 'latitud' => 11.9500, 'longitud' => -69.9167],
                ['nombre' => 'Colina', 'codigo' => 'VE-I-COL', 'capital' => 'La Vela de Coro', 'latitud' => 11.4500, 'longitud' => -69.5833],
                ['nombre' => 'Dabajuro', 'codigo' => 'VE-I-DAB', 'capital' => 'Dabajuro', 'latitud' => 11.0222, 'longitud' => -70.6778],
                ['nombre' => 'Buchivacoa', 'codigo' => 'VE-I-BUC', 'capital' => 'Capatárida', 'latitud' => 11.1667, 'longitud' => -70.6167],
                ['nombre' => 'Monseñor Iturriza', 'codigo' => 'VE-I-MIT', 'capital' => 'Chichiriviche', 'latitud' => 10.9300, 'longitud' => -68.2700],
                ['nombre' => 'Zamora', 'codigo' => 'VE-I-ZAM', 'capital' => 'Puerto Cumarebo', 'latitud' => 11.4833, 'longitud' => -69.3500],
            ],

            // Guárico
            'Guárico' => [
                ['nombre' => 'Juan Germán Roscio', 'codigo' => 'VE-J-JGR', 'capital' => 'San Juan de los Morros', 'latitud' => 9.9111, 'longitud' => -67.3539],
                ['nombre' => 'Francisco de Miranda', 'codigo' => 'VE-J-FMI', 'capital' => 'Calabozo', 'latitud' => 8.9242, 'longitud' => -67.4294],
                ['nombre' => 'Leonardo Infante', 'codigo' => 'VE-J-LIN', 'capital' => 'Valle de la Pascua', 'latitud' => 9.2167, 'longitud' => -66.0167],
                ['nombre' => 'José Tadeo Monagas', 'codigo' => 'VE-J-JTM', 'capital' => 'Altagracia de Orituco', 'latitud' => 9.8639, 'longitud' => -66.3806],
                ['nombre' => 'Pedro Zaraza', 'codigo' => 'VE-J-PZA', 'capital' => 'Zaraza', 'latitud' => 9.3500, 'longitud' => -65.3333],
                ['nombre' => 'Julián Mellado', 'codigo' => 'VE-J-JME', 'capital' => 'El Sombrero', 'latitud' => 9.3833, 'longitud' => -67.0500],
                ['nombre' => 'José Félix Ribas', 'codigo' => 'VE-J-JFR', 'capital' => 'Tucupido', 'latitud' => 9.2833, 'longitud' => -65.7667],
                ['nombre' => 'Santa María de Ipire', 'codigo' => 'VE-J-SMI', 'capital' => 'Santa María de Ipire', 'latitud' => 8.8167, 'longitud' => -65.3167],
                ['nombre' => 'El Socorro', 'codigo' => 'VE-J-ESO', 'capital' => 'El Socorro', 'latitud' => 8.9833, 'longitud' => -65.7333],
                ['nombre' => 'Las Mercedes', 'codigo' => 'VE-J-LME', 'capital' => 'Las Mercedes del Llano', 'latitud' => 9.1000, 'longitud' => -66.4000],
                ['nombre' => 'San Gerónimo de Guayabal', 'codigo' => 'VE-J-SGG', 'capital' => 'Guayabal', 'latitud' => 7.9500, 'longitud' => -67.3833],
                ['nombre' => 'Esteros de Camaguán', 'codigo' => 'VE-J-ECA', 'capital' => 'Camaguán', 'latitud' => 8.1167, 'longitud' => -67.6000],
            ],

            // Lara
            'Lara' => [
                ['nombre' => 'Iribarren', 'codigo' => 'VE-K-IRI', 'capital' => 'Barquisimeto', 'latitud' => 10.0647, 'longitud' => -69.3570],
                ['nombre' => 'Palavecino', 'codigo' => 'VE-K-PAL', 'capital' => 'Cabudare', 'latitud' => 10.0322, 'longitud' => -69.2611],
                ['nombre' => 'Torres', 'codigo' => 'VE-K-TOR', 'capital' => 'Carora', 'latitud' => 10.1744, 'longitud' => -70.0786],
                ['nombre' => 'Morán', 'codigo' => 'VE-K-MOR', 'capital' => 'El Tocuyo', 'latitud' => 9.7878, 'longitud' => -69.7919],
                ['nombre' => 'Jiménez', 'codigo' => 'VE-K-JIM', 'capital' => 'Quíbor', 'latitud' => 9.9281, 'longitud' => -69.6214],
                ['nombre' => 'Crespo', 'codigo' => 'VE-K-CRE', 'capital' => 'Duaca', 'latitud' => 10.2833, 'longitud' => -69.1667],
                ['nombre' => 'Andrés Eloy Blanco', 'codigo' => 'VE-K-AEB', 'capital' => 'Sanare', 'latitud' => 9.7500, 'longitud' => -69.6500],
                ['nombre' => 'Urdaneta', 'codigo' => 'VE-K-URD', 'capital' => 'Siquisique', 'latitud' => 10.5667, 'longitud' => -69.7000],
                ['nombre' => 'Simón Planas', 'codigo' => 'VE-K-SPL', 'capital' => 'Sarare', 'latitud' => 9.7833, 'longitud' => -69.1667],
            ],

            // La Guaira
            'La Guaira' => [
                ['nombre' => 'Vargas', 'codigo' => 'VE-W-VAR', 'capital' => 'La Guaira', 'latitud' => 10.6000, 'longitud' => -66.9333],
            ],

            // Mérida
            'Mérida' => [
                ['nombre' => 'Libertador', 'codigo' => 'VE-L-LIB', 'capital' => 'Mérida', 'latitud' => 8.5983, 'longitud' => -71.1450],
                ['nombre' => 'Alberto Adriani', 'codigo' => 'VE-L-AAD', 'capital' => 'El Vigía', 'latitud' => 8.6186, 'longitud' => -71.6517],
                ['nombre' => 'Campo Elías', 'codigo' => 'VE-L-CEL', 'capital' => 'Ejido', 'latitud' => 8.5472, 'longitud' => -71.2408],
                ['nombre' => 'Sucre', 'codigo' => 'VE-L-SUC', 'capital' => 'Lagunillas', 'latitud' => 8.5089, 'longitud' => -71.3917],
                ['nombre' => 'Tovar', 'codigo' => 'VE-L-TOV', 'capital' => 'Tovar', 'latitud' => 8.3375, 'longitud' => -71.7583],
                ['nombre' => 'Rangel', 'codigo' => 'VE-L-RAN', 'capital' => 'Mucuchíes', 'latitud' => 8.7500, 'longitud' => -70.9167],
                ['nombre' => 'Santos Marquina', 'codigo' => 'VE-L-SMA', 'capital' => 'Tabay', 'latitud' => 8.6333, 'longitud' => -71.0667],
                ['nombre' => 'Cardenal Quintero', 'codigo' => 'VE-L-CQU', 'capital' => 'Santo Domingo', 'latitud' => 8.8667, 'longitud' => -70.6833],
                ['nombre' => 'Pueblo Llano', 'codigo' => 'VE-L-PLL', 'capital' => 'Pueblo Llano', 'latitud' => 8.9833, 'longitud' => -70.6667],
            ],

            // Miranda
            'Miranda' => [
                ['nombre' => 'Guaicaipuro', 'codigo' => 'VE-M-GUA', 'capital' => 'Los Teques', 'latitud' => 10.3444, 'longitud' => -67.0417],
                ['nombre' => 'Chacao', 'codigo' => 'VE-M-CHA', 'capital' => 'Chacao', 'latitud' => 10.4961, 'longitud' => -66.8522],
                ['nombre' => 'Baruta', 'codigo' => 'VE-M-BAR', 'capital' => 'Baruta', 'latitud' => 10.4344, 'longitud' => -66.8742],
                ['nombre' => 'Sucre', 'codigo' => 'VE-M-SUC', 'capital' => 'Petare', 'latitud' => 10.4800, 'longitud' => -66.8083],
                ['nombre' => 'Plaza', 'codigo' => 'VE-M-PLA', 'capital' => 'Guarenas', 'latitud' => 10.4636, 'longitud' => -66.6133],
                ['nombre' => 'Zamora', 'codigo' => 'VE-M-ZAM', 'capital' => 'Guatire', 'latitud' => 10.4722, 'longitud' => -66.5414],
                ['nombre' => 'El Hatillo', 'codigo' => 'VE-M-HAT', 'capital' => 'El Hatillo', 'latitud' => 10.4261, 'longitud' => -66.8258],
                ['nombre' => 'Carrizal', 'codigo' => 'VE-M-CAR', 'capital' => 'Carrizal', 'latitud' => 10.3500, 'longitud' => -66.9833],
                ['nombre' => 'Los Salias', 'codigo' => 'VE-M-LSA', 'capital' => 'San Antonio de los Altos', 'latitud' => 10.3700, 'longitud' => -66.9600],
                ['nombre' => 'Cristóbal Rojas', 'codigo' => 'VE-M-CRO', 'capital' => 'Charallave', 'latitud' => 10.2467, 'longitud' => -66.8622],
                ['nombre' => 'Urdaneta', 'codigo' => 'VE-M-URD', 'capital' => 'Cúa', 'latitud' => 10.1633, 'longitud' => -66.8847],
                ['nombre' => 'Independencia', 'codigo' => 'VE-M-IND', 'capital' => 'Santa Teresa del Tuy', 'latitud' => 10.2333, 'longitud' => -66.6667],
                ['nombre' => 'Brión', 'codigo' => 'VE-M-BRI', 'capital' => 'Higuerote', 'latitud' => 10.4833, 'longitud' => -66.1000],
                ['nombre' => 'Páez', 'codigo' => 'VE-M-PAE', 'capital' => 'Río Chico', 'latitud' => 10.3167, 'longitud' => -65.9833],
            ],

            // Monagas
            'Monagas' => [
                ['nombre' => 'Maturín', 'codigo' => 'VE-N-MAT', 'capital' => 'Maturín', 'latitud' => 9.7500, 'longitud' => -63.1833],
                ['nombre' => 'Ezequiel Zamora', 'codigo' => 'VE-N-EZAM', 'capital' => 'Punta de Mata', 'latitud' => 9.7028, 'longitud' => -63.6300],
                ['nombre' => 'Cedeño', 'codigo' => 'VE-N-CED', 'capital' => 'Caicara de Maturín', 'latitud' => 9.8167, 'longitud' => -63.6167],
                ['nombre' => 'Piar', 'codigo' => 'VE-N-PIA', 'capital' => 'Aragua de Maturín', 'latitud' => 9.9667, 'longitud' => -63.4833],
                ['nombre' => 'Punceres', 'codigo' => 'VE-N-PUN', 'capital' => 'Quiriquire', 'latitud me' => 9.9833, 'longitud' => -63.2167],
                ['nombre' => 'Caripe', 'codigo' => 'VE-N-CAR', 'capital' => 'Caripe', 'latitud' => 10.1667, 'longitud' => -63.4833],
                ['nombre' => 'Acosta', 'codigo' => 'VE-N-ACO', 'capital' => 'San Antonio de Capayacuar', 'latitud' => 10.1500, 'longitud' => -63.7333],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-N-BOL', 'capital' => 'Caripito', 'latitud' => 10.1167, 'longitud' => -63.1000],
                ['nombre' => 'Sotillo', 'codigo' => 'VE-N-SOT', 'capital' => 'Barrancas del Orinoco', 'latitud' => 8.7000, 'longitud' => -62.1833],
            ],

            // Nueva Esparta
            'Nueva Esparta' => [
                ['nombre' => 'Mariño', 'codigo' => 'VE-O-MAR', 'capital' => 'Porlamar', 'latitud' => 10.9581, 'longitud' => -63.8506],
                ['nombre' => 'Maneiro', 'codigo' => 'VE-O-MAN', 'capital' => 'Pampatar', 'latitud' => 10.9983, 'longitud' => -63.7978],
                ['nombre' => 'Arismendi', 'codigo' => 'VE-O-ARI', 'capital' => 'La Asunción', 'latitud' => 11.0333, 'longitud' => -63.8628],
                ['nombre' => 'Gómez', 'codigo' => 'VE-O-GOM', 'capital' => 'Santa Ana', 'latitud' => 11.0667, 'longitud' => -63.9167],
                ['nombre' => 'Antolín del Campo', 'codigo' => 'VE-O-ADC', 'capital' => 'La Plaza de Paraguay', 'latitud' => 11.1000, 'longitud' => -63.8667],
                ['nombre' => 'Díaz', 'codigo' => 'VE-O-DIA', 'capital' => 'San Juan Bautista', 'latitud' => 10.9833, 'longitud' => -63.9500],
                ['nombre' => 'Marcano', 'codigo' => 'VE-O-MCA', 'capital' => 'Juangriego', 'latitud' => 11.0833, 'longitud' => -63.9667],
                ['nombre' => 'Tubores', 'codigo' => 'VE-O-TUB', 'capital' => 'Punta de Piedras', 'latitud' => 10.9000, 'longitud' => -64.0833],
                ['nombre' => 'Península de Macanao', 'codigo' => 'VE-O-MAC', 'capital' => 'Boca de Río', 'latitud' => 10.9667, 'longitud' => -64.1833],
                ['nombre' => 'Villalba', 'codigo' => 'VE-O-VIL', 'capital' => 'San Pedro de Coche', 'latitud' => 10.7833, 'longitud' => -63.9333],
            ],

            // Portuguesa
            'Portuguesa' => [
                ['nombre' => 'Páez', 'codigo' => 'VE-P-PAE', 'capital' => 'Acarigua', 'latitud' => 9.5500, 'longitud' => -69.2000],
                ['nombre' => 'Guanare', 'codigo' => 'VE-P-GUA', 'capital' => 'Guanare', 'latitud' => 9.0417, 'longitud' => -69.7483],
                ['nombre' => 'Araure', 'codigo' => 'VE-P-ARA', 'capital' => 'Araure', 'latitud' => 9.5600, 'longitud' => -69.2136],
                ['nombre' => 'Turén', 'codigo' => 'VE-P-TUR', 'capital' => 'Villa Bruzual', 'latitud' => 9.3333, 'longitud' => -69.1167],
                ['nombre' => 'Esteller', 'codigo' => 'VE-P-EST', 'capital' => 'Píritu', 'latitud' => 9.3667, 'longitud' => -69.2167],
                ['nombre' => 'Ospino', 'codigo' => 'VE-P-OSP', 'capital' => 'Ospino', 'latitud' => 9.3000, 'longitud' => -69.4500],
                ['nombre' => 'Sucre', 'codigo' => 'VE-P-SUC', 'capital' => 'Biscucuy', 'latitud' => 9.3667, 'longitud' => -69.9833],
                ['nombre' => 'Unda', 'codigo' => 'VE-P-UND', 'capital' => 'Chabasquén', 'latitud' => 9.4167, 'longitud' => -69.9667],
                ['nombre' => 'Agua Blanca', 'codigo' => 'VE-P-ABL', 'capital' => 'Agua Blanca', 'latitud' => 9.6667, 'longitud' => -69.1167],
            ],

            // Sucre
            'Sucre' => [
                ['nombre' => 'Sucre', 'codigo' => 'VE-R-SUC', 'capital' => 'Cumaná', 'latitud' => 10.4500, 'longitud' => -64.1667],
                ['nombre' => 'Bermúdez', 'codigo' => 'VE-R-BER', 'capital' => 'Carúpano', 'latitud' => 10.6667, 'longitud' => -63.2500],
                ['nombre' => 'Valdez', 'codigo' => 'VE-R-VAL', 'capital' => 'Güiria', 'latitud' => 10.5772, 'longitud' => -62.3006],
                ['nombre' => 'Benítez', 'codigo' => 'VE-R-BEN', 'capital' => 'El Pilar', 'latitud' => 10.5500, 'longitud' => -63.1500],
                ['nombre' => 'Montes', 'codigo' => 'VE-R-MON', 'capital' => 'Cacoa', 'latitud' => 10.1833, 'longitud' => -63.9833],
                ['nombre' => 'Ribero', 'codigo' => 'VE-R-RIB', 'capital' => 'Cariaco', 'latitud' => 10.5000, 'longitud' => -63.5500],
                ['nombre' => 'Mejía', 'codigo' => 'VE-R-MEJ', 'capital' => 'San Antonio del Golfo', 'latitud' => 10.4333, 'longitud' => -63.8000],
                ['nombre' => 'Cruz Salmerón Acosta', 'codigo' => 'VE-R-CSA', 'capital' => 'Araya', 'latitud' => 10.5667, 'longitud' => -64.2500],
                ['nombre' => 'Arismendi', 'codigo' => 'VE-R-ARI', 'capital' => 'Río Caribe', 'latitud' => 10.7000, 'longitud' => -63.1167],
            ],

            // Táchira
            'Táchira' => [
                ['nombre' => 'San Cristóbal', 'codigo' => 'VE-S-SCR', 'capital' => 'San Cristóbal', 'latitud' => 7.7669, 'longitud' => -72.2250],
                ['nombre' => 'Cárdenas', 'codigo' => 'VE-S-CAR', 'capital' => 'Triba', 'latitud' => 7.8208, 'longitud' => -72.2222],
                ['nombre' => 'Jáuregui', 'codigo' => 'VE-S-JAU', 'capital' => 'La Grita', 'latitud' => 8.1333, 'longitud' => -71.9833],
                ['nombre' => 'Junín', 'codigo' => 'VE-S-JUN', 'capital' => 'Rubio', 'latitud' => 7.7058, 'longitud' => -72.3556],
                ['nombre' => 'Ayacucho', 'codigo' => 'VE-S-AYA', 'capital' => 'San Juan de Colón', 'latitud' => 8.0333, 'longitud' => -72.2500],
                ['nombre' => 'Capacho Nuevo', 'codigo' => 'VE-S-CNU', 'capital' => 'Capacho Nuevo', 'latitud' => 7.7833, 'longitud' => -72.3000],
                ['nombre' => 'Capacho Viejo', 'codigo' => 'VE-S-CVI', 'capital' => 'Capacho Viejo', 'latitud' => 7.7800, 'longitud' => -72.3167],
                ['nombre' => 'Bolívar', 'codigo' => 'VE-S-BOL', 'capital' => 'San Antonio del Táchira', 'latitud' => 7.8167, 'longitud' => -72.4500],
                ['nombre' => 'Lobatera', 'codigo' => 'VE-S-LOB', 'capital' => 'Lobatera', 'latitud' => 7.9333, 'longitud' => -72.2500],
                ['nombre' => 'García de Hevia', 'codigo' => 'VE-S-GHE', 'capital' => 'La Fría', 'latitud' => 8.2167, 'longitud' => -72.2500],
                ['nombre' => 'Panamericano', 'codigo' => 'VE-S-PAN', 'capital' => 'Coloncito', 'latitud' => 8.3333, 'longitud' => -72.1667],
                ['nombre' => 'Torbes', 'codigo' => 'VE-S-TOR', 'capital' => 'San Josecito', 'latitud' => 7.6833, 'longitud' => -72.2333],
            ],

            // Trujillo
            'Trujillo' => [
                ['nombre' => 'Valera', 'codigo' => 'VE-T-VAL', 'capital' => 'Valera', 'latitud' => 9.3178, 'longitud' => -70.6036],
                ['nombre' => 'Trujillo', 'codigo' => 'VE-T-TRU', 'capital' => 'Trujillo', 'latitud' => 9.3667, 'longitud' => -70.4333],
                ['nombre' => 'Boconó', 'codigo' => 'VE-T-BOC', 'capital' => 'Boconó', 'latitud' => 9.2500, 'longitud' => -70.2667],
                ['nombre' => 'San Rafael de Carvajal', 'codigo' => 'VE-T-CAR', 'capital' => 'Carvajal', 'latitud' => 9.3500, 'longitud' => -70.5833],
                ['nombre' => 'Escuque', 'codigo' => 'VE-T-ESC', 'capital' => 'Escuque', 'latitud' => 9.3000, 'longitud' => -70.6667],
                ['nombre' => 'Rafael Rangel', 'codigo' => 'VE-T-RRA', 'capital' => 'Betijoque', 'latitud' => 9.3833, 'longitud' => -70.7333],
                ['nombre' => 'Pampán', 'codigo' => 'VE-T-PAM', 'capital' => 'Pampán', 'latitud' => 9.4500, 'longitud' => -70.4833],
                ['nombre' => 'Candelaria', 'codigo' => 'VE-T-CAN', 'capital' => 'Chejendé', 'latitud' => 9.6333, 'longitud' => -70.3667],
            ],

            // Yaracuy
            'Yaracuy' => [
                ['nombre' => 'San Felipe', 'codigo' => 'VE-U-SFE', 'capital' => 'San Felipe', 'latitud' => 10.3397, 'longitud' => -68.7425],
                ['nombre' => 'Independencia', 'codigo' => 'VE-U-IND', 'capital' => 'Independencia', 'latitud' => 10.3300, 'longitud' => -68.7500],
                ['nombre' => 'Peña', 'codigo' => 'VE-U-PEN', 'capital' => 'Yaritagua', 'latitud' => 10.0786, 'longitud' => -69.1239],
                ['nombre' => 'Bruzual', 'codigo' => 'VE-U-BRU', 'capital' => 'Chivacoa', 'latitud' => 10.1583, 'longitud' => -68.8958],
                ['nombre' => 'Nirgua', 'codigo' => 'VE-U-NIR', 'capital' => 'Nirgua', 'latitud' => 10.1500, 'longitud' => -68.5667],
                ['nombre' => 'Urachiche', 'codigo' => 'VE-U-URA', 'capital' => 'Urachiche', 'latitud' => 10.1500, 'longitud' => -69.0167],
                ['nombre' => 'Sucre', 'codigo' => 'VE-U-SUC', 'capital' => 'Guama', 'latitud' => 10.2667, 'longitud' => -68.8000],
                ['nombre' => 'La Trinidad', 'codigo' => 'VE-U-LTR', 'capital' => 'Boraure', 'latitud' => 10.2167, 'longitud' => -68.7500],
                ['nombre' => 'José Antonio Páez', 'codigo' => 'VE-U-JAP', 'capital' => 'Sabana de Parra', 'latitud' => 10.1333, 'longitud' => -68.9667],
            ],

            // Zulia
            'Zulia' => [
                ['nombre' => 'Maracaibo', 'codigo' => 'VE-V-MAR', 'capital' => 'Maracaibo', 'latitud' => 10.6500, 'longitud' => -71.6333],
                ['nombre' => 'San Francisco', 'codigo' => 'VE-V-SFR', 'capital' => 'San Francisco', 'latitud' => 10.5739, 'longitud' => -71.6500],
                ['nombre' => 'Cabimas', 'codigo' => 'VE-V-CAB', 'capital' => 'Cabimas', 'latitud' => 10.3956, 'longitud' => -71.4428],
                ['nombre' => 'Lagunillas', 'codigo' => 'VE-V-LAG', 'capital' => 'Ciudad Ojeda', 'latitud' => 10.2031, 'longitud' => -71.3125],
                ['nombre' => 'Mara', 'codigo' => 'VE-V-MARA', 'capital' => 'San Rafael del Moján', 'latitud' => 10.9639, 'longitud' => -71.7347],
                ['nombre' => 'Santa Rita', 'codigo' => 'VE-V-SRI', 'capital' => 'Santa Rita', 'latitud' => 10.5369, 'longitud' => -71.5122],
                ['nombre' => 'Rosario de Perijá', 'codigo' => 'VE-V-RPE', 'capital' => 'La Villa del Rosario', 'latitud' => 10.3167, 'longitud' => -72.3167],
                ['nombre' => 'Machiques de Perijá', 'codigo' => 'VE-V-MPE', 'capital' => 'Machiques', 'latitud' => 10.0642, 'longitud' => -72.5450],
                ['nombre' => 'Baralt', 'codigo' => 'VE-V-BAR', 'capital' => 'San Timoteo', 'latitud' => 9.7833, 'longitud' => -71.0500],
                ['nombre' => 'Miranda', 'codigo' => 'VE-V-MIR', 'capital' => 'Los Puertos de Altagracia', 'latitud' => 10.6833, 'longitud' => -71.5167],
                ['nombre' => 'Colón', 'codigo' => 'VE-V-COL', 'capital' => 'San Carlos del Zulia', 'latitud' => 9.0000, 'longitud' => -71.9167],
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
                            'codigo' => $mun['codigo'] ?? null,
                            'capital' => $mun['capital'] ?? null,
                            'latitud' => $mun['latitud'] ?? null,
                            'longitud' => $mun['longitud'] ?? null,
                            'activo' => true,
                        ]
                    );
                }
            }
        }
    }
}
