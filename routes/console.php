<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Programador de Tareas Automáticas del Sistema MMM Venezuela
// Envía felicitaciones diarias de cumpleaños a pastores dos veces al día: 8:00 AM y 10:00 PM
Schedule::command('pastores:felicitar-cumpleaneros')->dailyAt('08:00');
Schedule::command('pastores:felicitar-cumpleaneros')->dailyAt('22:00');
