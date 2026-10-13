<?php

namespace App\Http\Requests\Api\V1\Ticket;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignTicketRequest extends FormRequest
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
            'assigned_to' => ['required', 'nullable', 'integer', 'exists:users,id'],
            'team_id' => ['sometimes', 'nullable', 'integer', 'exists:teams,id'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
