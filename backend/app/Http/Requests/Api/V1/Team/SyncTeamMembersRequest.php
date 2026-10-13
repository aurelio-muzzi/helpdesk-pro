<?php

namespace App\Http\Requests\Api\V1\Team;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncTeamMembersRequest extends FormRequest
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
            'members' => ['required', 'array'],
            'members.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'members.*.is_leader' => ['sometimes', 'boolean'],
        ];
    }
}
