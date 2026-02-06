<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'currency',
        'duration_in_days',
        'is_free',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }

    public function features(): BelongsToMany
    {
        return $this->belongsToMany(Feature::class, 'feature_plan')
                    ->withPivot('value')
                    ->withTimestamps();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
