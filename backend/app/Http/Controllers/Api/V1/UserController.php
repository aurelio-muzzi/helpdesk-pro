<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\User\StoreUserRequest;
use App\Http\Requests\Api\V1\User\UpdateUserRequest;
use App\Http\Resources\Api\V1\RoleResource;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['role', 'teams']);

        if ($request->filled('search')) {
            $search = (string) $request->input('search');
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role_id')) {
            $query->where('role_id', $request->integer('role_id'));
        }

        if ($request->filled('team_id')) {
            $teamId = $request->integer('team_id');
            $query->whereHas('teams', function ($q) use ($teamId): void {
                $q->where('teams.id', $teamId);
            });
        }

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users),
            'message' => 'Usuários recuperados com sucesso.',
        ]);
    }

    public function roles(): JsonResponse
    {
        $roles = Role::orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => RoleResource::collection($roles),
            'message' => 'Perfis recuperados com sucesso.',
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $teamIds = $data['team_ids'] ?? [];
        unset($data['team_ids']);

        $data['password'] = Hash::make((string) $data['password']);
        $data['is_active'] = $data['is_active'] ?? true;

        /** @var User $user */
        $user = User::create($data);

        if (! empty($teamIds)) {
            $user->teams()->sync($teamIds);
        }

        $user->load(['role', 'teams']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'Usuário cadastrado com sucesso.',
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['role', 'teams']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'Usuário carregado com sucesso.',
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['password'])) {
            $data['password'] = Hash::make((string) $data['password']);
        } else {
            unset($data['password']);
        }

        $teamIds = null;
        if (array_key_exists('team_ids', $data)) {
            $teamIds = $data['team_ids'];
            unset($data['team_ids']);
        }

        $user->update($data);

        if ($teamIds !== null) {
            $user->teams()->sync($teamIds);
        }

        $user->load(['role', 'teams']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'Usuário atualizado com sucesso.',
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuário excluído com sucesso.',
        ]);
    }
}
