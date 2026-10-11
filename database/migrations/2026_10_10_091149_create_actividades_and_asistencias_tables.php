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
        // 1. Tabla de Actividades / Eventos
        Schema::create('actividades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empresa_id')->nullable()->constrained('empresas')->nullOnDelete();
            $table->foreignId('sucursal_id')->nullable()->constrained('sucursales')->nullOnDelete();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('tipo')->default('Convención'); // Convención, Retiro, Asamblea, Reunión de Zona, Taller, Confraternidad
            $table->dateTime('fecha_inicio');
            $table->dateTime('fecha_fin');
            $table->string('lugar')->nullable();
            $table->string('zona')->nullable();
            $table->string('distrito')->nullable();
            $table->string('estado')->default('planificada'); // planificada, en_curso, finalizada, cancelada
            $table->boolean('permite_conyuge')->default(true);
            $table->boolean('controla_comida')->default(false);
            $table->integer('capacidad_maxima')->nullable();
            $table->timestamps();

            $table->index(['fecha_inicio', 'fecha_fin']);
            $table->index('estado');
        });

        // 2. Tabla de Sesiones / Bloques de la Actividad
        Schema::create('actividad_sesiones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades')->cascadeOnDelete();
            $table->string('nombre'); // Ej: Día 1 - Apertura / Noche, Día 2 - Mañana, etc.
            $table->dateTime('fecha_hora_inicio');
            $table->dateTime('fecha_hora_fin');
            $table->boolean('es_obligatoria')->default(true);
            $table->string('tipo_comida')->default('ninguna'); // ninguna, desayuno, almuerzo, cena
            $table->integer('orden')->default(0);
            $table->timestamps();

            $table->index(['actividad_id', 'fecha_hora_inicio']);
        });

        // 3. Tabla de Registro de Asistencias
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actividad_id')->constrained('actividades')->cascadeOnDelete();
            $table->foreignId('actividad_sesion_id')->nullable()->constrained('actividad_sesiones')->cascadeOnDelete();
            $table->foreignId('pastor_id')->constrained('pastores')->cascadeOnDelete();
            $table->dateTime('fecha_registro');
            $table->string('metodo')->default('qr_carnet'); // qr_carnet, cedula, manual
            $table->boolean('asistio_con_conyuge')->default(false);
            $table->string('nombre_acompanante')->nullable();
            $table->boolean('comida_entregada')->default(false);
            $table->boolean('kit_entregado')->default(false);
            $table->text('observaciones')->nullable();
            $table->foreignId('registrado_por_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Evitar duplicados de asistencia de un mismo pastor en la misma sesión o actividad
            $table->index(['actividad_id', 'pastor_id']);
            $table->index(['actividad_sesion_id', 'pastor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('actividad_sesiones');
        Schema::dropIfExists('actividades');
    }
};
