<?php

namespace App\Models\System;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Stancl\Tenancy\Database\Concerns\CentralConnection;

class Setting extends Model
{
    use HasFactory, CentralConnection;

    protected $fillable = ['key', 'value'];
}
