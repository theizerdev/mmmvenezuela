<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * Seed the roles and assign permissions.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $rolesToKeep = [
            'Super Administrador',
            'super-admin',
            'Supervisor Nacional',
            'Presbitero',
            'Junta Nacional',
            'Secretaria Nacional',
        ];

        // Delete obsolete roles except those in $rolesToKeep
        Role::whereNotIn('name', $rolesToKeep)->delete();

        // 1. Super Administrador (all permissions)
        $superAdmin = Role::firstOrCreate(['name' => 'Super Administrador', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        $superAdminAlias = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdminAlias->syncPermissions(Permission::all());

        // Permissions for roles with full access (view, create, edit) to Pastores and Extensiones
        $fullPastoresExtensionesPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'pastores.view',
            'pastores.create',
            'pastores.edit',
            'extensiones.view',
            'extensiones.create',
            'extensiones.edit',
        ])->get();

        // Permissions for Presbitero (view and edit only, no create/delete)
        $presbiteroPermissions = Permission::whereIn('name', [
            'dashboard.view',
            'pastores.view',
            'pastores.edit',
            'extensiones.view',
            'extensiones.edit',
        ])->get();

        // 2. Supervisor Nacional: ver, crear y editar pastores y extensiones de todas las zonas
        $supervisor = Role::firstOrCreate(['name' => 'Supervisor Nacional', 'guard_name' => 'web']);
        $supervisor->syncPermissions($fullPastoresExtensionesPermissions);

        // 3. Presbitero: ver y editar pastores y extensiones de sus zonas
        $presbitero = Role::firstOrCreate(['name' => 'Presbitero', 'guard_name' => 'web']);
        $presbitero->syncPermissions($presbiteroPermissions);

        // 4. Junta Nacional: ver, crear y editar pastores y extensiones de todas las zonas
        $junta = Role::firstOrCreate(['name' => 'Junta Nacional', 'guard_name' => 'web']);
        $junta->syncPermissions($fullPastoresExtensionesPermissions);

        // 5. Secretaria Nacional: ver, crear y editar pastores y extensiones de todas las zonas
        $secretaria = Role::firstOrCreate(['name' => 'Secretaria Nacional', 'guard_name' => 'web']);
        $secretaria->syncPermissions($fullPastoresExtensionesPermissions);

        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
