<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreTenantRequest;
use App\Models\System\Tenant;
use App\Services\System\TenantService;
use App\Models\System\Plan;

class TenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    public function index(\Illuminate\Http\Request $request): \Inertia\Response
    {
        $filters = $request->only(['search', 'status', 'plan_id', 'is_active']);
        
        $tenants = $this->tenantService->listTenants($filters);

        return \Inertia\Inertia::render('system/tenants/index', [
            'tenants' => \App\Http\Resources\System\TenantResource::collection($tenants),
            'filters' => $filters,
            'stats' => [
                'total' => \App\Models\System\Tenant::count(),
                'active' => \App\Models\System\Tenant::where('status', 'Active')->count(),
                'trial' => \App\Models\System\Tenant::where('status', 'Trial')->count(),
                'canceled' => \App\Models\System\Tenant::where('status', 'Canceled')->count(),
            ],
            'plans' => Plan::where('is_active', true)->get()->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'price_formatted' => $plan->currency . ' ' . number_format($plan->price, 2),
                ];
            }),
        ]);
    }

    /**
     * Store a newly created tenant in storage.
     */
    public function store(StoreTenantRequest $request)
    {
        $validated = $request->validated();

        $tenant = $this->tenantService->createTenant($validated);

        return redirect()->back()->with('success', 'Tenant created successfully! Database and domain configured.');
    }

    /**
     * Update the specified tenant in storage.
     */
    public function update(\App\Http\Requests\System\UpdateTenantRequest $request, Tenant $tenant)
    {
        $tenant = $this->tenantService->updateTenant($tenant, $request->validated());

        return redirect()->back()->with('success', 'Tenant updated successfully!');
    }

    /**
     * Remove the specified tenant from storage.
     */
    public function destroy(Tenant $tenant)
    {
        try {
            $this->tenantService->deleteTenant($tenant);
            return redirect()->back()->with('success', 'Tenant deleted successfully! Database and domains removed.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Cancela un tenant y comienza el período de gracia de 30 días.
     */
    public function cancel(Tenant $tenant)
    {
        $tenant = $this->tenantService->cancelTenant($tenant);

        return redirect()->back()->with('success', 'Tenant canceled successfully. Grace period started.');
    }

    /**
     * Restaura un tenant cancelado (si está dentro del período de gracia).
     */
    public function restore(Tenant $tenant)
    {
        try {
            $tenant = $this->tenantService->restoreTenant($tenant);
            return redirect()->back()->with('success', 'Tenant restored successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
