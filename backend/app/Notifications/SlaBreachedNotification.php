<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SlaBreachedNotification extends Notification
{
    use Queueable;

    public function __construct(public Ticket $ticket, public string $reason) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'sla_breached',
            'ticket_id' => $this->ticket->id,
            'code' => $this->ticket->code,
            'title' => $this->ticket->title,
            'reason' => $this->reason,
            'message' => "O chamado {$this->ticket->code} estourou o prazo de SLA ({$this->reason}).",
            'created_at' => now()->toISOString(),
        ];
    }
}
