<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Admin\ExtensionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

$user = \App\Models\User::first();
if ($user) {
    Auth::login($user);
}

$controller = new ExtensionController();
$request = Request::create('/admin/extensiones/dashboard', 'GET', ['range' => '3m']);
$res = $controller->dashboard($request);

echo "Dashboard controller executed successfully! Class: " . get_class($res) . "\n";
