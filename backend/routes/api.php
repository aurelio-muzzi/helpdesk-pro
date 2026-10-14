<?php

use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\KnowledgeArticleController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PriorityController;
use App\Http\Controllers\Api\V1\SlaPolicyController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\TicketAttachmentController;
use App\Http\Controllers\Api\V1\TicketCommentController;
use App\Http\Controllers\Api\V1\TicketController;
use App\Http\Controllers\Api\V1\TicketSatisfactionController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

// Informações e status da API (/api/v1)
Route::get('/', function () {
    return response()->json([
        'name' => config('app.name', 'HelpDesk Pro'),
        'version' => '1.0.0',
        'status' => 'operational',
        'timestamp' => now()->toISOString(),
        'endpoints' => [
            'health' => '/up',
            'auth' => [
                'login' => 'POST /api/v1/auth/login',
                'logout' => 'POST /api/v1/auth/logout',
                'me' => 'GET /api/v1/auth/me',
            ],
            'tickets' => 'GET /api/v1/tickets',
            'departments' => 'GET /api/v1/departments',
            'teams' => 'GET /api/v1/teams',
            'categories' => 'GET /api/v1/categories',
            'priorities' => 'GET /api/v1/priorities',
            'articles' => 'GET /api/v1/articles',
            'dashboard_metrics' => 'GET /api/v1/dashboard/metrics',
        ],
    ]);
});

// Rotas de Autenticação
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
    });
});

// Rotas Protegidas de Domínio Organizacional e Chamados
Route::middleware('auth:sanctum')->group(function () {
    // Leitura Organizacional e Usuários (dropdowns e telas)
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/{user}', [UserController::class, 'show']);
    Route::get('roles', [UserController::class, 'roles']);
    Route::get('departments', [DepartmentController::class, 'index']);
    Route::get('departments/{department}', [DepartmentController::class, 'show']);
    Route::get('teams', [TeamController::class, 'index']);
    Route::get('teams/{team}', [TeamController::class, 'show']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('categories/{category}', [CategoryController::class, 'show']);
    Route::get('priorities', [PriorityController::class, 'index']);
    Route::get('priorities/{priority}', [PriorityController::class, 'show']);
    Route::get('sla-policies', [SlaPolicyController::class, 'index']);
    Route::get('sla-policies/{sla_policy}', [SlaPolicyController::class, 'show']);

    // Gestão Organizacional, Usuários e Políticas de SLA (Exclusivo Admin e Gerentes)
    Route::middleware('role:admin,manager')->group(function () {
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::patch('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);

        Route::post('departments', [DepartmentController::class, 'store']);
        Route::put('departments/{department}', [DepartmentController::class, 'update']);
        Route::patch('departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('departments/{department}', [DepartmentController::class, 'destroy']);

        Route::post('teams', [TeamController::class, 'store']);
        Route::put('teams/{team}', [TeamController::class, 'update']);
        Route::patch('teams/{team}', [TeamController::class, 'update']);
        Route::delete('teams/{team}', [TeamController::class, 'destroy']);
        Route::post('teams/{team}/members', [TeamController::class, 'syncMembers']);

        Route::post('categories', [CategoryController::class, 'store']);
        Route::put('categories/{category}', [CategoryController::class, 'update']);
        Route::patch('categories/{category}', [CategoryController::class, 'update']);
        Route::delete('categories/{category}', [CategoryController::class, 'destroy']);

        Route::post('priorities', [PriorityController::class, 'store']);
        Route::put('priorities/{priority}', [PriorityController::class, 'update']);
        Route::patch('priorities/{priority}', [PriorityController::class, 'update']);
        Route::delete('priorities/{priority}', [PriorityController::class, 'destroy']);

        Route::post('sla-policies', [SlaPolicyController::class, 'store']);
        Route::put('sla-policies/{sla_policy}', [SlaPolicyController::class, 'update']);
        Route::patch('sla-policies/{sla_policy}', [SlaPolicyController::class, 'update']);
        Route::delete('sla-policies/{sla_policy}', [SlaPolicyController::class, 'destroy']);
    });

    // Ciclo de Vida dos Chamados (Tickets Core)
    // Ações de atribuição restritas a Staff (Admin, Manager, Agent)
    Route::middleware('role:admin,manager,agent')->group(function () {
        Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign']);
    });

    // Transição de status (validada no controller para permitir cancelamento pelo solicitante)
    Route::patch('tickets/{ticket}/status', [TicketController::class, 'changeStatus']);

    // Ações do Solicitante / Acompanhamento
    Route::post('tickets/{ticket}/reopen', [TicketController::class, 'reopen']);
    Route::get('tickets/{ticket}/satisfaction', [TicketSatisfactionController::class, 'show']);
    Route::post('tickets/{ticket}/satisfaction', [TicketSatisfactionController::class, 'store']);
    Route::apiResource('tickets', TicketController::class);

    // Interações e Linha do Tempo (Comentários e Anexos)
    Route::get('tickets/{ticket}/comments', [TicketCommentController::class, 'index']);
    Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store']);
    Route::get('tickets/{ticket}/attachments/{attachment}/download', [TicketAttachmentController::class, 'download']);

    // Dashboard & Relatórios
    Route::get('dashboard/metrics', [DashboardController::class, 'metrics']);
    Route::get('dashboard/export', [DashboardController::class, 'export'])->middleware('role:admin,manager');

    // Base de Conhecimento e FAQ (Consulta pública interna, autoria por Staff)
    Route::get('articles/suggestions', [KnowledgeArticleController::class, 'suggestions']);
    Route::post('articles/{id}/feedback', [KnowledgeArticleController::class, 'feedback']);
    Route::get('articles', [KnowledgeArticleController::class, 'index']);
    Route::get('articles/{article}', [KnowledgeArticleController::class, 'show']);

    Route::middleware('role:admin,manager,agent')->group(function () {
        Route::post('articles', [KnowledgeArticleController::class, 'store']);
        Route::put('articles/{article}', [KnowledgeArticleController::class, 'update']);
        Route::patch('articles/{article}', [KnowledgeArticleController::class, 'update']);
        Route::delete('articles/{article}', [KnowledgeArticleController::class, 'destroy']);
    });

    // Notificações In-App
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Trilha de Auditoria & Segurança (Apenas Administradores)
    Route::get('audit-logs', [AuditLogController::class, 'index'])->middleware('role:admin');
});
