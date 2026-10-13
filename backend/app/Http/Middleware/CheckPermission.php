<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Não autenticado.',
            ], 401);
        }

        if (! $user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado. Permissão insuficiente.',
            ], 403);
        }

        return $next($request);
    }
}
