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
        Schema::table('empresas', function (Blueprint $table) {
            if (! Schema::hasColumn('empresas', 'nombre_comercial')) {
                $table->string('nombre_comercial')->nullable()->after('razon_social');
            }
            if (! Schema::hasColumn('empresas', 'zona_horaria')) {
                $table->string('zona_horaria', 100)->nullable()->after('pais_id');
            }
            if (! Schema::hasColumn('empresas', 'curp_representante_legal')) {
                $table->string('curp_representante_legal', 50)->nullable()->after('representante_legal');
            }
            if (! Schema::hasColumn('empresas', 'pais_telefono_id')) {
                $table->foreignId('pais_telefono_id')->nullable()->after('telefono')->constrained('pais')->nullOnDelete();
            }
            if (! Schema::hasColumn('empresas', 'control_acceso_base_url')) {
                $table->string('control_acceso_base_url')->nullable();
            }
            if (! Schema::hasColumn('empresas', 'control_acceso_app_token')) {
                $table->string('control_acceso_app_token')->nullable();
            }
            if (! Schema::hasColumn('empresas', 'control_acceso_user_token')) {
                $table->string('control_acceso_user_token')->nullable();
            }
            if (! Schema::hasColumn('empresas', 'control_acceso_active')) {
                $table->boolean('control_acceso_active')->default(false);
            }
            if (! Schema::hasColumn('empresas', 'jaak_api_key')) {
                $table->text('jaak_api_key')->nullable();
            }
            if (! Schema::hasColumn('empresas', 'jaak_environment')) {
                $table->string('jaak_environment')->nullable();
            }
            if (! Schema::hasColumn('empresas', 'jaak_active')) {
                $table->boolean('jaak_active')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $columns = [
                'nombre_comercial',
                'zona_horaria',
                'curp_representante_legal',
                'pais_telefono_id',
                'control_acceso_base_url',
                'control_acceso_app_token',
                'control_acceso_user_token',
                'control_acceso_active',
                'jaak_api_key',
                'jaak_environment',
                'jaak_active',
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('empresas', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
