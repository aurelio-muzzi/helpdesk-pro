<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $role = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Administrador',
        ]);

        $this->adminUser = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => 'Password123!',
            'role_id' => $role->id,
            'is_active' => true,
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'admin@test.com')
            ->assertJsonPath('data.role.name', 'admin');

        $this->assertAuthenticatedAs($this->adminUser);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonPath('success', false);

        $this->assertGuest();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->adminUser->update(['is_active' => false]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('success', false);

        $this->assertGuest();
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $this->adminUser->id);
    }

    public function test_unauthenticated_user_cannot_access_me_endpoint(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Sessão encerrada com sucesso.');
    }
}
