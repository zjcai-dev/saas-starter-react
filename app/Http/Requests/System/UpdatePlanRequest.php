<?php

namespace App\Http\Requests\System;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('plans', 'slug')->ignore($this->route('plan')),
            ],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'required', 'string', 'size:3'],
            'duration_in_days' => ['sometimes', 'required', 'integer', 'min:1'],
            'is_free' => ['boolean'],
            'is_active' => ['boolean'],
            'features' => ['array'],
            'features.*.id' => ['required_with:features', 'integer', 'exists:features,id'],
            'features.*.value' => ['nullable', 'string'],
        ];
    }
}

