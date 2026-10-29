<?php

namespace Tests\Unit;

use App\Models\Estado;
use App\Models\Iglesia;
use App\Models\Pastor;
use App\Services\CarnetService;
use Illuminate\Database\Eloquent\Collection;
use Tests\TestCase;

class CarnetServiceLocationTest extends TestCase
{
    public function test_carnet_uses_the_pastors_state_when_it_differs_from_the_extension_state(): void
    {
        $pastor = new Pastor([
            'zona' => '1',
            'distrito' => '2',
        ]);
        $pastor->setRelation('estado', new Estado(['nombre' => 'Aragua']));
        $pastor->setRelation('iglesiasPrincipales', new Collection());

        $extension = new Iglesia();
        $extension->setRelation('estado', new Estado(['nombre' => 'Barinas']));
        $pastor->setRelation('iglesias', new Collection([$extension]));

        $carnetService = new CarnetService();

        $this->assertSame('ARAGUA', $carnetService->obtenerLugarTrabajo($pastor));
        $this->assertSame('ARAGUA - ZONA 1- DISTRITO 2', $carnetService->obtenerLugarReverso($pastor));
    }
}
