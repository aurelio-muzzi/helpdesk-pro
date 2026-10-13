<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case MANAGER = 'manager';
    case AGENT = 'agent';
    case REQUESTER = 'requester';

    public function label(): string
    {
        return match ($this) {
            self::ADMIN => 'Administrador',
            self::MANAGER => 'Gerente',
            self::AGENT => 'Agente de Suporte',
            self::REQUESTER => 'Solicitante',
        };
    }
}
