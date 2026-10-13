<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Ticket
 */
class TicketResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'description' => $this->description,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'color' => $this->status->color(),
                'is_final' => $this->status->isFinal(),
            ],
            'requester' => [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
                'email' => $this->requester->email,
            ],
            'assigned_to' => $this->assignedTo ? [
                'id' => $this->assignedTo->id,
                'name' => $this->assignedTo->name,
                'email' => $this->assignedTo->email,
            ] : null,
            'team' => $this->team ? new TeamResource($this->team) : null,
            'department' => $this->department ? new DepartmentResource($this->department) : null,
            'category' => new CategoryResource($this->category),
            'priority' => new PriorityResource($this->priority),
            'sla' => [
                'status' => $this->sla_status,
                'first_response_due_at' => $this->first_response_due_at?->toISOString(),
                'first_response_at' => $this->first_response_at?->toISOString(),
                'resolution_due_at' => $this->resolution_due_at?->toISOString(),
                'policy_name' => $this->slaPolicy?->name,
            ],
            'resolved_at' => $this->resolved_at?->toISOString(),
            'closed_at' => $this->closed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'histories' => TicketHistoryResource::collection($this->whenLoaded('histories')),
        ];
    }
}
