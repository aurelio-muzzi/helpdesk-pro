<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Priority\StorePriorityRequest;
use App\Http\Requests\Api\V1\Priority\UpdatePriorityRequest;
use App\Http\Resources\Api\V1\PriorityResource;
use App\Models\Priority;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriorityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Priority::query();

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $priorities = $query->orderBy('order')->get();

        return response()->json([
            'success' => true,
            'data' => PriorityResource::collection($priorities),
            'message' => 'Prioridades recuperadas com sucesso.',
        ]);
    }

    public function store(StorePriorityRequest $request): JsonResponse
    {
        $priority = Priority::create($request->validated());

        return response()->json([
            'success' => true,
            'data' => new PriorityResource($priority),
            'message' => 'Prioridade criada com sucesso.',
        ], 201);
    }

    public function show(Priority $priority): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new PriorityResource($priority),
            'message' => 'Prioridade carregada com sucesso.',
        ]);
    }

    public function update(UpdatePriorityRequest $request, Priority $priority): JsonResponse
    {
        $priority->update($request->validated());

        return response()->json([
            'success' => true,
            'data' => new PriorityResource($priority),
            'message' => 'Prioridade atualizada com sucesso.',
        ]);
    }

    public function destroy(Priority $priority): JsonResponse
    {
        $priority->delete();

        return response()->json([
            'success' => true,
            'message' => 'Prioridade excluída com sucesso.',
        ]);
    }
}
