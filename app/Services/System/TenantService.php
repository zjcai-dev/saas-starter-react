<?php

namespace App\Services\System;

use App\Models\System\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TenantService
{
    public function createTenant(array $data)
    {
        
        // Usamos el nombre del tenant para el slug de la base de datos
        $tenantNameSlug = Str::slug($data['name'], '_');
        
        // Nombre de BD: tenant_{name}
        $dbName = 'tenant_' . $tenantNameSlug; 

        Log::info('Creating Tenant (Phase 1)', ['name' => $data['name'], 'db_name' => $dbName]);

        // 1. Create Tenant (Trigger creates DB)
        $tenant = Tenant::create([
            'id' => Str::uuid(), // ID del tenant (UUID) independiente del nombre de la BD
            'name' => $data['name'],
            'owner_name' => $data['owner_name'],
            'owner_email' => $data['owner_email'],
            'owner_password' => Hash::make($data['owner_password']),
            'plan_id' => $data['plan_id'] ?? null,
            'status' => $data['status'] ?? 'Trial', // Default to Trial if not provided
            'is_active' => true,
            'tenancy_db_name' => $dbName, // Nombre de BD personalizado tenant_{name}
        ]);

        Log::info('Tenant created successfully', ['tenant_id' => $tenant->id]);

        try {
            // 2. Create Domain - Store FULL domain (subdomain.app_base_url)
            // Example: react.saas-starter-react.test
            $baseDomain = config('app.url_base', 'localhost');
            $fullDomain = $data['domain'] . '.' . $baseDomain;

            $tenant->createDomain([
                'domain' => $fullDomain,
            ]);

            Log::info('Domain created for tenant', ['tenant_id' => $tenant->id, 'domain' => $fullDomain]);

            // 3. Create Admin User in Tenant DB
            $tenant->run(function () use ($data, $tenant) {
                \App\Models\Tenant\User::create([
                    'name' => $data['owner_name'],
                    'email' => $data['owner_email'],
                    // Importante: el modelo de usuario del tenant ya tiene cast 'password' => 'hashed',
                    // así que aquí le pasamos la contraseña en texto plano para evitar doble hash.
                    'password' => $data['owner_password'],
                ]);
                Log::info('Tenant Admin User created', ['tenant_id' => $tenant->id, 'email' => $data['owner_email']]);
            });

            Log::info('Tenant initialization complete', ['tenant_id' => $tenant->id]);

            return $tenant;

        } catch (\Exception $e) {
            // Si falla la configuración posterior, eliminamos el tenant para no dejar basura.
            // Esto eliminará la BD también.
            $tenant->delete();
            throw $e;
        }
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

    /**
     * Lista tenants con paginación y filtros.
     */
    public function listTenants(array $filters = [])
    {
        $query = Tenant::query()
            ->with(['plan', 'domains']);

        // Search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('owner_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('owner_email', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('domains', function ($domainQuery) use ($filters) {
                      $domainQuery->where('domain', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Plan filter
        if (!empty($filters['plan_id'])) {
            $query->where('plan_id', $filters['plan_id']);
        }

        // Active filter
        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(10);
    }

    /**
     * Actualiza un tenant.
     */
    public function updateTenant(Tenant $tenant, array $data): Tenant
    {
        $tenant->update($data);

        return $tenant->fresh(['plan', 'domains']);
    }

    /**
     * Elimina definitivamente un tenant.
     * Solo se puede eliminar si está cancelado y pasó el período de gracia.
     */
    public function deleteTenant(Tenant $tenant): void
    {
        // Validar que esté cancelado
        if ($tenant->status !== 'Canceled') {
            throw new \RuntimeException('Solo se pueden eliminar tenants cancelados.');
        }

        // Validar período de gracia
        if ($tenant->canceled_at && $tenant->canceled_at->gt(now()->subDays(30))) {
            throw new \RuntimeException('No se puede eliminar el tenant durante el período de gracia de 30 días.');
        }

        DB::transaction(function () use ($tenant) {
            // Eliminar dominios
            $tenant->domains()->delete();

            // Eliminar base de datos del tenant
            $tenant->deleteDatabase();

            // Eliminar tenant
            $tenant->delete();
        });
    }
}
