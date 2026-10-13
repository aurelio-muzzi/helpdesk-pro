<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditLogSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $requester;

    private User $agent;

    private Department $dept;

    private Category $category;

    private Priority $priority;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $adminRole = Role::where('name', UserRole::ADMIN->value)->firstOrFail();
        $agentRole = Role::where('name', UserRole::AGENT->value)->firstOrFail();
        $requesterRole = Role::where('name', UserRole::REQUESTER->value)->firstOrFail();

        $this->admin = User::factory()->create(['name' => 'Admin Auditor', 'role_id' => $adminRole->id, 'password' => bcrypt('Secret123!')]);
        $this->agent = User::factory()->create(['name' => 'Agente Auditor', 'role_id' => $agentRole->id]);
        $this->requester = User::factory()->create(['name' => 'Cliente Auditor', 'role_id' => $requesterRole->id, 'password' => bcrypt('Secret123!')]);

        $this->dept = Department::create(['name' => 'Tecnologia', 'is_active' => true]);
        $this->category = Category::create([
            'department_id' => $this->dept->id,
            'name' => 'Acessos & Contas',
            'slug' => 'acessos-contas',
            'is_active' => true,
        ]);
        $this->priority = Priority::create([
            'name' => 'media',
            'display_name' => 'Média',
            'order' => 2,
            'color' => '#3b82f6',
            'is_active' => true,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_audit_logs(): void
    {
        $response = $this->getJson('/api/v1/audit-logs');

        $response->assertStatus(401);
    }

    public function test_non_admin_user_cannot_access_audit_logs(): void
    {
        Sanctum::actingAs($this->requester);

        $response = $this->getJson('/api/v1/audit-logs');
        $response->assertStatus(403);

        Sanctum::actingAs($this->agent);
        $agentResponse = $this->getJson('/api/v1/audit-logs');
        $agentResponse->assertStatus(403);
    }

    public function test_admin_can_list_audit_logs_with_filters_and_pagination(): void
    {
        Sanctum::actingAs($this->admin);

        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'auth.login',
            'description' => 'Login do administrador no sistema.',
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'ticket.deleted',
            'description' => 'Chamado de teste excluído.',
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);

        $response = $this->getJson('/api/v1/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'event',
                        'description',
                        'ip_address',
                        'created_at',
                        'user',
                    ],
                ],
                'links',
                'meta',
            ]);

        // Filtro por evento
        $filteredResponse = $this->getJson('/api/v1/audit-logs?event=ticket.deleted');
        $filteredResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.event', 'ticket.deleted');

        // Filtro por busca textual
        $searchResponse = $this->getJson('/api/v1/audit-logs?search=administrador');
        $searchResponse->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.event', 'auth.login');
    }

    public function test_auth_actions_record_audit_logs(): void
    {
        // 1. Falha de login
        $failedResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->admin->email,
            'password' => 'WrongPassword!',
        ]);
        $failedResponse->assertStatus(401);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'auth.failed_login',
        ]);

        // 2. Login bem sucedido
        $successResponse = $this->postJson('/api/v1/auth/login', [
            'email' => $this->admin->email,
            'password' => 'Secret123!',
        ]);
        $successResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'auth.login',
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_ticket_operations_record_audit_logs(): void
    {
        Sanctum::actingAs($this->admin);

        // Criar chamado
        $createResponse = $this->postJson('/api/v1/tickets', [
            'title' => 'Problema no firewall',
            'description' => 'Bloqueio indevido de portas.',
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);
        $createResponse->assertStatus(201);
        $ticketId = $createResponse->json('data.id');

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'ticket.created',
            'user_id' => $this->admin->id,
            'auditable_id' => $ticketId,
        ]);

        /** @var Ticket $ticket */
        $ticket = Ticket::find($ticketId);

        // Alterar status
        $statusResponse = $this->patchJson("/api/v1/tickets/{$ticket->id}/status", [
            'status' => TicketStatus::IN_PROGRESS->value,
            'comment' => 'Iniciando investigação de portas.',
        ]);
        $statusResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'ticket.status_changed',
            'user_id' => $this->admin->id,
            'auditable_id' => $ticket->id,
        ]);
    }

    public function test_responses_include_security_headers(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $this->assertTrue($response->headers->has('Content-Security-Policy'));
    }
}
