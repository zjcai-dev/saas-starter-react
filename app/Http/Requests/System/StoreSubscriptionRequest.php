<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tenant_id' => ['required', 'string', 'exists:tenants,id'],
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],
            'trial_ends_at' => ['nullable', 'date'],
        ];
    }
}

