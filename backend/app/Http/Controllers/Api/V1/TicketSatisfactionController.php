<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\TicketSatisfaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TicketSatisfactionController extends Controller
{
    public function show(Ticket $ticket): JsonResponse
    {
        $satisfaction = $ticket->satisfaction;

        if (! $satisfaction) {
            abort(Response::HTTP_NOT_FOUND, 'Avaliação não encontrada para este chamado.');
        }

        return response()->json(['data' => [
            'id' => $satisfaction->id,
            'ticket_id' => $satisfaction->ticket_id,
            'user_id' => $satisfaction->user_id,
            'rating' => $satisfaction->rating,
            'comment' => $satisfaction->comment,
            'created_at' => $satisfaction->created_at?->toISOString(),
        ]]);
    }

    public function store(Request $request, Ticket $ticket): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Apenas o solicitante pode avaliar
        if ($ticket->requester_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas o solicitante do chamado pode avaliar o atendimento.');
        }

        // 2. Apenas chamados resolvidos ou encerrados
        if (! in_array($ticket->status, [TicketStatus::RESOLVED, TicketStatus::CLOSED], true)) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Apenas chamados resolvidos ou encerrados podem ser avaliados.');
        }

        // 3. Impedir avaliação duplicada
        if ($ticket->satisfaction()->exists()) {
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Este chamado já foi avaliado anteriormente.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        /** @var TicketSatisfaction $satisfaction */
        $satisfaction = DB::transaction(function () use ($ticket, $user, $validated): TicketSatisfaction {
            $created = TicketSatisfaction::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'rating' => (int) $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]);

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'rated',
                'comment' => "Atendimento avaliado pelo solicitante: {$created->rating}/5 estrelas.",
                'created_at' => now(),
            ]);

            return $created;
        });

        return response()->json([
            'data' => [
                'id' => $satisfaction->id,
                'ticket_id' => $satisfaction->ticket_id,
                'user_id' => $satisfaction->user_id,
                'rating' => $satisfaction->rating,
                'comment' => $satisfaction->comment,
                'created_at' => $satisfaction->created_at?->toISOString(),
            ],
            'message' => 'Avaliação de satisfação registrada com sucesso.',
        ], Response::HTTP_CREATED);
    }
}
