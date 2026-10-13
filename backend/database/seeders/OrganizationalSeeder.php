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

        Department::firstOrCreate(
            ['name' => 'Recursos Humanos'],
            ['description' => 'Gestão de pessoas, onboarding e benefícios', 'is_active' => true]
        );

        // 2. Equipes
        $teamL1 = Team::firstOrCreate(
            ['department_id' => $deptIT->id, 'name' => 'Service Desk L1'],
            ['description' => 'Primeiro nível de atendimento a incidentes e dúvidas diárias', 'is_active' => true]
        );

        Team::firstOrCreate(
            ['department_id' => $deptIT->id, 'name' => 'Suporte Avançado L2'],
            ['description' => 'Resolução de problemas complexos de software e integrações', 'is_active' => true]
        );

        Team::firstOrCreate(
            ['department_id' => $deptInfra->id, 'name' => 'Infraestrutura Cloud'],
            ['description' => 'Monitoramento de servidores, VPN e conectividade', 'is_active' => true]
        );

        // 3. Alocação de Membros às Equipes
        $manager = User::where('email', 'manager@helpdeskpro.local')->first();
        $agent = User::where('email', 'agent@helpdeskpro.local')->first();

        if ($manager && $teamL1) {
            $teamL1->users()->syncWithoutDetaching([
                $manager->id => ['is_leader' => true],
            ]);
        }

        if ($agent && $teamL1) {
            $teamL1->users()->syncWithoutDetaching([
                $agent->id => ['is_leader' => false],
            ]);
        }

        // 4. Categorias
        $categories = [
            ['name' => 'Problemas com Hardware', 'department_id' => $deptIT->id, 'description' => 'Computadores, monitores e periféricos'],
            ['name' => 'Acessos e Permissões', 'department_id' => $deptIT->id, 'description' => 'Criação de contas, liberação de pastas e acessos'],
            ['name' => 'Falha de Conexão ou VPN', 'department_id' => $deptInfra->id, 'description' => 'Instabilidade de internet, VPN e Wi-Fi'],
            ['name' => 'Solicitação de Equipamento', 'department_id' => $deptFacilities->id, 'description' => 'Troca de cadeiras, mesas ou material de apoio'],
            ['name' => 'Dúvidas Gerais de Sistema', 'department_id' => $deptIT->id, 'description' => 'Orientações sobre uso das plataformas da empresa'],
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
            Priority::firstOrCreate(
                ['name' => $priorityData['name']],
                $priorityData
            );
        }
    }
}
