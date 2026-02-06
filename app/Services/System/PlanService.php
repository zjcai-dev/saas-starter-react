<?php

namespace App\Services\System;

use App\Models\System\Plan;
use Illuminate\Support\Facades\DB;

class PlanService
{
    public function listPlans(array $filters = [])
    {
        $query = Plan::query()->withCount('tenants');

        // Search filter
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Status filter
        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        // Type filter (free/paid)
        if (isset($filters['is_free']) && $filters['is_free'] !== '') {
            $query->where('is_free', (bool) $filters['is_free']);
        }

        return $query->orderBy('price')->paginate(10);
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
