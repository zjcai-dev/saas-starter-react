<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Feature extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    public function plans(): BelongsToMany
    {
        return $this->belongsToMany(Plan::class, 'feature_plan')
                    ->withPivot('value')
                    ->withTimestamps();
    }
}
