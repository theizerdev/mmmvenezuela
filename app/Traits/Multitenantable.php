<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

trait Multitenantable
{
    public static function bootMultitenantable(): void
    {
        // Auto-fill empresa_id, sucursal_id, zona y distrito al crear registros
        static::creating(function ($model) {
            static $isResolvingCreating = false;

            if ($isResolvingCreating) {
                return;
            }

            $isResolvingCreating = true;

            try {
                if (auth()->check()) {
                    $user = auth()->user();
                    if (! $user) {
                        return;
                    }

                    $table = $model->getTable();

                    if ($table !== 'empresas' && isset($user->empresa_id) && $user->empresa_id) {
                        if (! isset($model->empresa_id) || empty($model->empresa_id)) {
                            $model->empresa_id = $user->empresa_id;
                        }
                    }

                    if ($table !== 'sucursales' && isset($user->sucursal_id) && $user->sucursal_id) {
                        if (! isset($model->sucursal_id) || empty($model->sucursal_id)) {
                            $model->sucursal_id = $user->sucursal_id;
                        }
                    }

                    if (Schema::hasColumn($table, 'zona') && isset($user->zona) && ! empty($user->zona)) {
                        if (! isset($model->zona) || empty($model->zona)) {
                            $model->zona = $user->zona;
                        }
                    }

                    if (Schema::hasColumn($table, 'distrito') && isset($user->distrito) && ! empty($user->distrito)) {
                        if (! isset($model->distrito) || empty($model->distrito)) {
                            $model->distrito = $user->distrito;
                        }
                    }
                }
            } finally {
                $isResolvingCreating = false;
            }
        });

        // Global scope: filtra por empresa, sucursal y zona/distrito del usuario autenticado según su rol
        static::addGlobalScope('multitenancy', function (Builder $builder) {
            static $isResolvingUser = false;

            if ($isResolvingUser) {
                return;
            }

            $isResolvingUser = true;

            try {
                if (! auth()->check()) {
                    return;
                }

                $user = auth()->user();

                if (! $user) {
                    return;
                }

                // Verificar si el usuario es Super Administrador
                $isSuperAdmin = method_exists($user, 'isSuperAdmin')
                    ? $user->isSuperAdmin()
                    : (method_exists($user, 'hasAnyRole') && $user->hasAnyRole(['Super Administrador', 'super-admin', 'Super Admin', 'super_admin']));

                if ($isSuperAdmin) {
                    return;
                }

                $table = $builder->getModel()->getTable();

                // 1. Filtrado por Empresa
                if ($table === 'empresas') {
                    if ($user->empresa_id) {
                        $builder->where("{$table}.id", $user->empresa_id);
                    }
                } else {
                    if (Schema::hasColumn($table, 'empresa_id') && $user->empresa_id) {
                        $builder->where("{$table}.empresa_id", $user->empresa_id);
                    }
                }

                // 2. Filtrado por Sucursal
                if ($table === 'empresas') {
                    // La tabla empresas no posee columna sucursal_id
                } elseif ($table === 'sucursales') {
                    if ($user->sucursal_id) {
                        $builder->where("{$table}.id", $user->sucursal_id);
                    }
                } else {
                    if (Schema::hasColumn($table, 'sucursal_id') && $user->sucursal_id) {
                        $builder->where("{$table}.sucursal_id", $user->sucursal_id);
                    }
                }

                // 3. Filtrado por Zona y Distrito según el Rol
                // Los roles Supervisor Nacional, Junta Nacional y Secretaria Nacional ven todas las zonas
                $hasNationalAccess = method_exists($user, 'hasAnyRole') && $user->hasAnyRole([
                    'Supervisor Nacional',
                    'Junta Nacional',
                    'Secretaria Nacional',
                ]);

                if (! $hasNationalAccess) {
                    if (Schema::hasColumn($table, 'zona') && ! empty($user->zona)) {
                        $builder->where("{$table}.zona", $user->zona);
                    }

                    if (Schema::hasColumn($table, 'distrito') && ! empty($user->distrito)) {
                        $builder->where("{$table}.distrito", $user->distrito);
                    }
                }
            } finally {
                $isResolvingUser = false;
            }
        });
    }

    /**
     * Desactivar el scope de multitenancy para consultas cross-tenant.
     * Uso: Modelo::withoutTenant()->get();
     */
    public static function withoutTenant(): Builder
    {
        return static::withoutGlobalScope('multitenancy');
    }
}


