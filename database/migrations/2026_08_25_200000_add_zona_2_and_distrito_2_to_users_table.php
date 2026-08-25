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
            if (! Schema::hasColumn('users', 'zona_2')) {
                $table->string('zona_2')->nullable()->after('distrito');
            }
            if (! Schema::hasColumn('users', 'distrito_2')) {
                $table->string('distrito_2')->nullable()->after('zona_2');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['zona_2', 'distrito_2']);
        });
    }
};
