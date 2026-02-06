<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StorePlanRequest;
use App\Http\Requests\System\UpdatePlanRequest;
use App\Http\Resources\System\PlanResource;
use App\Models\System\Plan;
use App\Services\System\PlanService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function __construct(
        protected PlanService $planService
    ) {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'is_active', 'is_free']);
        $plans = $this->planService->listPlans($filters);

        return Inertia::render('system/plans/index', [
            'plans' => PlanResource::collection($plans),
            'filters' => $filters,
            'stats' => [
                'total' => Plan::count(),
                'active' => Plan::where('is_active', true)->count(),
                'inactive' => Plan::where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(StorePlanRequest $request): RedirectResponse
    {
        $this->planService->createPlan($request->validated());

        return redirect()
            ->route('plans.index')
            ->with('success', 'Plan created successfully');
    }

    public function update(UpdatePlanRequest $request, Plan $plan): RedirectResponse
    {
        $this->planService->updatePlan($plan, $request->validated());

        return redirect()
            ->route('plans.index')
            ->with('success', 'Plan updated successfully');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        // Check if plan has active tenants
        if ($plan->tenants()->count() > 0) {
            return redirect()
                ->route('plans.index')
                ->with('error', 'Cannot delete plan with active tenants');
        }

        $this->planService->deletePlan($plan);

        return redirect()
            ->route('plans.index')
            ->with('success', 'Plan deleted successfully');
    }
}
