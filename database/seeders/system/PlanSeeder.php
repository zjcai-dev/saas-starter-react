<?php

namespace Database\Seeders\System;

use App\Models\System\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Perfect for getting started with basic features',
                'price' => 0.00,
                'currency' => 'USD',
                'duration_in_days' => 30,
                'is_free' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Ideal for small teams and growing businesses',
                'price' => 29.00,
                'currency' => 'USD',
                'duration_in_days' => 30,
                'is_free' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Advanced features for professional teams',
                'price' => 79.00,
                'currency' => 'USD',
                'duration_in_days' => 30,
                'is_free' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Complete solution for large organizations',
                'price' => 199.00,
                'currency' => 'USD',
                'duration_in_days' => 30,
                'is_free' => false,
                'is_active' => true,
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }

        $this->command->info('✓ ' . count($plans) . ' subscription plans created successfully');
    }
}
