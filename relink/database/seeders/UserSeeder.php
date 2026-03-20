<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;


class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder de Administrador
        User::create([
            'name'     => 'Admin',
            'email'    => 'admin@gmail.com',
            'password' => Hash::make('12345678'), 
            'rol'      => UserRole::ADMIN->value, 
            'activo'   => 1,
            'online'   => 0,
            'email_verified_at' => now()
        ]);

        // Seeder cliente 1
        User::create([
            'name'     => 'lenny',
            'email'    => 'lenny@gmail.com',
            'password' => Hash::make('12345678'),
            'rol'      => UserRole::CLIENTE->value,
            'activo'   => 1,
            'online'   => 0,
            'email_verified_at' => now()
        ]);

        // Seeder cliente 2
        User::create([
            'name'     => 'alvaro',
            'email'    => 'alvaro@gmail.com',
            'password' => Hash::make('12345678'),
            'rol'      => UserRole::CLIENTE->value,
            'activo'   => 1,
            'online'   => 0,
            'email_verified_at' => now()
        ]);
    }
}
