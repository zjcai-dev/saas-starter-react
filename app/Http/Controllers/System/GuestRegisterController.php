<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\System\Plan;
use App\Models\System\Setting;
use App\Services\System\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class GuestRegisterController extends Controller
{
    protected $tenantService;

    public function __construct(TenantService $tenantService)
    {
        $this->tenantService = $tenantService;
    }

    public function index()
    {
        // Check if guest registration is enabled
        $setting = Setting::where('key', 'guest_registration')->first();
        $enabled = $setting ? (bool) $setting->value : false;

        if (!$enabled) {
            return Inertia::render('system/guest-register/disabled');
        }

        // Get Free Plan (assuming there is one, or just pick the first one)
        // Ideally we should have a 'is_free' or 'is_default' flag on plans
        // For now, let's try to find a plan with price 0
        $freePlan = Plan::where('price', 0)->first();

        return Inertia::render('system/guest-register/index', [
            'app_url_base' => config('app.url_base'),
            'free_plan' => $freePlan ? [
                'id' => $freePlan->id,
                'name' => $freePlan->name,
                'description' => $freePlan->description,
            ] : null,
        ]);
    }

    public function store(Request $request)
    {
        // Check availability again
        $setting = Setting::where('key', 'guest_registration')->first();
        if (!($setting ? (bool) $setting->value : false)) {
            abort(403, 'Registration is disabled.');
        }

        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255', 'unique:tenants,name'],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'string', 'email', 'max:255'],
            'domain' => ['required', 'string', 'max:63', 'alpha_dash', 'unique:domains,domain'], // Max 63 for subdomain
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        // Find a free plan
        $freePlan = Plan::where('price', 0)->first();

        try {
            // Prepare data for TenantService
            // TenantService expects 'name' for company name
            $data = [
                'name' => $validated['company_name'],
                'owner_name' => $validated['owner_name'],
                'owner_email' => $validated['owner_email'],
                'owner_password' => $validated['password'],
                'domain' => $validated['domain'],
                'plan_id' => $freePlan ? $freePlan->id : null,
                'status' => 'Active', // Auto-activate free tenants? Or 'Trial'? Let's go with Active for free tiers generally.
            ];

            $tenant = $this->tenantService->createTenant($data);

            // Redirect to tenant domain login
            $protocol = request()->secure() ? 'https://' : 'http://';
            $tenantDomain = $tenant->domains->first()->domain;
            $redirectUrl = $protocol . $tenantDomain . '/login';

            return Inertia::location($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Guest registration failed: ' . $e->getMessage());
            return back()->withErrors(['submit' => 'Registration failed. Please try again. ' . $e->getMessage()]);
        }
    }
}
