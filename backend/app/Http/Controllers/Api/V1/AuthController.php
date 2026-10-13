<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\V1\Auth\UpdatePasswordRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');
        $remember = (bool) $request->input('remember', false);

        if (! Auth::attempt($credentials, $remember)) {
            return response()->json([
                'success' => false,
                'message' => 'As credenciais fornecidas estão incorretas.',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            Auth::guard('web')->logout();
            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            return response()->json([
                'success' => false,
                'message' => 'Sua conta está desativada. Entre em contato com o administrador.',
            ], 403);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }
        $user->load(['role.permissions']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'Login realizado com sucesso.',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            $token = $user->currentAccessToken();
            if ($token instanceof PersonalAccessToken) {
                $token->delete();
            }
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sessão encerrada com sucesso.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->load(['role.permissions']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
            'message' => 'Usuário autenticado carregado com sucesso.',
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Link de redefinição de senha enviado para seu e-mail.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Não foi possível enviar o link de redefinição de senha.',
        ], 400);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Senha redefinida com sucesso. Faça login com sua nova senha.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Token de redefinição inválido ou expirado.',
        ], 400);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->forceFill([
            'password' => Hash::make($request->string('password')),
            'remember_token' => Str::random(60),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Senha alterada com sucesso.',
        ]);
    }
}
