<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\KnowledgeArticleResource;
use App\Models\KnowledgeArticle;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;

class KnowledgeArticleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Builder<KnowledgeArticle> $query */
        $query = KnowledgeArticle::query()->with(['category', 'author']);

        // Se for solicitante, apenas artigos publicados e não-internos
        if ($user->isRequester()) {
            $query->published()->where('is_internal', false);
        } else {
            if ($request->has('is_published')) {
                $query->where('is_published', $request->boolean('is_published'));
            }
            if ($request->has('is_internal')) {
                $query->where('is_internal', $request->boolean('is_internal'));
            }
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('search')) {
            $query->search((string) $request->input('search'));
        }

        $articles = $query->orderBy('created_at', 'desc')->get();

        return KnowledgeArticleResource::collection($articles);
    }

    public function show(string $idOrSlug, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var KnowledgeArticle $article */
        $article = KnowledgeArticle::with(['category', 'author'])
            ->where(function (Builder $query) use ($idOrSlug): void {
                if (is_numeric($idOrSlug)) {
                    $query->where('id', (int) $idOrSlug);
                } else {
                    $query->where('slug', $idOrSlug);
                }
            })
            ->firstOrFail();

        if ($user->isRequester()) {
            if (! $article->is_published || $article->is_internal) {
                abort(Response::HTTP_NOT_FOUND, 'Artigo não encontrado.');
            }
        }

        // Incrementa visualizações
        $article->increment('views_count');

        return (new KnowledgeArticleResource($article))->response();
    }

    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas membros da equipe de suporte podem publicar artigos.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_published' => ['sometimes', 'boolean'],
            'is_internal' => ['sometimes', 'boolean'],
        ]);

        $validated['author_id'] = $user->id;

        $article = KnowledgeArticle::create($validated);

        return (new KnowledgeArticleResource($article->load(['category', 'author'])))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas membros da equipe de suporte podem editar artigos.');
        }

        $article = KnowledgeArticle::findOrFail($id);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'summary' => ['nullable', 'string', 'max:500'],
            'content' => ['sometimes', 'required', 'string'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_published' => ['sometimes', 'boolean'],
            'is_internal' => ['sometimes', 'boolean'],
        ]);

        $article->update($validated);

        return (new KnowledgeArticleResource($article->fresh(['category', 'author'])))->response();
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isManager()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas administradores e gestores podem excluir artigos.');
        }

        $article = KnowledgeArticle::findOrFail($id);
        $article->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function feedback(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'is_helpful' => ['required', 'boolean'],
        ]);

        $article = KnowledgeArticle::findOrFail($id);

        if ($validated['is_helpful']) {
            $article->increment('helpful_count');
        } else {
            $article->increment('not_helpful_count');
        }

        $article->refresh();

        return response()->json([
            'message' => 'Feedback registrado com sucesso.',
            'helpful_count' => $article->helpful_count,
            'not_helpful_count' => $article->not_helpful_count,
        ]);
    }

    public function suggestions(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $term = (string) $request->input('q', '');

        if (mb_strlen($term) < 2) {
            return response()->json(['data' => []]);
        }

        /** @var Builder<KnowledgeArticle> $query */
        $query = KnowledgeArticle::query()->with('category')->published();

        if ($user->isRequester()) {
            $query->where('is_internal', false);
        }

        $suggestions = $query->search($term)
            ->limit(5)
            ->get()
            ->map(function (KnowledgeArticle $article): array {
                return [
                    'id' => $article->id,
                    'title' => $article->title,
                    'slug' => $article->slug,
                    'summary' => $article->summary,
                    'category_name' => $article->category ? $article->category->name : 'Geral',
                ];
            });

        return response()->json(['data' => $suggestions]);
    }
}
