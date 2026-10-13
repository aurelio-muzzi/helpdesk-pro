<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Team\StoreTeamRequest;
use App\Http\Requests\Api\V1\Team\SyncTeamMembersRequest;
use App\Http\Requests\Api\V1\Team\UpdateTeamRequest;
use App\Http\Resources\Api\V1\TeamResource;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Team::with(['department'])->withCount('users');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $teams = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => TeamResource::collection($teams),
            'message' => 'Equipes recuperadas com sucesso.',
        ]);
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $team = Team::create($request->validated());
        $team->load('department')->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new TeamResource($team),
            'message' => 'Equipe criada com sucesso.',
        ], 201);
    }

    public function show(Team $team): JsonResponse
    {
        $team->load(['department', 'users.role'])->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new TeamResource($team),
            'message' => 'Equipe carregada com sucesso.',
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $team->update($request->validated());
        $team->load('department')->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new TeamResource($team),
            'message' => 'Equipe atualizada com sucesso.',
        ]);
    }

    public function destroy(Team $team): JsonResponse
    {
        $team->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipe excluída com sucesso.',
        ]);
    }

    public function syncMembers(SyncTeamMembersRequest $request, Team $team): JsonResponse
    {
        /** @var array<int, array{user_id: int, is_leader?: bool}> $members */
        $members = $request->input('members', []);

        $syncData = [];
        foreach ($members as $member) {
            $syncData[$member['user_id']] = [
                'is_leader' => (bool) ($member['is_leader'] ?? false),
            ];
        }

        $team->users()->sync($syncData);
        $team->load(['department', 'users.role'])->loadCount('users');

        return response()->json([
            'success' => true,
            'data' => new TeamResource($team),
            'message' => 'Membros da equipe sincronizados com sucesso.',
        ]);
    }
}
