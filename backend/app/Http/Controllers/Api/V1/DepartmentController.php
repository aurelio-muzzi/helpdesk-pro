<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Department\StoreDepartmentRequest;
use App\Http\Requests\Api\V1\Department\UpdateDepartmentRequest;
use App\Http\Resources\Api\V1\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::withCount(['teams', 'categories']);

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $departments = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => DepartmentResource::collection($departments),
            'message' => 'Departamentos recuperados com sucesso.',
        ]);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department),
            'message' => 'Departamento criado com sucesso.',
        ], 201);
    }

    public function show(Department $department): JsonResponse
    {
        $department->load(['teams', 'categories'])->loadCount(['teams', 'categories']);

        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department),
            'message' => 'Departamento carregado com sucesso.',
        ]);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department),
            'message' => 'Departamento atualizado com sucesso.',
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        return response()->json([
            'success' => true,
            'message' => 'Departamento excluído com sucesso.',
        ]);
    }
}
