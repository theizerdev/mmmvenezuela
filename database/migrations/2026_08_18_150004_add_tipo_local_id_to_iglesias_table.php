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
            $table->unsignedBigInteger('tipo_local_id')->nullable()->after('parroquia_id');
            $table->foreign('tipo_local_id')->references('id')->on('tipo_locales')->onDelete('set null');
            $table->index('tipo_local_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iglesias', function (Blueprint $table) {
            $table->dropForeign(['tipo_local_id']);
            $table->dropColumn('tipo_local_id');
        });
    }
};