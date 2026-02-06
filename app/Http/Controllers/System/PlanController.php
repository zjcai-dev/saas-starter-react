<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StorePlanRequest;
use App\Http\Requests\System\UpdatePlanRequest;
use App\Models\System\Plan;
use App\Services\System\PlanService;
use Illuminate\Http\JsonResponse;

class PlanController extends Controller
{
    public function __construct(
        protected PlanService $planService
    ) {
    }

    public function index(): JsonResponse
    {
        $plans = $this->planService->listPlans();

        return response()->json($plans);
    }

    public function store(StorePlanRequest $request): JsonResponse
    {
        $plan = $this->planService->createPlan($request->validated());

        return response()->json($plan, 201);
    }

    public function show(Plan $plan): JsonResponse
    {
        return response()->json($plan->load('features'));
    }

    public function update(UpdatePlanRequest $request, Plan $plan): JsonResponse
    {
        $plan = $this->planService->updatePlan($plan, $request->validated());

        return response()->json($plan);
    }

    public function destroy(Plan $plan): JsonResponse
    {
        $this->planService->deletePlan($plan);

        return response()->json([], 204);
    }
}

