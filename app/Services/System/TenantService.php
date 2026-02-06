<?php

namespace App\Services\System;

use App\Models\System\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantService
{
    public function createTenant(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Usamos el nombre del tenant para el slug de la base de datos
            $tenantNameSlug = Str::slug($data['name'], '_');
            
            // Nombre de BD: tenant_{name}
            $dbName = 'tenant_' . $tenantNameSlug; 

            // Create Tenant
            $tenant = Tenant::create([
                'id' => Str::uuid(), // ID del tenant (UUID) independiente del nombre de la BD
                'name' => $data['name'],
                'owner_name' => $data['owner_name'],
                'owner_email' => $data['owner_email'],
                'owner_password' => Hash::make($data['owner_password']),
                'plan_id' => $data['plan_id'] ?? null,
                'tenancy_db_name' => $dbName, // Nombre de BD personalizado tenant_{name}
            ]);

            // Create Domain
            $tenant->createDomain([
                'domain' => $data['domain'],
            ]);

            // Create Admin User in Tenant DB
            $tenant->run(function () use ($data) {
                \App\Models\Tenant\User::create([
                    'name' => $data['owner_name'],
                    'email' => $data['owner_email'],
                    // Importante: el modelo de usuario del tenant ya tiene cast 'password' => 'hashed',
                    // así que aquí le pasamos la contraseña en texto plano para evitar doble hash.
                    'password' => $data['owner_password'],
                ]);
            });

            return $tenant;
        });
    }

    /**
     * Marca un tenant como cancelado y desactiva su acceso.
     * El borrado definitivo se hará tras el período de gracia (30 días).
     */
    public function cancelTenant(Tenant $tenant): Tenant
    {
        $tenant->update([
            'status' => 'Canceled',
            'is_active' => false,
            'canceled_at' => now(),
        ]);

        return $tenant;
    }

    /**
     * Restaura un tenant cancelado dentro del período de gracia.
     */
    public function restoreTenant(Tenant $tenant): Tenant
    {
        // Si no está cancelado, no hacemos nada especial.
        if ($tenant->status !== 'Canceled') {
            return $tenant;
        }

        // Si ya pasó el período de gracia, no se debería poder restaurar.
        if ($tenant->canceled_at && $tenant->canceled_at->lt(now()->subDays(30))) {
            throw new \RuntimeException('El período de gracia de 30 días ha expirado para este tenant.');
        }

        $tenant->update([
            'status' => 'Active',
            'is_active' => true,
            'canceled_at' => null,
        ]);

        return $tenant;
    }
}
