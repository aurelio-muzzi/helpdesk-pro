<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Roles
        $adminRole = Role::firstOrCreate(
            ['name' => UserRole::ADMIN->value],
            ['display_name' => 'Administrador', 'description' => 'Acesso total a todas as áreas e configurações do sistema']
        );

        $managerRole = Role::firstOrCreate(
            ['name' => UserRole::MANAGER->value],
            ['display_name' => 'Gerente', 'description' => 'Gestão de equipes, acompanhamento de SLA e relatórios']
        );

        $agentRole = Role::firstOrCreate(
            ['name' => UserRole::AGENT->value],
            ['display_name' => 'Agente de Suporte', 'description' => 'Atendimento, resolução de chamados e notas internas']
        );

        $requesterRole = Role::firstOrCreate(
            ['name' => UserRole::REQUESTER->value],
            ['display_name' => 'Solicitante', 'description' => 'Abertura, acompanhamento e avaliação dos seus chamados']
        );

        // 2. Permissions
        $permissions = [
            // Tickets
            ['name' => 'tickets.view', 'group' => 'tickets', 'display_name' => 'Visualizar chamados'],
            ['name' => 'tickets.create', 'group' => 'tickets', 'display_name' => 'Criar chamados'],
            ['name' => 'tickets.update', 'group' => 'tickets', 'display_name' => 'Atualizar chamados'],
            ['name' => 'tickets.delete', 'group' => 'tickets', 'display_name' => 'Excluir chamados'],
            ['name' => 'tickets.assign', 'group' => 'tickets', 'display_name' => 'Atribuir responsáveis'],
            ['name' => 'tickets.status', 'group' => 'tickets', 'display_name' => 'Alterar status de chamados'],
            ['name' => 'tickets.internal_comments', 'group' => 'tickets', 'display_name' => 'Comentários internos'],

            // SLA & Reports
            ['name' => 'sla.manage', 'group' => 'sla', 'display_name' => 'Gerenciar políticas de SLA'],
            ['name' => 'reports.view', 'group' => 'reports', 'display_name' => 'Acessar relatórios e métricas'],
            ['name' => 'audit.view', 'group' => 'audit', 'display_name' => 'Visualizar logs de auditoria'],

            // Users & Teams
            ['name' => 'users.manage', 'group' => 'users', 'display_name' => 'Gerenciar usuários do sistema'],
            ['name' => 'teams.manage', 'group' => 'teams', 'display_name' => 'Gerenciar equipes e departamentos'],
        ];

        $createdPermissions = [];
        foreach ($permissions as $permData) {
            $createdPermissions[$permData['name']] = Permission::firstOrCreate(
                ['name' => $permData['name']],
                $permData
            );
        }

        // 3. Vincular Permissões às Roles
        // Admin: todas as permissões
        $adminRole->permissions()->sync(array_values(array_map(fn ($p) => $p->id, $createdPermissions)));

        // Manager: chamados, relatórios, atribuição, notas internas
        $managerRole->permissions()->sync([
            $createdPermissions['tickets.view']->id,
            $createdPermissions['tickets.create']->id,
            $createdPermissions['tickets.update']->id,
            $createdPermissions['tickets.assign']->id,
            $createdPermissions['tickets.status']->id,
            $createdPermissions['tickets.internal_comments']->id,
            $createdPermissions['reports.view']->id,
            $createdPermissions['teams.manage']->id,
        ]);

        // Agent: chamados, notas internas, atualização e status
        $agentRole->permissions()->sync([
            $createdPermissions['tickets.view']->id,
            $createdPermissions['tickets.create']->id,
            $createdPermissions['tickets.update']->id,
            $createdPermissions['tickets.status']->id,
            $createdPermissions['tickets.internal_comments']->id,
        ]);

        // Requester: ver e criar seus próprios chamados
        $requesterRole->permissions()->sync([
            $createdPermissions['tickets.view']->id,
            $createdPermissions['tickets.create']->id,
        ]);

        // 4. Usuários de Demonstração (Seed)
        $defaultPassword = Hash::make('Password123!');

        User::firstOrCreate(
            ['email' => 'admin@helpdeskpro.local'],
            [
                'name' => 'Administrador Geral',
                'password' => $defaultPassword,
                'role_id' => $adminRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'manager@helpdeskpro.local'],
            [
                'name' => 'Carlos Gerente',
                'password' => $defaultPassword,
                'role_id' => $managerRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'agent@helpdeskpro.local'],
            [
                'name' => 'Beatriz Agente',
                'password' => $defaultPassword,
                'role_id' => $agentRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'requester@helpdeskpro.local'],
            [
                'name' => 'Lucas Solicitante',
                'password' => $defaultPassword,
                'role_id' => $requesterRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
