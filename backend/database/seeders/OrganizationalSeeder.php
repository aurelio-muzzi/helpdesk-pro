<?php

namespace Database\Seeders;

use App\Enums\PriorityLevel;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrganizationalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Departamentos
        $deptIT = Department::firstOrCreate(
            ['name' => 'Tecnologia da Informação'],
            ['description' => 'Sistemas corporativos, desenvolvimento e suporte aos colaboradores', 'is_active' => true]
        );

        $deptInfra = Department::firstOrCreate(
            ['name' => 'Infraestrutura e Redes'],
            ['description' => 'Servidores, cloud computing, conectividade e segurança física/lógica', 'is_active' => true]
        );

        $deptFacilities = Department::firstOrCreate(
            ['name' => 'Operações e Facilities'],
            ['description' => 'Manutenção predial, equipamentos e logística interna', 'is_active' => true]
        );

        $deptRH = Department::firstOrCreate(
            ['name' => 'Recursos Humanos'],
            ['description' => 'Gestão de pessoas, onboarding e benefícios', 'is_active' => true]
        );

        $deptFin = Department::firstOrCreate(
            ['name' => 'Financeiro e Controladoria'],
            ['description' => 'Faturamento, contas a pagar, tesouraria e controladoria', 'is_active' => true]
        );

        $deptCom = Department::firstOrCreate(
            ['name' => 'Comercial e Vendas'],
            ['description' => 'Equipe comercial, expansão de negócios e relacionamento com clientes', 'is_active' => true]
        );

        // 2. Equipes
        $teamL1 = Team::firstOrCreate(
            ['department_id' => $deptIT->id, 'name' => 'Service Desk L1'],
            ['description' => 'Primeiro nível de atendimento a incidentes e dúvidas diárias', 'is_active' => true]
        );

        $teamL2 = Team::firstOrCreate(
            ['department_id' => $deptIT->id, 'name' => 'Suporte Avançado L2'],
            ['description' => 'Resolução de problemas complexos de software, banco de dados e integrações', 'is_active' => true]
        );

        $teamInfra = Team::firstOrCreate(
            ['department_id' => $deptInfra->id, 'name' => 'Infraestrutura Cloud'],
            ['description' => 'Monitoramento de servidores, VPN, firewalls e conectividade', 'is_active' => true]
        );

        $teamSec = Team::firstOrCreate(
            ['department_id' => $deptInfra->id, 'name' => 'Segurança da Informação'],
            ['description' => 'Auditoria de acessos, políticas de proteção e resposta a ameaças', 'is_active' => true]
        );

        // 3. Alocação de Membros às Equipes
        $manager = User::where('email', 'manager@helpdeskpro.local')->first();
        $agentBeatriz = User::whereIn('email', ['agente@helpdeskpro.local', 'agent@helpdeskpro.local'])->first();
        $agentMariana = User::where('email', 'mariana.souza@helpdeskpro.local')->first();
        $agentLucas = User::where('email', 'lucas.mendes@helpdeskpro.local')->first();
        $agentRafael = User::where('email', 'rafael.nogueira@helpdeskpro.local')->first();
        $agentCarlos = User::where('email', 'carlos.eduardo@helpdeskpro.local')->first();

        // Service Desk L1
        if ($teamL1) {
            $l1Members = [];
            if ($manager) {
                $l1Members[$manager->id] = ['is_leader' => true];
            }
            if ($agentBeatriz) {
                $l1Members[$agentBeatriz->id] = ['is_leader' => false];
            }
            if ($agentMariana) {
                $l1Members[$agentMariana->id] = ['is_leader' => false];
            }
            if ($agentCarlos) {
                $l1Members[$agentCarlos->id] = ['is_leader' => false];
            }

            $teamL1->users()->syncWithoutDetaching($l1Members);
        }

        // Suporte Avançado L2
        if ($teamL2) {
            $l2Members = [];
            if ($agentRafael) {
                $l2Members[$agentRafael->id] = ['is_leader' => true];
            }
            if ($agentMariana) {
                $l2Members[$agentMariana->id] = ['is_leader' => false];
            }

            $teamL2->users()->syncWithoutDetaching($l2Members);
        }

        // Infraestrutura Cloud
        if ($teamInfra) {
            $infraMembers = [];
            if ($agentLucas) {
                $infraMembers[$agentLucas->id] = ['is_leader' => true];
            }
            if ($agentBeatriz) {
                $infraMembers[$agentBeatriz->id] = ['is_leader' => false];
            }

            $teamInfra->users()->syncWithoutDetaching($infraMembers);
        }

        // Segurança da Informação
        if ($teamSec) {
            $secMembers = [];
            if ($agentLucas) {
                $secMembers[$agentLucas->id] = ['is_leader' => true];
            }
            if ($manager) {
                $secMembers[$manager->id] = ['is_leader' => false];
            }

            $teamSec->users()->syncWithoutDetaching($secMembers);
        }

        // 4. Categorias Corporativas
        $categories = [
            ['name' => 'Problemas com Hardware', 'department_id' => $deptIT->id, 'description' => 'Computadores, monitores, peças e periféricos com falhas'],
            ['name' => 'Acessos e Permissões', 'department_id' => $deptIT->id, 'description' => 'Criação de contas, liberação de pastas de rede e permissões especiais'],
            ['name' => 'Falha de Conexão ou VPN', 'department_id' => $deptInfra->id, 'description' => 'Instabilidade de internet corporativa, túneis VPN e rede Wi-Fi'],
            ['name' => 'Sistemas ERP & Faturamento', 'department_id' => $deptIT->id, 'description' => 'Módulos de emissão de NF-e, fechamento financeiro e ERP corporativo'],
            ['name' => 'E-mail e Comunicação Corporativa', 'department_id' => $deptIT->id, 'description' => 'Contas do Exchange/Outlook, listas de distribuição e alias'],
            ['name' => 'Solicitação de Equipamento', 'department_id' => $deptFacilities->id, 'description' => 'Novos periféricos, fones, adaptadores ou material de apoio'],
            ['name' => 'Telefonia & VoIP', 'department_id' => $deptInfra->id, 'description' => 'Ramais corporativos, linhas SIP e centrais telefônicas'],
            ['name' => 'Dúvidas Gerais de Sistema', 'department_id' => $deptIT->id, 'description' => 'Orientações e boas práticas sobre o uso das ferramentas corporativas'],
        ];

        foreach ($categories as $catData) {
            Category::firstOrCreate(
                ['name' => $catData['name']],
                $catData
            );
        }

        // 5. Prioridades
        $priorities = [
            [
                'name' => PriorityLevel::LOW->value,
                'display_name' => PriorityLevel::LOW->label(),
                'order' => 1,
                'color' => PriorityLevel::LOW->defaultColor(),
                'description' => 'Incidentes de baixo impacto operacional sem impedimento de trabalho',
            ],
            [
                'name' => PriorityLevel::MEDIUM->value,
                'display_name' => PriorityLevel::MEDIUM->label(),
                'order' => 2,
                'color' => PriorityLevel::MEDIUM->defaultColor(),
                'description' => 'Incidentes de impacto moderado com solução de contorno disponível',
            ],
            [
                'name' => PriorityLevel::HIGH->value,
                'display_name' => PriorityLevel::HIGH->label(),
                'order' => 3,
                'color' => PriorityLevel::HIGH->defaultColor(),
                'description' => 'Problemas críticos afetando múltiplos usuários ou processos essenciais',
            ],
            [
                'name' => PriorityLevel::URGENT->value,
                'display_name' => PriorityLevel::URGENT->label(),
                'order' => 4,
                'color' => PriorityLevel::URGENT->defaultColor(),
                'description' => 'Interrupção total de serviço vital da organização',
            ],
        ];

        foreach ($priorities as $priorityData) {
            Priority::updateOrCreate(
                ['name' => $priorityData['name']],
                $priorityData
            );
        }
    }
}
