<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pastores', function (Blueprint $table) {
            $table->id();

            // Identificación Eclesiástica y Personal
            $table->string('codigo')->unique();
            $table->string('nombres');
            $table->string('apellidos');
            $table->string('documento')->unique();
            $table->string('genero')->nullable(); // M / F
            $table->integer('edad')->nullable();
            $table->date('fe_nacimiento')->nullable();
            $table->string('foto')->nullable();
            $table->string('estado_civil')->nullable();

            // Cónyuge
            $table->string('nombre_conyuge')->nullable();
            $table->foreignId('conyuge_id')->nullable()->constrained('pastores')->nullOnDelete();

            // Datos Eclesiásticos y Ministerio
            $table->enum('nivel_ministerial', ['Colaborador', 'Laico', 'Licenciado', 'Ministro Ordenado'])->default('Colaborador');
            $table->string('zona')->nullable();
            $table->string('distrito')->nullable();
            $table->string('ano_promocion')->nullable();
            $table->string('tiempo_colaborando')->nullable();
            $table->boolean('batizado_espiritu_santo')->default(false);
            $table->boolean('pertenece_ministerio')->default(false);
            $table->string('cargo_nacional')->nullable();
            $table->text('mencion')->nullable();
            $table->text('nota')->nullable();

            // Datos Académicos y Teológicos
            $table->string('grado_instruccion')->nullable();
            $table->string('titulo_obtenido')->nullable();
            $table->boolean('estudio_teologico')->default(false);
            $table->string('titulo_teologico')->nullable();
            $table->string('tiempo_de_estudio_teologico')->nullable();
            $table->string('instituto_teologico')->nullable();

            // Ubicación y Contacto
            $table->string('edificio_casa_quinta')->nullable();
            $table->string('piso')->nullable();
            $table->string('apartamento')->nullable();
            $table->string('calle_avenida')->nullable();
            $table->string('urbanizacion')->nullable();

            // Relaciones Territoriales
            $table->foreignId('estado_id')->nullable()->constrained('estados')->nullOnDelete();
            $table->foreignId('municipio_id')->nullable()->constrained('municipios')->nullOnDelete();
            $table->foreignId('parroquia_id')->nullable()->constrained('parroquias')->nullOnDelete();
            $table->text('municipio')->nullable();

            // Teléfonos de contacto
            $table->string('telefono_hab')->nullable();
            $table->string('telefono_tlf')->nullable();
            $table->string('telefono_otro')->nullable();

            $table->boolean('status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pastores');
    }
};
