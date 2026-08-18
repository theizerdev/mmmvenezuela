<?php

namespace Database\Seeders;

use App\Models\Estado;
use App\Models\Municipio;
use App\Models\Parroquia;
use App\Models\Pastor;
use Illuminate\Database\Seeder;

class PastorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $estadoDistrito = Estado::where('nombre', 'Distrito Capital')->first();
        $municipioLibertador = $estadoDistrito ? Municipio::where('estado_id', $estadoDistrito->id)->where('nombre', 'Libertador')->first() : null;
        $parroquiaElRecreo = $municipioLibertador ? Parroquia::where('municipio_id', $municipioLibertador->id)->where('nombre', 'El Recreo')->first() : null;

        $estadoAragua = Estado::where('nombre', 'Aragua')->first();
        $municipioGirardot = $estadoAragua ? Municipio::where('estado_id', $estadoAragua->id)->where('nombre', 'Girardot')->first() : null;

        // Pastor 1: Carlos Mendoza (Ministro Ordenado)
        $pastor1 = Pastor::updateOrCreate(
            ['codigo' => 'PAS-001'],
            [
                'nombres' => 'Carlos Alberto',
                'apellidos' => 'Mendoza Silva',
                'documento' => 'V-12345678',
                'genero' => 'M',
                'edad' => 48,
                'fe_nacimiento' => '1978-05-14',
                'estado_civil' => 'Casado',
                'nombre_conyuge' => 'Elena María de Mendoza',
                'nivel_ministerial' => 'Ministro Ordenado',
                'zona' => 'Zona 1 (Central)',
                'distrito' => 'Distrito Capital',
                'ano_promocion' => '2005',
                'tiempo_colaborando' => '21 años',
                'batizado_espiritu_santo' => true,
                'pertenece_ministerio' => true,
                'cargo_nacional' => 'Supervisor Nacional Adjunto',
                'grado_instruccion' => 'Universitario',
                'titulo_obtenido' => 'Licenciado en Educación',
                'estudio_teologico' => true,
                'titulo_teologico' => 'Licenciatura en Teología Pastoral',
                'tiempo_de_estudio_teologico' => '4 años',
                'instituto_teologico' => 'Instituto Bíblico de las Asambleas de Dios',
                'urbanizacion' => 'Sabana Grande',
                'calle_avenida' => 'Av. Francisco de Miranda',
                'edificio_casa_quinta' => 'Residencias El Sol',
                'piso' => '4',
                'apartamento' => '4-B',
                'estado_id' => $estadoDistrito?->id,
                'municipio_id' => $municipioLibertador?->id,
                'parroquia_id' => $parroquiaElRecreo?->id,
                'municipio' => 'Libertador',
                'telefono_tlf' => '0414-1234567',
                'telefono_hab' => '0212-9876543',
                'status' => true,
            ]
        );

        // Pastor 2: Elena María (Ministra Licenciada - Cónyuge del Pastor 1)
        $pastor2 = Pastor::updateOrCreate(
            ['codigo' => 'PAS-002'],
            [
                'nombres' => 'Elena María',
                'apellidos' => 'Ríos de Mendoza',
                'documento' => 'V-14567890',
                'genero' => 'F',
                'edad' => 45,
                'fe_nacimiento' => '1981-09-20',
                'estado_civil' => 'Casada',
                'nombre_conyuge' => 'Carlos Alberto Mendoza Silva',
                'conyuge_id' => $pastor1->id,
                'nivel_ministerial' => 'Licenciado',
                'zona' => 'Zona 1 (Central)',
                'distrito' => 'Distrito Capital',
                'ano_promocion' => '2010',
                'tiempo_colaborando' => '16 años',
                'batizado_espiritu_santo' => true,
                'pertenece_ministerio' => true,
                'cargo_nacional' => 'Directora de Damas',
                'grado_instruccion' => 'Universitario',
                'titulo_obtenido' => 'Licenciada en Psicología',
                'estudio_teologico' => true,
                'titulo_teologico' => 'Diplomado en Consejería Familiar Teológica',
                'tiempo_de_estudio_teologico' => '3 años',
                'instituto_teologico' => 'Instituto Teológico Central',
                'urbanizacion' => 'Sabana Grande',
                'calle_avenida' => 'Av. Francisco de Miranda',
                'edificio_casa_quinta' => 'Residencias El Sol',
                'piso' => '4',
                'apartamento' => '4-B',
                'estado_id' => $estadoDistrito?->id,
                'municipio_id' => $municipioLibertador?->id,
                'parroquia_id' => $parroquiaElRecreo?->id,
                'municipio' => 'Libertador',
                'telefono_tlf' => '0424-7654321',
                'status' => true,
            ]
        );

        // Vincular recíprocamente el conyuge_id en Pastor 1
        $pastor1->update(['conyuge_id' => $pastor2->id]);

        // Pastor 3: José Luis Paredes (Laico / Aragua)
        Pastor::updateOrCreate(
            ['codigo' => 'PAS-003'],
            [
                'nombres' => 'José Luis',
                'apellidos' => 'Paredes Gómez',
                'documento' => 'V-16890123',
                'genero' => 'M',
                'edad' => 39,
                'fe_nacimiento' => '1987-11-03',
                'estado_civil' => 'Soltero',
                'nivel_ministerial' => 'Laico',
                'zona' => 'Zona 2 (Aragua / Carabobo)',
                'distrito' => 'Girardot',
                'ano_promocion' => '2018',
                'tiempo_colaborando' => '8 años',
                'batizado_espiritu_santo' => true,
                'pertenece_ministerio' => true,
                'grado_instruccion' => 'Bachiller',
                'estudio_teologico' => true,
                'titulo_teologico' => 'Certificado de Liderazgo Cristiano',
                'instituto_teologico' => 'Escuela de Discipulado',
                'estado_id' => $estadoAragua?->id,
                'municipio_id' => $municipioGirardot?->id,
                'municipio' => 'Girardot',
                'telefono_tlf' => '0412-5554433',
                'status' => true,
            ]
        );
    }
}
