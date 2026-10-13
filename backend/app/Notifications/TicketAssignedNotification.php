<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TicketAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(public Ticket $ticket) {}

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
            'type' => 'ticket_assigned',
            'ticket_id' => $this->ticket->id,
            'code' => $this->ticket->code,
            'title' => $this->ticket->title,
            'priority' => $this->ticket->priority->display_name,
            'message' => "Você foi atribuído como responsável pelo chamado {$this->ticket->code}.",
            'created_at' => now()->toISOString(),
        ];
    }
}
