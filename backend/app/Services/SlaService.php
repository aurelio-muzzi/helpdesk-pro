<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use App\Notifications\SlaBreachedNotification;
use Illuminate\Support\Facades\Notification;

class SlaService
{
    public function applySlaToTicket(Ticket $ticket): void
    {
        /** @var SlaPolicy|null $policy */
        $policy = SlaPolicy::where('priority_id', $ticket->priority_id)
            ->where('is_active', true)
            ->first();

        if ($policy) {
            $ticket->sla_policy_id = $policy->id;
            $ticket->first_response_due_at = now()->addMinutes($policy->first_response_time_minutes);
            $ticket->resolution_due_at = now()->addMinutes($policy->resolution_time_minutes);
            $ticket->sla_status = 'normal';
        }
    }

    public function recordFirstResponse(Ticket $ticket): void
    {
        if ($ticket->first_response_at === null) {
            $ticket->first_response_at = now();

            if ($ticket->first_response_due_at && now()->greaterThan($ticket->first_response_due_at)) {
                $ticket->sla_status = 'breached';

                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => null,
                    'action' => 'sla_breached',
                    'field_name' => 'first_response_due_at',
                    'comment' => 'Tempo de primeira resposta estourado.',
                    'created_at' => now(),
                ]);
            }

            $ticket->save();
        }
    }

    public function evaluateResolution(Ticket $ticket): void
    {
        if ($ticket->resolution_due_at) {
            if ($ticket->resolved_at && $ticket->resolved_at->lessThanOrEqualTo($ticket->resolution_due_at)) {
                $ticket->sla_status = 'met';
            } else {
                $ticket->sla_status = 'breached';
            }
            $ticket->save();
        }
    }

    public function checkBreaches(): int
    {
        $breachedCount = 0;

        $tickets = Ticket::whereNotIn('status', [TicketStatus::RESOLVED, TicketStatus::CLOSED, TicketStatus::CANCELLED])
            ->where('sla_status', '!=', 'breached')
            ->whereNotNull('resolution_due_at')
            ->get();

        foreach ($tickets as $ticket) {
            $isBreached = false;
            $reason = '';

            // Verifica estouro de resolução
            if ($ticket->resolution_due_at && now()->greaterThan($ticket->resolution_due_at)) {
                $isBreached = true;
                $reason = 'Tempo de resolução excedido';
            }
            // Verifica estouro de primeira resposta se ainda não foi respondido
            elseif ($ticket->first_response_at === null && $ticket->first_response_due_at && now()->greaterThan($ticket->first_response_due_at)) {
                $isBreached = true;
                $reason = 'Tempo de primeira resposta excedido';
            }

            if ($isBreached) {
                $ticket->sla_status = 'breached';
                $ticket->save();
                $breachedCount++;

                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => null,
                    'action' => 'sla_breached',
                    'comment' => "Alerta de SLA: {$reason}.",
                    'created_at' => now(),
                ]);

                // Notificar responsável ou administradores
                if ($ticket->assignedTo) {
                    $ticket->assignedTo->notify(new SlaBreachedNotification($ticket, $reason));
                } else {
                    $admins = User::whereHas('role', fn ($q) => $q->where('name', 'admin'))->get();
                    Notification::send($admins, new SlaBreachedNotification($ticket, $reason));
                }
            }
        }

        return $breachedCount;
    }
}
