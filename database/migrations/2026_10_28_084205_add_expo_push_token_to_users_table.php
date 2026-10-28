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
        Schema::table('users', function (Blueprint $table) {
            $table->string('expo_push_token', 255)->nullable()->after('remember_token')->index();
            $table->boolean('push_notificaciones_activas')->default(true)->after('expo_push_token');
            $table->boolean('push_modo_silencioso')->default(false)->after('push_notificaciones_activas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'expo_push_token',
                'push_notificaciones_activas',
                'push_modo_silencioso',
            ]);
        });
    }
};
