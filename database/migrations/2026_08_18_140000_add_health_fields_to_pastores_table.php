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
        Schema::table('pastores', function (Blueprint $table) {
            $table->string('grupo_sanguineo')->nullable()->after('status');
            $table->string('condicion_salud')->nullable()->after('grupo_sanguineo');
            $table->boolean('padece_enfermedad')->default(false)->after('condicion_salud');
            $table->text('enfermedades_cronicas')->nullable()->after('padece_enfermedad');
            $table->boolean('toma_medicamentos')->default(false)->after('enfermedades_cronicas');
            $table->text('medicamentos_recetados')->nullable()->after('toma_medicamentos');
            $table->string('alergias')->nullable()->after('medicamentos_recetados');
            $table->string('contacto_emergencia_nombre')->nullable()->after('alergias');
            $table->string('contacto_emergencia_telefono')->nullable()->after('contacto_emergencia_nombre');
            $table->text('observaciones_salud')->nullable()->after('contacto_emergencia_telefono');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pastores', function (Blueprint $table) {
            $table->dropColumn([
                'grupo_sanguineo',
                'condicion_salud',
                'padece_enfermedad',
                'enfermedades_cronicas',
                'toma_medicamentos',
                'medicamentos_recetados',
                'alergias',
                'contacto_emergencia_nombre',
                'contacto_emergencia_telefono',
                'observaciones_salud',
            ]);
        });
    }
};
