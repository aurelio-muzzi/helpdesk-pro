<?php

namespace App\Http\Requests\Api\V1\Priority;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $priority = $this->route('priority');
        $priorityId = is_object($priority) ? $priority->id : $priority;

        return [
            'name' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('priorities', 'name')->ignore($priorityId),
            ],
            'display_name' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'order' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'color' => ['sometimes', 'string', 'max:20'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
