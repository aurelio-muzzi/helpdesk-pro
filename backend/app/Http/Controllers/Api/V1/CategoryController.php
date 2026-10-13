<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Category\StoreCategoryRequest;
use App\Http\Requests\Api\V1\Category\UpdateCategoryRequest;
use App\Http\Resources\Api\V1\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $categories = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
            'message' => 'Categorias recuperadas com sucesso.',
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());
        $category->load('department');

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
            'message' => 'Categoria criada com sucesso.',
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        $category->load('department');

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
            'message' => 'Categoria carregada com sucesso.',
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $category->update($request->validated());
        $category->load('department');

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
            'message' => 'Categoria atualizada com sucesso.',
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoria excluída com sucesso.',
        ]);
    }
}
