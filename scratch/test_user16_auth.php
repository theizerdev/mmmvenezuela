<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::find(16);
echo "User 16: {$user->name}\n";
echo "Email: {$user->email}\n";
echo "Username: {$user->username}\n";
echo "Status: {$user->status}\n";
echo "Must change password: " . ($user->must_change_password ? 'YES' : 'NO') . "\n";
echo "Password hash starts with: " . substr($user->password, 0, 10) . "...\n";

// Let's check when his password was set
echo "Password changed at: {$user->password_changed_at}\n";
