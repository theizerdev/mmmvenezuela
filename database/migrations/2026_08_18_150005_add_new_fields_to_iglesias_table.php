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
        Schema::table('iglesias', function (Blueprint $table) {
            $table->integer('miembros_activos')->nullable()->after('activa');
            $table->integer('cantidad_campos_blancos')->nullable()->after('miembros_activos');
            $table->integer('miembro_probante')->nullable()->after('cantidad_campos_blancos');
            $table->text('logros_obtenidos')->nullable()->after('miembro_probante');
            $table->string('tiempo_trabajo')->nullable()->after('logros_obtenidos');
            $table->string('sector')->nullable()->after('tiempo_trabajo');
            $table->string('calle')->nullable()->after('sector');
            $table->string('avenida')->nullable()->after('calle');
            $table->integer('iglesias_fundadas')->nullable()->after('avenida');
            $table->integer('pastores_ministerio')->nullable()->after('iglesias_fundadas');
            $table->boolean('posee_medio_comunicacion')->default(false)->after('pastores_ministerio');
            $table->string('medio_comunicacion')->nullable()->after('posee_medio_comunicacion');
            $table->string('nombre_medio_comunicacion')->nullable()->after('medio_comunicacion');
            $table->string('donde_medio_comunicacion')->nullable()->after('nombre_medio_comunicacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iglesias', function (Blueprint $table) {
            $table->dropColumn([
                'miembros_activos',
                'cantidad_campos_blancos',
                'miembro_probante',
                'logros_obtenidos',
                'tiempo_trabajo',
                'sector',
                'calle',
                'avenida',
                'iglesias_fundadas',
                'pastores_ministerio',
                'posee_medio_comunicacion',
                'medio_comunicacion',
                'nombre_medio_comunicacion',
                'donde_medio_comunicacion'
            ]);
        });
    }
};