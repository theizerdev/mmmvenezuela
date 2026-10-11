<?php

namespace Database\Seeders;

use App\Models\Actividad;
use App\Models\Pastor;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ActividadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Actividad::count() > 0) {
            return;
        }

        $now = Carbon::now();

        // 1. Convención Nacional (En curso)
        $convencion = Actividad::create([
            'nombre' => 'Convención Nacional de Pastores y Obreros 2026',
            'tipo' => 'Convención',
            'descripcion' => 'Reunión anual de todos los pastores y obreros del Movimiento Misionero Mundial en Venezuela.',
            'fecha_inicio' => $now->copy()->subHours(4),
            'fecha_fin' => $now->copy()->addDays(2),
            'lugar' => 'Centro de Convenciones MMM - La Victoria, Estado Aragua',
            'estado' => 'en_curso',
            'permite_conyuge' => true,
            'controla_comida' => true,
            'capacidad_maxima' => 800,
        ]);

        $convencion->sesiones()->createMany([
            [
                'nombre' => 'Día 1 - Culto Inaugural / Noche',
                'fecha_hora_inicio' => $now->copy()->subHours(4),
                'fecha_hora_fin' => $now->copy()->addHours(2),
                'es_obligatoria' => true,
                'tipo_comida' => 'cena',
                'orden' => 1,
            ],
            [
                'nombre' => 'Día 2 - Plenaria Matutina / Estudio Bíblico',
                'fecha_hora_inicio' => $now->copy()->addDay()->setHour(8)->setMinute(30),
                'fecha_hora_fin' => $now->copy()->addDay()->setHour(12)->setMinute(0),
                'es_obligatoria' => true,
                'tipo_comida' => 'desayuno',
                'orden' => 2,
            ],
            [
                'nombre' => 'Día 2 - Asamblea Ministerial Pastoral',
                'fecha_hora_inicio' => $now->copy()->addDay()->setHour(14)->setMinute(30),
                'fecha_hora_fin' => $now->copy()->addDay()->setHour(18)->setMinute(0),
                'es_obligatoria' => true,
                'tipo_comida' => 'almuerzo',
                'orden' => 3,
            ],
            [
                'nombre' => 'Día 3 - Culto de Clausura y Santa Cena',
                'fecha_hora_inicio' => $now->copy()->addDays(2)->setHour(9)->setMinute(0),
                'fecha_hora_fin' => $now->copy()->addDays(2)->setHour(13)->setMinute(0),
                'es_obligatoria' => true,
                'tipo_comida' => 'almuerzo',
                'orden' => 4,
            ],
        ]);

        // 2. Retiro de Pastores Zona 9 (Planificada)
        $retiro = Actividad::create([
            'nombre' => 'Retiro Espiritual de Pastores - Zona 9',
            'tipo' => 'Retiro Pastoral',
            'descripcion' => 'Jornada de fortalecimiento espiritual, ayuno y comunión para los ministros de la Zona 9.',
            'fecha_inicio' => $now->copy()->addDays(15)->setHour(8)->setMinute(0),
            'fecha_fin' => $now->copy()->addDays(16)->setHour(17)->setMinute(0),
            'lugar' => 'Templo Central de Barquisimeto',
            'zona' => '9',
            'estado' => 'planificada',
            'permite_conyuge' => true,
            'controla_comida' => true,
            'capacidad_maxima' => 60,
        ]);

        $retiro->sesiones()->createMany([
            [
                'nombre' => 'Sesión Matutina - Oración y Ministración',
                'fecha_hora_inicio' => $now->copy()->addDays(15)->setHour(8)->setMinute(0),
                'fecha_hora_fin' => $now->copy()->addDays(15)->setHour(12)->setMinute(30),
                'es_obligatoria' => true,
                'tipo_comida' => 'desayuno',
                'orden' => 1,
            ],
            [
                'nombre' => 'Sesión Vespertina - Taller de Obra Misionera',
                'fecha_hora_inicio' => $now->copy()->addDays(15)->setHour(14)->setMinute(0),
                'fecha_hora_fin' => $now->copy()->addDays(15)->setHour(18)->setMinute(0),
                'es_obligatoria' => true,
                'tipo_comida' => 'almuerzo',
                'orden' => 2,
            ],
        ]);
    }
}
