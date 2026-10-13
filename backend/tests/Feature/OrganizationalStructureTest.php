<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Role;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationalStructureTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $this->adminUser = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => 'Password123!',
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_list_departments(): void
    {
        Department::create(['name' => 'Suporte L1', 'description' => 'Desc L1']);
        Department::create(['name' => 'Suporte L2', 'description' => 'Desc L2']);

        $response = $this->actingAs($this->adminUser)->getJson('/api/v1/departments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_authenticated_user_can_create_department(): void
    {
        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/departments', [
            'name' => 'Recursos Humanos',
            'description' => 'Gestão de pessoas',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Recursos Humanos');

        $this->assertDatabaseHas('departments', ['name' => 'Recursos Humanos']);
    }

    public function test_authenticated_user_can_create_and_list_teams(): void
    {
        $dept = Department::create(['name' => 'Engenharia']);

        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/teams', [
            'department_id' => $dept->id,
            'name' => 'SRE Team',
            'description' => 'Confiabilidade',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'SRE Team');

        $listResponse = $this->actingAs($this->adminUser)->getJson('/api/v1/teams?department_id='.$dept->id);

        $listResponse->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_can_sync_team_members_with_leader(): void
    {
        $dept = Department::create(['name' => 'Operações']);
        $team = Team::create(['department_id' => $dept->id, 'name' => 'Field Support']);

        $member = User::create([
            'name' => 'Agent Member',
            'email' => 'member@test.com',
            'password' => 'Password123!',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminUser)->postJson("/api/v1/teams/{$team->id}/members", [
            'members' => [
                ['user_id' => $member->id, 'is_leader' => true],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.users');

        $this->assertDatabaseHas('team_members', [
            'team_id' => $team->id,
            'user_id' => $member->id,
            'is_leader' => true,
        ]);
    }

    public function test_can_create_category_with_auto_slug(): void
    {
        $dept = Department::create(['name' => 'Hardware']);

        $response = $this->actingAs($this->adminUser)->postJson('/api/v1/categories', [
            'department_id' => $dept->id,
            'name' => 'Troca de Teclado',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.slug', 'troca-de-teclado');

        $this->assertDatabaseHas('categories', ['slug' => 'troca-de-teclado']);
    }

    public function test_can_list_priorities_in_order(): void
    {
        Priority::create(['name' => 'HIGH', 'display_name' => 'Alta', 'order' => 3, 'color' => '#f59e0b']);
        Priority::create(['name' => 'LOW', 'display_name' => 'Baixa', 'order' => 1, 'color' => '#3b82f6']);
        Priority::create(['name' => 'MEDIUM', 'display_name' => 'Média', 'order' => 2, 'color' => '#10b981']);

        $response = $this->actingAs($this->adminUser)->getJson('/api/v1/priorities');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.name', 'LOW')
            ->assertJsonPath('data.1.name', 'MEDIUM')
            ->assertJsonPath('data.2.name', 'HIGH');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/departments');
        $response->assertStatus(401);
    }
}
