<?php

namespace App\Http\Resources\System;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
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
            'tenancy_db_name' => $this->tenancy_db_name,
            'owner_name' => $this->owner_name,
            'owner_email' => $this->owner_email,
            'status' => $this->status,
            'status_badge' => $this->getStatusBadge(),
            'is_active' => $this->is_active,
            'plan' => $this->whenLoaded('plan', function () {
                return [
                    'id' => $this->plan->id,
                    'name' => $this->plan->name,
                    'price_formatted' => $this->plan->currency . ' ' . number_format($this->plan->price, 2),
                ];
            }),
            'domain_url' => $this->whenLoaded('domains', function () {
                $domain = $this->domains->first()?->domain;
                return $domain ? (request()->secure() ? 'https://' : 'http://') . $domain : null;
            }),
            'domain' => $this->whenLoaded('domains', function () {
                return $this->domains->first()?->domain;
            }),
            'subscription_ends_at' => $this->subscription_ends_at?->format('Y-m-d H:i:s'),
            'trial_ends_at' => $this->trial_ends_at?->format('Y-m-d H:i:s'),
            'canceled_at' => $this->canceled_at?->format('Y-m-d H:i:s'),
            'grace_period_days' => $this->getGracePeriodDays(),
            'can_restore' => $this->canRestore(),
            'can_delete' => $this->canDelete(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get status badge variant
     */
    private function getStatusBadge(): string
    {
        return match ($this->status) {
            'Trial' => 'info',
            'Active' => 'success',
            'Suspended' => 'warning',
            'Canceled' => 'destructive',
            default => 'secondary',
        };
    }

    /**
     * Get remaining grace period days
     */
    private function getGracePeriodDays(): ?int
    {
        if (!$this->canceled_at) {
            return null;
        }

        $gracePeriodEnd = $this->canceled_at->addDays(30);
        $daysRemaining = now()->diffInDays($gracePeriodEnd, false);

        return $daysRemaining > 0 ? (int) $daysRemaining : 0;
    }

    /**
     * Check if tenant can be restored
     */
    private function canRestore(): bool
    {
        if ($this->status !== 'Canceled' || !$this->canceled_at) {
            return false;
        }

        return $this->canceled_at->gt(now()->subDays(30));
    }

    /**
     * Check if tenant can be deleted
     */
    private function canDelete(): bool
    {
        if ($this->status !== 'Canceled' || !$this->canceled_at) {
            return false;
        }

        // Can only delete after grace period
        return $this->canceled_at->lte(now()->subDays(30));
    }
}
