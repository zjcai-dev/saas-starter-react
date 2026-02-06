<?php

namespace App\Services\System;

use App\Models\System\Plan;
use App\Models\System\Subscription;
use App\Models\System\Tenant;
use Illuminate\Support\Facades\DB;

class SubscriptionService
{
    public function listSubscriptionsForTenant(Tenant $tenant)
    {
        return $tenant->subscriptions()->with('plan')->latest()->get();
    }

    public function createSubscription(Tenant $tenant, Plan $plan, array $data): Subscription
    {
        return DB::transaction(function () use ($tenant, $plan, $data) {
            $subscription = $tenant->subscriptions()->create([
                'plan_id' => $plan->id,
                'quantity' => $data['quantity'] ?? 1,
                'trial_ends_at' => $data['trial_ends_at'] ?? null,
            ]);

            // Aquí podrías integrar lógica con Stripe/Braintree, etc.

            return $subscription->load('plan');
        });
    }
}

