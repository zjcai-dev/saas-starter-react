<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:plans,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'duration_in_days' => ['required', 'integer', 'min:1'],
            'is_free' => ['boolean'],
            'is_active' => ['boolean'],
            'features' => ['array'],
            'features.*.id' => ['required_with:features', 'integer', 'exists:features,id'],
            'features.*.value' => ['nullable', 'string'],
        ];
    }
}

