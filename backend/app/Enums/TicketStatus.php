<?php

namespace App\Enums;

enum TicketStatus: string
{
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case PENDING = 'pending';
    case RESOLVED = 'resolved';
    case CLOSED = 'closed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Aberto',
            self::IN_PROGRESS => 'Em Atendimento',
            self::PENDING => 'Pendente',
            self::RESOLVED => 'Resolvido',
            self::CLOSED => 'Fechado',
            self::CANCELLED => 'Cancelado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::OPEN => '#3b82f6',
            self::IN_PROGRESS => '#8b5cf6',
            self::PENDING => '#f59e0b',
            self::RESOLVED => '#10b981',
            self::CLOSED => '#64748b',
            self::CANCELLED => '#ef4444',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::CLOSED, self::CANCELLED], true);
    }

    /**
     * @return array<string>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::OPEN => [self::IN_PROGRESS->value, self::PENDING->value, self::CANCELLED->value],
            self::IN_PROGRESS => [self::PENDING->value, self::RESOLVED->value, self::CANCELLED->value],
            self::PENDING => [self::IN_PROGRESS->value, self::RESOLVED->value, self::CANCELLED->value],
            self::RESOLVED => [self::IN_PROGRESS->value, self::CLOSED->value],
            self::CLOSED => [],
            self::CANCELLED => [],
        };
    }
}
