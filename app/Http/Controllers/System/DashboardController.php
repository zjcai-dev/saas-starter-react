<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\System\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Display the system dashboard with key metrics.
     */
    public function index()
    {
        // 1. Key Performance Indicators (KPIs)
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'Active')->count(),
            'trial_tenants' => Tenant::where('status', 'Trial')->count(),
            'new_tenants_this_month' => Tenant::where('created_at', '>=', now()->startOfMonth())->count(),
        ];

        // 2. Recent Tenants (Last 5)
        $recentTenants = Tenant::with('plan')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                    'email' => $tenant->owner_email, // Assuming we want owner email here
                    'status' => $tenant->status,
                    'plan_name' => $tenant->plan ? $tenant->plan->name : 'N/A',
                    'created_at' => $tenant->created_at->diffForHumans(),
                    'domain_url' => $tenant->domains->first()?->domain 
                        ? (request()->secure() ? 'https://' : 'http://') . $tenant->domains->first()->domain 
                        : null,
                ];
            });

        // 3. Plan Distribution
        $planDistribution = Tenant::select('plan_id', DB::raw('count(*) as count'))
            ->groupBy('plan_id')
            ->with('plan') // Eager load plan details
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->plan ? $item->plan->name : 'No Plan',
                    'count' => $item->count,
                ];
            });

        return Inertia::render('system/dashboard', [
            'stats' => $stats,
            'recentTenants' => $recentTenants,
            'planDistribution' => $planDistribution,
        ]);
    }
}
