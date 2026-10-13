<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_role_and_permission_methods(): void
    {
        $role = Role::create([
            'name' => UserRole::AGENT->value,
            'display_name' => 'Agente',
        ]);

        $permission = Permission::create([
            'name' => 'tickets.update',
            'group' => 'tickets',
            'display_name' => 'Atualizar chamados',
        ]);

        $role->permissions()->attach($permission->id);

        $user = User::create([
            'name' => 'Agent Test',
            'email' => 'agent@test.com',
            'password' => 'Password123!',
            'role_id' => $role->id,
            'is_active' => true,
        ]);

        $this->assertTrue($user->isAgent());
        $this->assertFalse($user->isAdmin());
        $this->assertFalse($user->isRequester());
        $this->assertTrue($user->hasPermission('tickets.update'));
        $this->assertFalse($user->hasPermission('users.manage'));
    }

    public function test_admin_has_all_permissions_implicitly(): void
    {
        $adminRole = Role::create([
            'name' => UserRole::ADMIN->value,
            'display_name' => 'Admin',
        ]);

        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@test.com',
            'password' => 'Password123!',
            'role_id' => $adminRole->id,
            'is_active' => true,
        ]);

        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($admin->hasPermission('any.arbitrary.permission'));
    }
}
