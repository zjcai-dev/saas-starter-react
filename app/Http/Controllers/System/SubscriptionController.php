<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Http\Requests\System\StoreSubscriptionRequest;
use App\Models\System\Plan;
use App\Models\System\Tenant;
use App\Services\System\SubscriptionService;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function __construct(
        protected SubscriptionService $subscriptionService
    ) {
    }

    public function index(Tenant $tenant): JsonResponse
    {
        $subscriptions = $this->subscriptionService->listSubscriptionsForTenant($tenant);

        return response()->json($subscriptions);
    }

    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $tenant = Tenant::findOrFail($data['tenant_id']);
        $plan = Plan::findOrFail($data['plan_id']);

        $subscription = $this->subscriptionService->createSubscription($tenant, $plan, $data);

        return response()->json($subscription, 201);
    }
}

