<?php

namespace App\Http\Resources\System;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'price_formatted' => $this->currency . ' ' . number_format($this->price, 2),
            'currency' => $this->currency,
            'duration_in_days' => $this->duration_in_days,
            'duration_text' => $this->getDurationText(),
            'is_free' => $this->is_free,
            'is_active' => $this->is_active,
            'tenants_count' => $this->whenCounted('tenants'),
            'features' => $this->whenLoaded('features', function () {
                return $this->features->map(function ($feature) {
                    return [
                        'id' => $feature->id,
                        'name' => $feature->name,
                        'value' => $feature->pivot->value,
                    ];
                });
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get human-readable duration text
     */
    private function getDurationText(): string
    {
        $days = $this->duration_in_days;

        if ($days === 30) {
            return '1 month';
        }

        if ($days === 365) {
            return '1 year';
        }

        if ($days % 30 === 0) {
            $months = $days / 30;
            return $months . ' ' . ($months === 1 ? 'month' : 'months');
        }

        return $days . ' ' . ($days === 1 ? 'day' : 'days');
    }
}
