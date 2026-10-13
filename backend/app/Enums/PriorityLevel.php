<?php

namespace App\Enums;

enum PriorityLevel: string
{
    case LOW = 'LOW';
    case MEDIUM = 'MEDIUM';
    case HIGH = 'HIGH';
    case URGENT = 'URGENT';

    public function label(): string
    {
        return match ($this) {
            self::LOW => 'Baixa',
            self::MEDIUM => 'Média',
            self::HIGH => 'Alta',
            self::URGENT => 'Urgente',
        };
    }

    public function defaultColor(): string
    {
        return match ($this) {
            self::LOW => '#3b82f6',
            self::MEDIUM => '#10b981',
            self::HIGH => '#f59e0b',
            self::URGENT => '#ef4444',
        };
    }
}
