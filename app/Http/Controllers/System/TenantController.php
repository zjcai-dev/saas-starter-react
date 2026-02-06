<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreTenantRequest;
use App\Models\System\Tenant;
use App\Services\System\TenantService;
use Illuminate\Http\JsonResponse;

class TenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    public function store(StoreTenantRequest $request)
    {
        $validated = $request->validated();

        $tenant = $this->tenantService->createTenant($validated);

        return redirect()->back()->with('success', 'Tenant created successfully!');
    }

    /**
     * Cancela un tenant y comienza el período de gracia de 30 días.
     */
    public function cancel(Tenant $tenant): JsonResponse
    {
        $tenant = $this->tenantService->cancelTenant($tenant);

        return response()->json($tenant);
    }

    /**
     * Restaura un tenant cancelado (si está dentro del período de gracia).
     */
    public function restore(Tenant $tenant): JsonResponse
    {
        $tenant = $this->tenantService->restoreTenant($tenant);

        return response()->json($tenant);
    }
}
