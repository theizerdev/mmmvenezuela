<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class PastoresImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Iniciando importación automática de pastores desde pastores30122025.sql...');
        Artisan::call('import:pastores');
        $this->command->info(Artisan::output());
    }
}
