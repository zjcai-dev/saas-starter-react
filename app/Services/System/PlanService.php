<?php

namespace App\Services\System;

use App\Models\System\Plan;
use Illuminate\Support\Facades\DB;

class PlanService
{
    public function listPlans()
    {
        return Plan::with('features')->orderBy('price')->get();
    }

    public function createPlan(array $data): Plan
    {
        return DB::transaction(function () use ($data) {
            $features = $data['features'] ?? [];
            unset($data['features']);

            /** @var Plan $plan */
            $plan = Plan::create($data);

            if (!empty($features)) {
                $syncData = [];
                foreach ($features as $feature) {
                    $syncData[$feature['id']] = ['value' => $feature['value'] ?? null];
                }
                $plan->features()->sync($syncData);
            }

            return $plan->load('features');
        });
    }

    public function updatePlan(Plan $plan, array $data): Plan
    {
        return DB::transaction(function () use ($plan, $data) {
            $features = $data['features'] ?? null;
            unset($data['features']);

            $plan->update($data);

            if ($features !== null) {
                $syncData = [];
                foreach ($features as $feature) {
                    $syncData[$feature['id']] = ['value' => $feature['value'] ?? null];
                }
                $plan->features()->sync($syncData);
            }

            return $plan->load('features');
        });
    }

    public function deletePlan(Plan $plan): void
    {
        $plan->features()->detach();
        $plan->delete();
    }
}

