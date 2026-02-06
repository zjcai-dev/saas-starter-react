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
                    'password' => Hash::make($data['owner_password']),
                ]);
            });

            return $tenant;
        });
    }
}
