<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\PriorityController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\TicketAttachmentController;
use App\Http\Controllers\Api\V1\TicketCommentController;
use App\Http\Controllers\Api\V1\TicketController;
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

    // Ciclo de Vida dos Chamados (Tickets Core)
    Route::post('tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::patch('tickets/{ticket}/status', [TicketController::class, 'changeStatus']);
    Route::apiResource('tickets', TicketController::class);

    // Interações e Linha do Tempo (Comentários e Anexos)
    Route::get('tickets/{ticket}/comments', [TicketCommentController::class, 'index']);
    Route::post('tickets/{ticket}/comments', [TicketCommentController::class, 'store']);
    Route::get('tickets/{ticket}/attachments/{attachment}/download', [TicketAttachmentController::class, 'download']);
});
