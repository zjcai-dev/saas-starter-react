<?php

namespace App\Models\System;

use App\Models\System\Plan;
use App\Models\System\Subscription;
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
            'name',
            'tenancy_db_name',
            'plan_id',
            'owner_name',
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