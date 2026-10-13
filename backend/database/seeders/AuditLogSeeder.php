<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@helpdeskpro.local')->first() ?? User::first();
        $manager = User::where('email', 'manager@helpdeskpro.local')->first() ?? $admin;
        $agent = User::whereIn('email', ['agente@helpdeskpro.local', 'agent@helpdeskpro.local'])->first() ?? $admin;
        $requester = User::whereIn('email', ['solicitante@helpdeskpro.local', 'requester@helpdeskpro.local'])->first() ?? $admin;

        $tickets = Ticket::take(5)->get();

        $logs = [
            [
                'user_id' => $admin->id,
                'event' => 'auth.login',
                'auditable_type' => 'App\\Models\\User',
                'auditable_id' => $admin->id,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => null,
                'new_values' => ['role' => 'admin', 'auth_method' => 'password+mfa'],
                'description' => "Administrador {$admin->name} autenticado com sucesso no console corporativo.",
                'created_at' => now()->subHours(8),
            ],
            [
                'user_id' => $admin->id,
                'event' => 'settings.updated',
                'auditable_type' => null,
                'auditable_id' => null,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => ['session_lifetime' => 60, 'max_login_attempts' => 3],
                'new_values' => ['session_lifetime' => 120, 'max_login_attempts' => 5],
                'description' => 'Parâmetros de segurança e tempo de sessão global atualizados.',
                'created_at' => now()->subHours(7),
            ],
            [
                'user_id' => $manager->id,
                'event' => 'sla.policy_updated',
                'auditable_type' => 'App\\Models\\SlaPolicy',
                'auditable_id' => 1,
                'ip_address' => '192.168.1.102',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0',
                'old_values' => ['first_response_time_minutes' => 30],
                'new_values' => ['first_response_time_minutes' => 15],
                'description' => 'Meta de primeira resposta para SLA Crítico / Urgente reduzida para 15 minutos.',
                'created_at' => now()->subHours(6),
            ],
            [
                'user_id' => $requester->id,
                'event' => 'ticket.created',
                'auditable_type' => 'App\\Models\\Ticket',
                'auditable_id' => $tickets->first()?->id ?? 1,
                'ip_address' => '192.168.10.45',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'old_values' => null,
                'new_values' => ['code' => 'HD-2026-00001', 'priority' => 'HIGH', 'status' => 'open'],
                'description' => 'Chamado HD-2026-00001 aberto pelo solicitante via Portal Web.',
                'created_at' => now()->subHours(5),
            ],
            [
                'user_id' => $agent->id,
                'event' => 'ticket.assigned',
                'auditable_type' => 'App\\Models\\Ticket',
                'auditable_id' => $tickets->first()?->id ?? 1,
                'ip_address' => '192.168.1.105',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => ['assigned_to' => null],
                'new_values' => ['assigned_to' => $agent->id, 'agent_name' => $agent->name],
                'description' => "Chamado HD-2026-00001 assumido por {$agent->name}.",
                'created_at' => now()->subHours(4),
            ],
            [
                'user_id' => $agent->id,
                'event' => 'ticket.status_changed',
                'auditable_type' => 'App\\Models\\Ticket',
                'auditable_id' => $tickets->first()?->id ?? 1,
                'ip_address' => '192.168.1.105',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => ['status' => 'open'],
                'new_values' => ['status' => 'in_progress'],
                'description' => 'Status do chamado alterado de Aberto para Em Atendimento.',
                'created_at' => now()->subHours(3)->subMinutes(50),
            ],
            [
                'user_id' => $agent->id,
                'event' => 'ticket.comment_added',
                'auditable_type' => 'App\\Models\\Ticket',
                'auditable_id' => $tickets->first()?->id ?? 1,
                'ip_address' => '192.168.1.105',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => null,
                'new_values' => ['is_internal' => true],
                'description' => 'Nota interna técnica registrada no chamado por analista de suporte.',
                'created_at' => now()->subHours(2),
            ],
            [
                'user_id' => $admin->id,
                'event' => 'article.created',
                'auditable_type' => 'App\\Models\\KnowledgeArticle',
                'auditable_id' => 1,
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => null,
                'new_values' => ['title' => 'Guia de conexão e resolução de problemas na VPN corporativa', 'is_published' => true],
                'description' => 'Novo artigo publicado na Base de Conhecimento pelo Administrador.',
                'created_at' => now()->subHours(1),
            ],
            [
                'user_id' => $admin->id,
                'event' => 'security.threat_prevented',
                'auditable_type' => null,
                'auditable_id' => null,
                'ip_address' => '203.0.113.19',
                'user_agent' => 'Python-urllib/3.10',
                'old_values' => null,
                'new_values' => ['attempted_path' => '/api/v1/admin/export', 'action' => 'blocked_by_waf'],
                'description' => 'Tentativa de varredura bloqueada automaticamente pelo Rate Limit da API.',
                'created_at' => now()->subMinutes(30),
            ],
            [
                'user_id' => $agent->id,
                'event' => 'ticket.resolved',
                'auditable_type' => 'App\\Models\\Ticket',
                'auditable_id' => $tickets->skip(3)->first()?->id ?? 4,
                'ip_address' => '192.168.1.105',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0 Safari/537.36',
                'old_values' => ['status' => 'in_progress'],
                'new_values' => ['status' => 'resolved'],
                'description' => 'Chamado solucionado dentro do prazo de SLA e encaminhado para avaliação do usuário.',
                'created_at' => now()->subMinutes(15),
            ],
        ];

        foreach ($logs as $logData) {
            AuditLog::firstOrCreate(
                [
                    'event' => $logData['event'],
                    'created_at' => $logData['created_at'],
                ],
                $logData
            );
        }
    }
}
