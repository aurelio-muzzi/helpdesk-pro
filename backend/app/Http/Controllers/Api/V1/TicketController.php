<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Ticket\AssignTicketRequest;
use App\Http\Requests\Api\V1\Ticket\ChangeTicketStatusRequest;
use App\Http\Requests\Api\V1\Ticket\StoreTicketRequest;
use App\Http\Requests\Api\V1\Ticket\UpdateTicketRequest;
use App\Http\Resources\Api\V1\TicketResource;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use App\Notifications\TicketAssignedNotification;
use App\Services\SlaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        $query = Ticket::query()->with([
            'requester',
            'assignedTo',
            'team',
            'department',
            'category',
            'priority',
        ]);

        // Scoping por papel de usuário
        if ($user->isRequester()) {
            $query->where('requester_id', $user->id);
        }

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($request->filled('priority_id')) {
            $query->where('priority_id', (int) $request->input('priority_id'));
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', (int) $request->input('assigned_to'));
        }

        if ($request->filled('search')) {
            $query->search((string) $request->input('search'));
        }

        $tickets = $query->orderBy('created_at', 'desc')
            ->paginate((int) $request->input('per_page', 15));

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $ticket = DB::transaction(function () use ($request, $user) {
            $data = $request->validated();
            $data['requester_id'] = $user->id;
            $data['status'] = TicketStatus::OPEN;

            /** @var Ticket $newTicket */
            $newTicket = Ticket::create($data);

            app(SlaService::class)->applySlaToTicket($newTicket);
            $newTicket->save();

            TicketHistory::create([
                'ticket_id' => $newTicket->id,
                'user_id' => $user->id,
                'action' => 'created',
                'comment' => 'Chamado registrado no sistema.',
                'created_at' => now(),
            ]);

            return $newTicket->load([
                'requester',
                'assignedTo',
                'team',
                'department',
                'category',
                'priority',
            ]);
        });

        return (new TicketResource($ticket))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, Ticket $ticket): TicketResource
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester() && $ticket->requester_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'Acesso não autorizado a este chamado.');
        }

        $ticket->load([
            'requester',
            'assignedTo',
            'team',
            'department',
            'category',
            'priority',
            'histories.user',
        ]);

        return new TicketResource($ticket);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket): TicketResource
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester() && ($ticket->requester_id !== $user->id || $ticket->status !== TicketStatus::OPEN)) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas chamados abertos podem ser editados pelo solicitante.');
        }

        DB::transaction(function () use ($request, $ticket, $user) {
            $ticket->update($request->validated());

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'updated',
                'comment' => 'Dados do chamado atualizados.',
                'created_at' => now(),
            ]);
        });

        return new TicketResource($ticket->fresh([
            'requester',
            'assignedTo',
            'team',
            'department',
            'category',
            'priority',
        ]));
    }

    public function assign(AssignTicketRequest $request, Ticket $ticket): TicketResource
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester()) {
            abort(Response::HTTP_FORBIDDEN, 'Solicitantes não podem atribuir responsáveis.');
        }

        $assignedToId = $request->input('assigned_to');
        $teamId = $request->input('team_id');
        $comment = (string) ($request->input('comment') ?? 'Responsável pelo atendimento alterado.');

        DB::transaction(function () use ($ticket, $user, $assignedToId, $teamId, $comment) {
            $oldAssignee = $ticket->assignedTo !== null ? $ticket->assignedTo->name : 'Não atribuído';

            $updateData = [];
            if ($assignedToId !== null) {
                $updateData['assigned_to'] = $assignedToId;
            }
            if ($teamId !== null) {
                $updateData['team_id'] = $teamId;
            }

            // Se o chamado ainda estiver 'open', avança automaticamente para 'in_progress'
            if ($ticket->status === TicketStatus::OPEN && $assignedToId !== null) {
                $updateData['status'] = TicketStatus::IN_PROGRESS;
            }

            $ticket->update($updateData);

            $freshTicket = $ticket->fresh('assignedTo');
            $newAssignee = ($freshTicket && $freshTicket->assignedTo !== null) ? $freshTicket->assignedTo->name : 'Não atribuído';

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'assigned',
                'field_name' => 'assigned_to',
                'old_value' => $oldAssignee,
                'new_value' => $newAssignee,
                'comment' => $comment,
                'created_at' => now(),
            ]);

            if ($assignedToId !== null) {
                /** @var User|null $assignedUser */
                $assignedUser = User::find($assignedToId);
                if ($assignedUser) {
                    $assignedUser->notify(new TicketAssignedNotification($ticket));
                }
            }
        });

        return new TicketResource($ticket->fresh([
            'requester',
            'assignedTo',
            'team',
            'department',
            'category',
            'priority',
            'histories.user',
        ]));
    }

    public function changeStatus(ChangeTicketStatusRequest $request, Ticket $ticket): TicketResource
    {
        /** @var User $user */
        $user = $request->user();
        $targetStatus = TicketStatus::from((string) $request->input('status'));
        $comment = $request->input('comment');

        // Validação de permissões
        if ($user->isRequester()) {
            if ($ticket->requester_id !== $user->id) {
                abort(Response::HTTP_FORBIDDEN, 'Você não tem permissão para alterar o status deste chamado.');
            }

            if ($targetStatus !== TicketStatus::CANCELLED) {
                abort(Response::HTTP_FORBIDDEN, 'Solicitantes só podem cancelar chamados em aberto.');
            }
        }

        // Validação de transições de status permitidas
        if (! $user->isAdmin()) {
            $allowed = $ticket->status->allowedTransitions();
            if (! in_array($targetStatus->value, $allowed, true)) {
                abort(
                    Response::HTTP_UNPROCESSABLE_ENTITY,
                    "Transição inválida de {$ticket->status->label()} para {$targetStatus->label()}."
                );
            }
        }

        DB::transaction(function () use ($ticket, $user, $targetStatus, $comment) {
            $oldStatus = $ticket->status;
            $updateData = ['status' => $targetStatus];

            if ($targetStatus === TicketStatus::RESOLVED && $ticket->resolved_at === null) {
                $updateData['resolved_at'] = now();
            }

            if ($targetStatus === TicketStatus::CLOSED && $ticket->closed_at === null) {
                $updateData['closed_at'] = now();
            }

            $ticket->update($updateData);

            if ($targetStatus === TicketStatus::RESOLVED) {
                app(SlaService::class)->evaluateResolution($ticket);
            }

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'status_changed',
                'field_name' => 'status',
                'old_value' => $oldStatus->value,
                'new_value' => $targetStatus->value,
                'comment' => $comment ?? "Status alterado de {$oldStatus->label()} para {$targetStatus->label()}.",
                'created_at' => now(),
            ]);
        });

        return new TicketResource($ticket->fresh([
            'requester',
            'assignedTo',
            'team',
            'department',
            'category',
            'priority',
            'histories.user',
        ]));
    }

    public function destroy(Request $request, Ticket $ticket): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(Response::HTTP_FORBIDDEN, 'Apenas administradores podem excluir chamados.');
        }

        $ticket->delete();

        return response()->json([
            'message' => 'Chamado excluído com sucesso.',
        ]);
    }
}
