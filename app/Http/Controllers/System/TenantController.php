<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Services\System\TenantService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class TenantController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'string', 'email', 'max:255'],
            'owner_password' => ['required', 'confirmed', Password::defaults()],
            'domain' => ['required', 'string', 'max:255', 'unique:domains,domain'],
            'plan_id' => ['nullable', 'exists:plans,id'],
        ]);

        $tenant = $this->tenantService->createTenant($validated);

        return redirect()->back()->with('success', 'Tenant created successfully!');
    }
}
