<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\SlaPolicyResource;
use App\Models\SlaPolicy;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class SlaPolicyController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $policies = SlaPolicy::with('priority')->orderBy('priority_id', 'asc')->get();

        return SlaPolicyResource::collection($policies);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isManager()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas administradores e gestores podem cadastrar regras de SLA.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'priority_id' => ['required', 'integer', 'exists:priorities,id'],
            'first_response_time_minutes' => ['required', 'integer', 'min:1'],
            'resolution_time_minutes' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $policy = SlaPolicy::create($validated);

        AuditLogger::log(
            event: 'sla.created',
            description: "Política de SLA '{$policy->name}' cadastrada no sistema.",
            auditable: $policy,
            oldValues: null,
            newValues: $validated,
            userId: $user->id
        );

        return (new SlaPolicyResource($policy->load('priority')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(SlaPolicy $slaPolicy): SlaPolicyResource
    {
        return new SlaPolicyResource($slaPolicy->load('priority'));
    }

    public function update(Request $request, SlaPolicy $slaPolicy): SlaPolicyResource
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isManager()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas administradores e gestores podem editar regras de SLA.');
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'priority_id' => ['sometimes', 'integer', 'exists:priorities,id'],
            'first_response_time_minutes' => ['sometimes', 'integer', 'min:1'],
            'resolution_time_minutes' => ['sometimes', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $oldName = $slaPolicy->name;
        $slaPolicy->update($validated);

        AuditLogger::log(
            event: 'sla.updated',
            description: "Política de SLA '{$oldName}' atualizada.",
            auditable: $slaPolicy,
            oldValues: ['name' => $oldName],
            newValues: $validated,
            userId: $user->id
        );

        return new SlaPolicyResource($slaPolicy->fresh('priority'));
    }

    public function destroy(Request $request, SlaPolicy $slaPolicy): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas administradores podem excluir regras de SLA.');
        }

        AuditLogger::log(
            event: 'sla.deleted',
            description: "Política de SLA '{$slaPolicy->name}' excluída por {$user->name}.",
            auditable: $slaPolicy,
            oldValues: ['name' => $slaPolicy->name],
            newValues: null,
            userId: $user->id
        );

        $slaPolicy->delete();

        return response()->json(['message' => 'Política de SLA removida com sucesso.']);
    }
}
