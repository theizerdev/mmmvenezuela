<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('tipo_locales')) {
            Schema::create('tipo_locales', function (Blueprint $table) {
                $table->id();
                $table->string('nombre');
                $table->text('descripcion')->nullable();
                $table->boolean('activo')->default(true);
                $table->timestamps();
            });

            // Insertar tipos de local por defecto
            DB::table('tipo_locales')->insert([
                ['nombre' => 'Propio', 'descripcion' => 'Local o templo propio del ministerio', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Alquilado', 'descripcion' => 'Local en calidad de alquiler', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Prestado / Cedido', 'descripcion' => 'Local prestado o cedido temporalmente', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'En Construcción', 'descripcion' => 'Templo en proceso de construcción', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
                ['nombre' => 'Casa de Culto', 'descripcion' => 'Casa particular habilitada para cultos', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tipo_locales');
    }
};
