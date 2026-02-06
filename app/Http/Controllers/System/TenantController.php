<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreTenantRequest;
use App\Services\System\TenantService;

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
}
