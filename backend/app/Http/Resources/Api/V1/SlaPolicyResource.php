<?php

namespace App\Http\Resources\Api\V1;

use App\Models\SlaPolicy;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin SlaPolicy
 */
class SlaPolicyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'priority' => new PriorityResource($this->priority),
            'first_response_time_minutes' => $this->first_response_time_minutes,
            'resolution_time_minutes' => $this->resolution_time_minutes,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
