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
            if (! Schema::hasColumn('empresas', 'mailgun_domain')) {
                $table->string('mailgun_domain', 255)->nullable()->after('google_smtp_active');
            }
            if (! Schema::hasColumn('empresas', 'mailgun_secret')) {
                $table->text('mailgun_secret')->nullable()->after('mailgun_domain');
            }
            if (! Schema::hasColumn('empresas', 'mailgun_endpoint')) {
                $table->string('mailgun_endpoint', 100)->nullable()->default('api.mailgun.net')->after('mailgun_secret');
            }
            if (! Schema::hasColumn('empresas', 'mailgun_from_address')) {
                $table->string('mailgun_from_address', 255)->nullable()->after('mailgun_endpoint');
            }
            if (! Schema::hasColumn('empresas', 'mailgun_from_name')) {
                $table->string('mailgun_from_name', 255)->nullable()->after('mailgun_from_address');
            }
            if (! Schema::hasColumn('empresas', 'mailgun_active')) {
                $table->boolean('mailgun_active')->default(false)->after('mailgun_from_name');
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
                'mailgun_domain',
                'mailgun_secret',
                'mailgun_endpoint',
                'mailgun_from_address',
                'mailgun_from_name',
                'mailgun_active',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('empresas', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
