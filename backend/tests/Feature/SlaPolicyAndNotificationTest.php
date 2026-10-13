<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Role;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\TicketAssignedNotification;
use App\Services\SlaService;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlaPolicyAndNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $agent;

    private User $requester;

    private Priority $priority;

    private Category $category;

    private SlaPolicy $slaPolicy;

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

        $department = Department::create(['name' => 'TI', 'is_active' => true]);
        $this->category = Category::create([
            'department_id' => $department->id,
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

        $this->slaPolicy = SlaPolicy::create([
            'name' => 'SLA Alta Prioridade',
            'description' => 'Resposta em 60 min, Resolução em 240 min',
            'priority_id' => $this->priority->id,
            'first_response_time_minutes' => 60,
            'resolution_time_minutes' => 240,
            'is_active' => true,
        ]);
    }

    public function test_sla_policy_is_automatically_applied_to_new_ticket(): void
    {
        $response = $this->actingAs($this->requester)
            ->postJson('/api/v1/tickets', [
                'title' => 'Notebook parou de funcionar',
                'description' => 'Equipamento desligou sozinho e não liga mais.',
                'category_id' => $this->category->id,
                'priority_id' => $this->priority->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.sla.status', 'normal')
            ->assertJsonPath('data.sla.policy_name', 'SLA Alta Prioridade');

        $this->assertDatabaseHas('tickets', [
            'title' => 'Notebook parou de funcionar',
            'sla_policy_id' => $this->slaPolicy->id,
            'sla_status' => 'normal',
        ]);
    }

    public function test_first_response_is_recorded_when_agent_comments(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado',
            'description' => 'Descrição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'first_response_due_at' => now()->addHour(),
            'resolution_due_at' => now()->addHours(4),
            'sla_status' => 'normal',
        ]);

        $this->actingAs($this->agent)
            ->postJson("/api/v1/tickets/{$ticket->id}/comments", [
                'content' => 'Olá, estamos iniciando a análise do seu caso.',
            ]);

        $ticket->refresh();
        $this->assertNotNull($ticket->first_response_at);
        $this->assertEquals('normal', $ticket->sla_status);
    }

    public function test_evaluates_resolution_sla_as_met_or_breached(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado dentro do prazo',
            'description' => 'Descrição',
            'status' => TicketStatus::IN_PROGRESS,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolution_due_at' => now()->addHour(),
            'sla_status' => 'normal',
        ]);

        $response = $this->actingAs($this->agent)
            ->patchJson("/api/v1/tickets/{$ticket->id}/status", [
                'status' => 'resolved',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.sla.status', 'met');

        $ticket->refresh();
        $this->assertEquals('met', $ticket->sla_status);
    }

    public function test_check_sla_command_detects_breaches_and_notifies_assignee(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado Vencido',
            'description' => 'Descrição',
            'status' => TicketStatus::IN_PROGRESS,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolution_due_at' => now()->subMinutes(10), // Prazo expirado
            'sla_status' => 'normal',
        ]);

        $slaService = app(SlaService::class);
        $breachedCount = $slaService->checkBreaches();

        $this->assertEquals(1, $breachedCount);

        $ticket->refresh();
        $this->assertEquals('breached', $ticket->sla_status);

        // Verifica notificação registrada para o agente
        $this->assertCount(1, $this->agent->notifications);
        $notification = $this->agent->notifications->first();
        $this->assertEquals('sla_breached', $notification->data['type']);
    }

    public function test_assigning_ticket_notifies_the_assigned_agent(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado para Atribuição',
            'description' => 'Descrição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $this->actingAs($this->admin)
            ->postJson("/api/v1/tickets/{$ticket->id}/assign", [
                'assigned_to' => $this->agent->id,
            ]);

        $this->assertCount(1, $this->agent->notifications);
        $notification = $this->agent->notifications->first();
        $this->assertEquals('ticket_assigned', $notification->data['type']);
    }

    public function test_user_can_list_and_mark_notifications_as_read(): void
    {
        $ticket = Ticket::create([
            'title' => 'Chamado Teste',
            'description' => 'Descrição',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        $this->agent->notify(new TicketAssignedNotification($ticket));

        $response = $this->actingAs($this->agent)->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonPath('meta.unread_count', 1);

        $notificationId = $response->json('data.0.id');

        $markResponse = $this->actingAs($this->agent)
            ->patchJson("/api/v1/notifications/{$notificationId}/read");

        $markResponse->assertOk()
            ->assertJsonPath('unread_count', 0);
    }
}
