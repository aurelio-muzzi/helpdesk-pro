<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'is_active' => $this->is_active,
            'role' => new RoleResource($this->whenLoaded('role')),
            'teams' => TeamResource::collection($this->whenLoaded('teams')),
            'permissions' => $this->whenLoaded('role', function () {
                $role = $this->role;

                return $role instanceof Role
                    ? $role->permissions->pluck('name')->values()->all()
                    : [];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
