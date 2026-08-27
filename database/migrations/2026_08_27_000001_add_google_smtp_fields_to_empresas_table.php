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
            if (! Schema::hasColumn('empresas', 'google_smtp_host')) {
                $table->string('google_smtp_host', 255)->nullable()->default('smtp.gmail.com')->after('jaak_active');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_port')) {
                $table->integer('google_smtp_port')->nullable()->default(587)->after('google_smtp_host');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_encryption')) {
                $table->string('google_smtp_encryption', 20)->nullable()->default('tls')->after('google_smtp_port');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_email')) {
                $table->string('google_smtp_email', 255)->nullable()->after('google_smtp_encryption');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_password')) {
                $table->text('google_smtp_password')->nullable()->after('google_smtp_email');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_from_address')) {
                $table->string('google_smtp_from_address', 255)->nullable()->after('google_smtp_password');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_from_name')) {
                $table->string('google_smtp_from_name', 255)->nullable()->after('google_smtp_from_address');
            }
            if (! Schema::hasColumn('empresas', 'google_smtp_active')) {
                $table->boolean('google_smtp_active')->default(false)->after('google_smtp_from_name');
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
                'google_smtp_host',
                'google_smtp_port',
                'google_smtp_encryption',
                'google_smtp_email',
                'google_smtp_password',
                'google_smtp_from_address',
                'google_smtp_from_name',
                'google_smtp_active',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('empresas', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
