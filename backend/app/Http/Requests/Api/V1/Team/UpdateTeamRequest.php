<?php

namespace App\Http\Requests\Api\V1\Team;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamRequest extends FormRequest
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
        $team = $this->route('team');
        $teamId = is_object($team) ? $team->id : $team;
        $departmentId = $this->input('department_id', is_object($team) ? $team->department_id : null);

        return [
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'name' => [
                'sometimes',
                'string',
                'max:100',
                Rule::unique('teams', 'name')
                    ->where('department_id', $departmentId)
                    ->ignore($teamId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
