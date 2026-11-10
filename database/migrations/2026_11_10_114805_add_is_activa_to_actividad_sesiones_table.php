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
        Schema::table('actividad_sesiones', function (Blueprint $table) {
            $table->boolean('is_activa')->default(false)->after('orden');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('actividad_sesiones', function (Blueprint $table) {
            $table->dropColumn('is_activa');
        });
    }
};
