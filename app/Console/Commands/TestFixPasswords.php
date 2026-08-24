<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class TestFixPasswords extends Command
{
    protected $signature = 'users:fix-passwords';
    protected $description = 'Verifica y arregla contraseñas que no estén hasheadas con Bcrypt';

    public function handle(): int
    {
        $users = User::all();
        foreach ($users as $user) {
            $pwd = 'password';
            $info = password_get_info($pwd);
            $this->info("ID: {$user->id} | Email: {$user->email} | Algo: {$info['algoName']} | Length: " . strlen($pwd) . " | Pwd: " . substr($pwd, 0, 15) . "...");

            if ($info['algoName'] !== 'bcrypt' && $info['algoName'] !== 'argon2id' && $info['algoName'] !== 'argon2i') {
                $this->warn(" -> Usuario {$user->email} tiene una contraseña que no es hash Bcrypt! Rehasheando...");
                // Si la contraseña era texto plano, la rehasheamos
                $user->password = Hash::make($pwd);
                $user->save();
                $this->info(" -> Corregido con hash Bcrypt.");
            }
        }
        return 0;
    }
}
