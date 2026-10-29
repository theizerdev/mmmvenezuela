<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SyncExtensionStatesCommandTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('estados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
        });

        Schema::create('pastores', function (Blueprint $table) {
            $table->id();
            $table->string('nombres');
            $table->string('apellidos');
            $table->foreignId('estado_id')->nullable();
        });

        Schema::create('iglesias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('pastor_id')->nullable();
            $table->foreignId('estado_id')->nullable();
            $table->foreignId('municipio_id')->nullable();
            $table->foreignId('parroquia_id')->nullable();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->timestamps();
        });

        Schema::create('municipios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('estado_id');
            $table->string('nombre');
        });

        Schema::create('parroquias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipio_id');
            $table->string('nombre');
        });

        Schema::create('iglesia_pastor', function (Blueprint $table) {
            $table->id();
            $table->foreignId('iglesia_id');
            $table->foreignId('pastor_id');
            $table->timestamps();
        });
    }

    public function test_command_previews_then_syncs_extension_to_primary_pastors_state(): void
    {
        $araguaId = DB::table('estados')->insertGetId(['nombre' => 'Aragua']);
        $barinasId = DB::table('estados')->insertGetId(['nombre' => 'Barinas']);
        $barinasMunicipioId = DB::table('municipios')->insertGetId([
            'estado_id' => $barinasId,
            'nombre' => 'Barinas',
        ]);
        $parroquiaId = DB::table('parroquias')->insertGetId([
            'municipio_id' => $barinasMunicipioId,
            'nombre' => 'Barinas',
        ]);
        $pastorId = DB::table('pastores')->insertGetId([
            'nombres' => 'Ana',
            'apellidos' => 'Pastora',
            'estado_id' => $araguaId,
        ]);
        $extensionId = DB::table('iglesias')->insertGetId([
            'nombre' => 'Extensión de prueba',
            'pastor_id' => $pastorId,
            'estado_id' => $barinasId,
            'municipio_id' => $barinasMunicipioId,
            'parroquia_id' => $parroquiaId,
            'latitud' => 9.5,
            'longitud' => -69.2,
        ]);

        Event::fake();

        $this->artisan('sync:extensiones-estados')
            ->expectsOutputToContain('1 cambio(s) propuesto(s)')
            ->assertExitCode(0);

        $this->assertSame($barinasId, DB::table('iglesias')->where('id', $extensionId)->value('estado_id'));

        $this->artisan('sync:extensiones-estados', ['--apply' => true, '--force' => true])
            ->expectsOutputToContain('Extensiones actualizadas: 1')
            ->assertExitCode(0);

        $extension = DB::table('iglesias')->where('id', $extensionId)->first();
        $this->assertSame($araguaId, $extension->estado_id);
        $this->assertNull($extension->municipio_id);
        $this->assertNull($extension->parroquia_id);
        $this->assertNull($extension->latitud);
        $this->assertNull($extension->longitud);

        $this->artisan('sync:extensiones-estados', ['--apply' => true, '--force' => true])
            ->expectsOutputToContain('No hay extensiones que requieran cambios.')
            ->assertExitCode(0);
    }
}
