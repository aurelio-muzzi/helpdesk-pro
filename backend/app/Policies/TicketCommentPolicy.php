<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketCommentPolicy
{
    public function viewAny(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isAgent()) {
            return true;
        }

        return $ticket->requester_id === $user->id;
    }

    public function create(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isAgent()) {
            return true;
        }

        return $ticket->requester_id === $user->id && ! $ticket->status->isFinal();
    }
}
