<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Role;
use App\Models\Team;
use App\Models\Ticket;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $agent;

    private User $requester;

    private Department $department;

    private Team $team;

    private Category $category;

    private Priority $priority;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $adminRole = Role::where('name', UserRole::ADMIN->value)->firstOrFail();
        $agentRole = Role::where('name', UserRole::AGENT->value)->firstOrFail();
        $requesterRole = Role::where('name', UserRole::REQUESTER->value)->firstOrFail();

        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
        $this->agent = User::factory()->create(['role_id' => $agentRole->id]);
        $this->requester = User::factory()->create(['role_id' => $requesterRole->id]);

        $this->department = Department::create(['name' => 'Tecnologia da Informação', 'is_active' => true]);
        $this->team = Team::create(['department_id' => $this->department->id, 'name' => 'Suporte N1', 'is_active' => true]);
        $this->category = Category::create([
            'department_id' => $this->department->id,
            'name' => 'Hardware',
            'slug' => 'hardware',
            'is_active' => true,
        ]);
        $this->priority = Priority::create([
            'name' => 'alta',
            'display_name' => 'Alta',
            'order' => 3,
            'color' => '#f59e0b',
            'is_active' => true,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_tickets(): void
    {
        $this->getJson('/api/v1/tickets')->assertUnauthorized();
        $this->postJson('/api/v1/tickets', [])->assertUnauthorized();
    }

    public function test_requester_can_create_ticket_with_sequential_code(): void
    {
        $response = $this->actingAs($this->requester)
            ->postJson('/api/v1/tickets', [
                'title' => 'Problema com teclado do notebook',
                'description' => 'Várias teclas pararam de funcionar repentinamente.',
                'category_id' => $this->category->id,
                'priority_id' => $this->priority->id,
                'department_id' => $this->department->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Problema com teclado do notebook')
            ->assertJsonPath('data.status.value', 'open');

        $year = date('Y');
        $this->assertMatchesRegularExpression("/^HD-{$year}-\d{5}$/", $response->json('data.code'));

        $this->assertDatabaseHas('tickets', [
            'title' => 'Problema com teclado do notebook',
            'requester_id' => $this->requester->id,
            'status' => 'open',
        ]);

        $this->assertDatabaseHas('ticket_histories', [
            'action' => 'created',
            'user_id' => $this->requester->id,
        ]);
    }

    public function test_validates_required_fields_when_creating_ticket(): void
    {
        $response = $this->actingAs($this->requester)
            ->postJson('/api/v1/tickets', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'description', 'category_id', 'priority_id']);
    }

    public function test_requester_only_sees_their_own_tickets(): void
    {
        // Ticket do solicitante logado
        Ticket::create([
            'title' => 'Chamado Próprio',
            'description' => 'Descrição do chamado próprio',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        // Ticket de outro solicitante
        $otherRequester = User::factory()->create();
        Ticket::create([
            'title' => 'Chamado de Terceiro',
            'description' => 'Descrição do chamado de terceiro',
            'status' => TicketStatus::OPEN,
            'requester_id' => $otherRequester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $response = $this->actingAs($this->requester)->getJson('/api/v1/tickets');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Chamado Próprio', $response->json('data.0.title'));
    }

    public function test_agent_can_see_all_tickets_and_filter(): void
    {
        Ticket::create([
            'title' => 'Chamado 1',
            'description' => 'Descrição 1',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $response = $this->actingAs($this->agent)->getJson('/api/v1/tickets');
        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_agent_can_assign_ticket_and_transition_to_in_progress(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado para Atribuição',
            'description' => 'Descrição do chamado para atribuição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $response = $this->actingAs($this->agent)
            ->postJson("/api/v1/tickets/{$ticket->id}/assign", [
                'assigned_to' => $this->agent->id,
                'team_id' => $this->team->id,
                'comment' => 'Assumindo o chamado.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.assigned_to.id', $this->agent->id)
            ->assertJsonPath('data.status.value', 'in_progress');

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $ticket->id,
            'action' => 'assigned',
            'comment' => 'Assumindo o chamado.',
        ]);
    }

    public function test_requester_cannot_assign_ticket(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado',
            'description' => 'Descrição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $response = $this->actingAs($this->requester)
            ->postJson("/api/v1/tickets/{$ticket->id}/assign", [
                'assigned_to' => $this->agent->id,
            ]);

        $response->assertForbidden();
    }

    public function test_status_transition_updates_timestamps_and_history(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado em Andamento',
            'description' => 'Descrição',
            'status' => TicketStatus::IN_PROGRESS,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $response = $this->actingAs($this->agent)
            ->patchJson("/api/v1/tickets/{$ticket->id}/status", [
                'status' => 'resolved',
                'comment' => 'Problema resolvido com sucesso.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status.value', 'resolved');

        $ticket->refresh();
        $this->assertEquals(TicketStatus::RESOLVED, $ticket->status);
        $this->assertNotNull($ticket->resolved_at);

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $ticket->id,
            'action' => 'status_changed',
            'old_value' => 'in_progress',
            'new_value' => 'resolved',
        ]);
    }

    public function test_rejects_invalid_status_transition(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado Aberto',
            'description' => 'Descrição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        // De OPEN para RESOLVED diretamente não é permitido para agente (precisa ir para IN_PROGRESS)
        $response = $this->actingAs($this->agent)
            ->patchJson("/api/v1/tickets/{$ticket->id}/status", [
                'status' => 'resolved',
            ]);

        $response->assertUnprocessable();
    }

    public function test_requester_can_cancel_their_own_open_ticket(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado para Cancelamento',
            'description' => 'Descrição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $response = $this->actingAs($this->requester)
            ->patchJson("/api/v1/tickets/{$ticket->id}/status", [
                'status' => 'cancelled',
                'comment' => 'Não preciso mais do atendimento.',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status.value', 'cancelled');
    }
}
