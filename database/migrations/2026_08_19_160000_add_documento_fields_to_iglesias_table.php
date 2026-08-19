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
            $table->string('documento_path')->nullable()->after('donde_medio_comunicacion');
            $table->string('documento_nombre')->nullable()->after('documento_path');
            $table->unsignedBigInteger('documento_size')->nullable()->after('documento_nombre');
            $table->string('documento_mime')->nullable()->after('documento_size');
            $table->timestamp('documento_updated_at')->nullable()->after('documento_mime');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iglesias', function (Blueprint $table) {
            $table->dropColumn([
                'documento_path',
                'documento_nombre',
                'documento_size',
                'documento_mime',
                'documento_updated_at',
            ]);
        });
    }
};
