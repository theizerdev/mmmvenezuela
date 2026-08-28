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
        // 1. Expand enum to allow both Colaborador and Pastor Asociado
        DB::statement("ALTER TABLE `pastores` MODIFY COLUMN `nivel_ministerial` ENUM('Colaborador', 'Pastor Asociado', 'Laico', 'Licenciado', 'Ministro Ordenado') NOT NULL DEFAULT 'Colaborador'");

        // 2. Update existing records from 'Colaborador' to 'Pastor Asociado'
        DB::table('pastores')
            ->where('nivel_ministerial', 'Colaborador')
            ->update(['nivel_ministerial' => 'Pastor Asociado']);

        // 3. Restrict enum to target values
        DB::statement("ALTER TABLE `pastores` MODIFY COLUMN `nivel_ministerial` ENUM('Pastor Asociado', 'Laico', 'Licenciado', 'Ministro Ordenado') NOT NULL DEFAULT 'Pastor Asociado'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE `pastores` MODIFY COLUMN `nivel_ministerial` ENUM('Colaborador', 'Laico', 'Licenciado', 'Ministro Ordenado') NOT NULL DEFAULT 'Colaborador'");

        DB::table('pastores')
            ->where('nivel_ministerial', 'Pastor Asociado')
            ->update(['nivel_ministerial' => 'Colaborador']);
    }
};
