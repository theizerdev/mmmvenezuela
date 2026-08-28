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
            $table->string('mailpit_host')->nullable()->default('127.0.0.1')->after('mailgun_active');
            $table->integer('mailpit_port')->nullable()->default(1025)->after('mailpit_host');
            $table->string('mailpit_from_address')->nullable()->after('mailpit_port');
            $table->string('mailpit_from_name')->nullable()->after('mailpit_from_address');
            $table->integer('mailpit_web_port')->nullable()->default(8025)->after('mailpit_from_name');
            $table->boolean('mailpit_active')->default(false)->after('mailpit_web_port');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn([
                'mailpit_host',
                'mailpit_port',
                'mailpit_from_address',
                'mailpit_from_name',
                'mailpit_web_port',
                'mailpit_active',
            ]);
        });
    }
};
