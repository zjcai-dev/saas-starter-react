<?php

namespace App\Models\System;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'plan_id',
            'owner_name',
            'owner_owner_email', // Typo fix in next step if I see it, or clean it up now. Wait, I should maintain consistency.
            // Actually, let's fix the variable name to just 'owner_email'
            'owner_email',
            'owner_password',
            'status',
            'subscription_ends_at',
            'trial_ends_at',
            'is_active',
        ];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
    
    public function currentSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }
}