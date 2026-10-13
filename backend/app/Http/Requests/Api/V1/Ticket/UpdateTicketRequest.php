<?php

namespace App\Http\Requests\Api\V1\Ticket;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
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
        return [
            'title' => ['sometimes', 'string', 'min:5', 'max:255'],
            'description' => ['sometimes', 'string', 'min:10'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'priority_id' => ['sometimes', 'integer', 'exists:priorities,id'],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:departments,id'],
            'team_id' => ['sometimes', 'nullable', 'integer', 'exists:teams,id'],
        ];
    }
}
