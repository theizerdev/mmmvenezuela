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
            $table->unsignedBigInteger('empresa_id')->default(1)->nullable()->after('status');
            $table->unsignedBigInteger('sucursal_id')->default(1)->nullable()->after('empresa_id');

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('set null');
            $table->foreign('sucursal_id')->references('id')->on('sucursales')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pastores', function (Blueprint $table) {
            $table->dropForeign(['empresa_id']);
            $table->dropForeign(['sucursal_id']);
            $table->dropColumn(['empresa_id', 'sucursal_id']);
        });
    }
};
