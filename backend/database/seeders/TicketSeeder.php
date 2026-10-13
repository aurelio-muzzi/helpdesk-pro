<?php

namespace Database\Seeders;

use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Team;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@helpdeskpro.local')->first();
        $agent = User::where('email', 'agente@helpdeskpro.local')->first();
        $requester = User::where('email', 'solicitante@helpdeskpro.local')->first();

        if (! $requester || ! $agent) {
            return;
        }

        $deptTi = Department::where('name', 'Tecnologia da Informação')->first();
        $teamN1 = Team::where('name', 'Suporte N1')->first();
        $teamInfra = Team::where('name', 'Infraestrutura & Redes')->first();

        $catHardware = Category::where('slug', 'hardware-equipamentos')->first();
        $catVpn = Category::where('slug', 'vpn-redes')->first();
        $catEmail = Category::where('slug', 'email-comunicacao')->first();
        $catErp = Category::where('slug', 'sistemas-erp')->first();

        $prioBaixa = Priority::where('name', 'baixa')->first();
        $prioMedia = Priority::where('name', 'media')->first();
        $prioAlta = Priority::where('name', 'alta')->first();
        $prioUrgente = Priority::where('name', 'urgente')->first();

        if (! $catHardware || ! $prioAlta) {
            return;
        }

        $sampleTickets = [
            [
                'code' => 'HD-2026-00001',
                'title' => 'Notebook não liga após atualização do sistema operacional',
                'description' => 'Ao ligar o notebook na manhã desta segunda-feira, a tela permanece preta e o LED de energia pisca em código de erro (3x laranja). Trabalho no setor comercial e necessito do equipamento com urgência.',
                'status' => TicketStatus::IN_PROGRESS,
                'requester_id' => $requester->id,
                'assigned_to' => $agent->id,
                'team_id' => $teamN1?->id,
                'department_id' => $deptTi?->id,
                'category_id' => $catHardware->id,
                'priority_id' => $prioAlta->id,
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado pelo solicitante.', 'created_at' => now()->subHours(5)],
                    ['action' => 'assigned', 'field_name' => 'assigned_to', 'old_value' => 'Não atribuído', 'new_value' => $agent->name, 'comment' => 'Atribuído para triagem inicial de hardware.', 'created_at' => now()->subHours(4)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'in_progress', 'comment' => 'Equipamento recolhido para bancada de testes.', 'created_at' => now()->subHours(3)],
                ],
            ],
            [
                'code' => 'HD-2026-00002',
                'title' => 'Instabilidade na conexão VPN Corporativa em regime Home Office',
                'description' => 'A conexão cai a cada 10 minutos com o erro "TLS handshake timeout". Já reiniciei o modem residencial e o erro persiste.',
                'status' => TicketStatus::OPEN,
                'requester_id' => $requester->id,
                'assigned_to' => null,
                'team_id' => $teamInfra?->id,
                'department_id' => $deptTi?->id,
                'category_id' => $catVpn?->id ?? $catHardware->id,
                'priority_id' => $prioMedia?->id ?? $prioAlta->id,
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado pelo solicitante.', 'created_at' => now()->subHours(2)],
                ],
            ],
            [
                'code' => 'HD-2026-00003',
                'title' => 'Servidor de arquivos inacessível para filial São Paulo',
                'description' => 'Nenhum colaborador da filial SP consegue acessar o share SMB \\\\fs-sp01\\dados. Toda a expedição está paralisada.',
                'status' => TicketStatus::IN_PROGRESS,
                'requester_id' => $admin?->id ?? $requester->id,
                'assigned_to' => $agent->id,
                'team_id' => $teamInfra?->id,
                'department_id' => $deptTi?->id,
                'category_id' => $catVpn?->id ?? $catHardware->id,
                'priority_id' => $prioUrgente?->id ?? $prioAlta->id,
                'histories' => [
                    ['action' => 'created', 'comment' => 'Incidente crítico reportado.', 'created_at' => now()->subHours(1)],
                    ['action' => 'assigned', 'field_name' => 'assigned_to', 'old_value' => 'Não atribuído', 'new_value' => $agent->name, 'comment' => 'Escalonamento prioritário.', 'created_at' => now()->subMinutes(50)],
                ],
            ],
            [
                'code' => 'HD-2026-00004',
                'title' => 'Configuração de assinatura de e-mail institucional e alias',
                'description' => 'Solicito criação de alias comercial@helpdeskpro.local e alinhamento do template HTML da assinatura.',
                'status' => TicketStatus::RESOLVED,
                'requester_id' => $requester->id,
                'assigned_to' => $agent->id,
                'team_id' => $teamN1?->id,
                'department_id' => $deptTi?->id,
                'category_id' => $catEmail?->id ?? $catHardware->id,
                'priority_id' => $prioBaixa?->id ?? $prioAlta->id,
                'resolved_at' => now()->subDays(1),
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subDays(2)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'resolved', 'comment' => 'Alias configurado no Exchange e testado com êxito.', 'created_at' => now()->subDays(1)],
                ],
            ],
            [
                'code' => 'HD-2026-00005',
                'title' => 'Ajuste de permissão no módulo de emissão de NF-e do ERP',
                'description' => 'Necessário liberar perfil de faturamento no ERP Protheus para a colaboradora recém-admitida.',
                'status' => TicketStatus::CLOSED,
                'requester_id' => $requester->id,
                'assigned_to' => $agent->id,
                'team_id' => $teamN1?->id,
                'department_id' => $deptTi?->id,
                'category_id' => $catErp?->id ?? $catHardware->id,
                'priority_id' => $prioMedia?->id ?? $prioAlta->id,
                'resolved_at' => now()->subDays(5),
                'closed_at' => now()->subDays(3),
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subDays(6)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'resolved', 'comment' => 'Perfil configurado.', 'created_at' => now()->subDays(5)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'resolved', 'new_value' => 'closed', 'comment' => 'Chamado homologado e encerrado pelo solicitante.', 'created_at' => now()->subDays(3)],
                ],
            ],
        ];

        foreach ($sampleTickets as $data) {
            $histories = $data['histories'];
            unset($data['histories']);

            $ticket = Ticket::updateOrCreate(
                ['code' => $data['code']],
                $data
            );

            foreach ($histories as $h) {
                TicketHistory::firstOrCreate(
                    [
                        'ticket_id' => $ticket->id,
                        'action' => $h['action'],
                        'created_at' => $h['created_at'],
                    ],
                    [
                        'user_id' => $agent->id,
                        'field_name' => $h['field_name'] ?? null,
                        'old_value' => $h['old_value'] ?? null,
                        'new_value' => $h['new_value'] ?? null,
                        'comment' => $h['comment'],
                    ]
                );
            }
        }
    }
}
