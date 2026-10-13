<?php

namespace App\Policies;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isAgent()) {
            return true;
        }

        return $ticket->requester_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isAgent()) {
            return true;
        }

        return $ticket->requester_id === $user->id && $ticket->status === TicketStatus::OPEN;
    }

    public function assign(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isAgent();
    }

    public function changeStatus(User $user, Ticket $ticket): bool
    {
        if ($user->isAdmin() || $user->isManager() || $user->isAgent()) {
            return true;
        }

        return $ticket->requester_id === $user->id && ! $ticket->status->isFinal();
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->isAdmin();
    }
}
