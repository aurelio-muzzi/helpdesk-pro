<?php

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
use Illuminate\Support\Facades\Route;

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
    Route::apiResource('departments', DepartmentController::class);
    Route::post('teams/{team}/members', [TeamController::class, 'syncMembers']);
    Route::apiResource('teams', TeamController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('priorities', PriorityController::class);

    // Políticas de SLA
    Route::apiResource('sla-policies', SlaPolicyController::class);

    // Ciclo de Vida dos Chamados (Tickets Core)
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::patch('tickets/{ticket}/status', [TicketController::class, 'changeStatus']);
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
    Route::get('dashboard/export', [DashboardController::class, 'export']);

    // Base de Conhecimento e FAQ
    Route::get('articles/suggestions', [KnowledgeArticleController::class, 'suggestions']);
    Route::post('articles/{id}/feedback', [KnowledgeArticleController::class, 'feedback']);
    Route::apiResource('articles', KnowledgeArticleController::class);

    // Notificações In-App
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
