<?php

namespace App\Http\Requests\Api\V1\Ticket;

use App\Enums\TicketStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeTicketStatusRequest extends FormRequest
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
            'status' => [
                'required',
                'string',
                Rule::in(array_map(fn (TicketStatus $s) => $s->value, TicketStatus::cases())),
            ],
            'comment' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
