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
            if (!Schema::hasColumn('pastores', 'foto_cedula')) {
                $table->string('foto_cedula')->nullable()->after('foto');
            }
            if (!Schema::hasColumn('pastores', 'email')) {
                $table->string('email')->nullable()->after('telefono_tlf');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pastores', function (Blueprint $table) {
            if (Schema::hasColumn('pastores', 'foto_cedula')) {
                $table->dropColumn('foto_cedula');
            }
            if (Schema::hasColumn('pastores', 'email')) {
                $table->dropColumn('email');
            }
        });
    }
};
