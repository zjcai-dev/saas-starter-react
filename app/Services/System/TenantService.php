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
            $ownerNameSlug = Str::slug($data['owner_name'], '_');
            
            // Generate DB name: tenant_ownername_random
            $dbName = 'tenant_' . $ownerNameSlug; 

            // Create Tenant
            $tenant = Tenant::create([
                'id' => Str::uuid(), // Stancl/Tenancy uses UUIDs by default
                'owner_name' => $data['owner_name'],
                'owner_email' => $data['owner_email'],
                'owner_password' => Hash::make($data['owner_password']),
                'plan_id' => $data['plan_id'] ?? null,
                'tenancy_db_name' => $dbName, // Custom DB Name
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
