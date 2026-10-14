<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private Role $agentRole;

    private Role $requesterRole;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->agentRole = Role::create([
            'name' => UserRole::AGENT->value,
            'display_name' => 'Agente de Atendimento',
        ]);

        $this->requesterRole = Role::create([
            'name' => UserRole::REQUESTER->value,
            'display_name' => 'Solicitante',
        ]);

        $this->adminUser = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => 'Password123!',
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_list_users_and_roles(): void
    {
        User::create([
            'name' => 'Agente 1',
            'email' => 'agente1@test.com',
            'password' => 'Password123!',
            'role_id' => $this->agentRole->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->getJson('/api/v1/users');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');

        $rolesResponse = $this->actingAs($this->adminUser)->getJson('/api/v1/roles');
        $rolesResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_team_agent_and_company_requester(): void
    {
        $dept = Department::create(['name' => 'TI']);
        $team = Team::create(['name' => 'Suporte L1', 'department_id' => $dept->id]);

        // Cadastro de Agente de Equipe
        $agentResponse = $this->actingAs($this->adminUser)->postJson('/api/v1/users', [
            'name' => 'Beatriz Agente',
            'email' => 'beatriz@helpdeskpro.local',
            'password' => 'Secret123!',
            'role_id' => $this->agentRole->id,
            'team_ids' => [$team->id],
            'is_active' => true,
        ]);

        $agentResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Beatriz Agente')
            ->assertJsonPath('data.email', 'beatriz@helpdeskpro.local')
            ->assertJsonPath('data.role.name', 'agent');

        // Cadastro de Solicitante da Empresa (que abre chamados)
        $requesterResponse = $this->actingAs($this->adminUser)->postJson('/api/v1/users', [
            'name' => 'João Solicitante',
            'email' => 'joao@empresa.com',
            'password' => 'Secret123!',
            'role_id' => $this->requesterRole->id,
            'is_active' => true,
        ]);

        $requesterResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'João Solicitante')
            ->assertJsonPath('data.role.name', 'requester');

        $this->assertDatabaseHas('users', ['email' => 'joao@empresa.com']);
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::create([
            'name' => 'Carlos Antigo',
            'email' => 'carlos@test.com',
            'password' => 'Password123!',
            'role_id' => $this->requesterRole->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->putJson("/api/v1/users/{$user->id}", [
            'name' => 'Carlos Promovido',
            'role_id' => $this->agentRole->id,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Carlos Promovido')
            ->assertJsonPath('data.role.name', 'agent');
    }
}
