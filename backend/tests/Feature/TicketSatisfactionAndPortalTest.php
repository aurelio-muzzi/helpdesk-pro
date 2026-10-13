<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketSatisfaction;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketSatisfactionAndPortalTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $agent;

    private User $requester;

    private User $otherRequester;

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

        $this->admin = User::factory()->create(['name' => 'Admin CSAT', 'role_id' => $adminRole->id]);
        $this->agent = User::factory()->create(['name' => 'Agente CSAT', 'role_id' => $agentRole->id]);
        $this->requester = User::factory()->create(['name' => 'Solicitante CSAT', 'role_id' => $requesterRole->id]);
        $this->otherRequester = User::factory()->create(['name' => 'Outro Solicitante', 'role_id' => $requesterRole->id]);

        $this->dept = Department::create(['name' => 'TI', 'is_active' => true]);
        $this->category = Category::create([
            'department_id' => $this->dept->id,
            'name' => 'Hardware',
            'slug' => 'hardware',
            'is_active' => true,
        ]);
        $this->priority = Priority::create([
            'name' => 'alta',
            'display_name' => 'Alta',
            'order' => 1,
            'color' => '#ef4444',
            'is_active' => true,
        ]);
    }

    public function test_requester_can_rate_resolved_ticket_with_csat(): void
    {
        $ticket = Ticket::create([
            'code' => 'HD-2026-00010',
            'title' => 'Problema na Impressora',
            'description' => 'Não imprime em rede',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->dept->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolved_at' => now(),
        ]);

        Sanctum::actingAs($this->requester);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/satisfaction", [
            'rating' => 5,
            'comment' => 'Atendimento impecável e rápido!',
        ]);

        $response->assertCreated();
        $this->assertEquals(5, $response->json('data.rating'));
        $this->assertEquals('Atendimento impecável e rápido!', $response->json('data.comment'));

        $this->assertDatabaseHas('ticket_satisfactions', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->requester->id,
            'rating' => 5,
        ]);

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $ticket->id,
            'action' => 'rated',
        ]);
    }

    public function test_cannot_rate_open_or_in_progress_ticket(): void
    {
        $ticket = Ticket::create([
            'code' => 'HD-2026-00011',
            'title' => 'Chamado em Andamento',
            'description' => 'Ainda não foi solucionado',
            'status' => TicketStatus::IN_PROGRESS,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->dept->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
        ]);

        Sanctum::actingAs($this->requester);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/satisfaction", [
            'rating' => 4,
        ]);

        $response->assertStatus(422);
    }

    public function test_non_requester_cannot_rate_ticket(): void
    {
        $ticket = Ticket::create([
            'code' => 'HD-2026-00012',
            'title' => 'Chamado Resolvido',
            'description' => 'Solucionado',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->dept->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolved_at' => now(),
        ]);

        Sanctum::actingAs($this->otherRequester);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/satisfaction", [
            'rating' => 5,
        ]);

        $response->assertForbidden();
    }

    public function test_cannot_rate_ticket_twice(): void
    {
        $ticket = Ticket::create([
            'code' => 'HD-2026-00013',
            'title' => 'Chamado Resolvido Duplicidade',
            'description' => 'Solucionado',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->dept->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolved_at' => now(),
        ]);

        TicketSatisfaction::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->requester->id,
            'rating' => 4,
        ]);

        Sanctum::actingAs($this->requester);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/satisfaction", [
            'rating' => 5,
        ]);

        $response->assertStatus(422);
    }

    public function test_requester_can_reopen_resolved_ticket(): void
    {
        $ticket = Ticket::create([
            'code' => 'HD-2026-00014',
            'title' => 'Chamado com Falha Recorrente',
            'description' => 'Solucionado mas retornou',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->dept->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolved_at' => now(),
        ]);

        Sanctum::actingAs($this->requester);

        $response = $this->postJson("/api/v1/tickets/{$ticket->id}/reopen", [
            'reason' => 'O equipamento voltou a apresentar o mesmo defeito.',
        ]);

        $response->assertOk();
        $this->assertEquals(TicketStatus::IN_PROGRESS->value, $response->json('data.status.value'));
        $this->assertNull($ticket->fresh()->resolved_at);

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $ticket->id,
            'action' => 'status_changed',
            'old_value' => 'resolved',
            'new_value' => 'in_progress',
        ]);
    }

    public function test_csat_metrics_reflected_in_dashboard(): void
    {
        $ticket = Ticket::create([
            'code' => 'HD-2026-00015',
            'title' => 'Chamado com CSAT 5',
            'description' => 'Desc',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->dept->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priority->id,
            'resolved_at' => now(),
            'created_at' => now(),
        ]);

        TicketSatisfaction::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->requester->id,
            'rating' => 5,
            'comment' => 'Nota máxima!',
        ]);

        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/dashboard/metrics');
        $response->assertOk();

        $summary = $response->json('data.summary');
        $this->assertEquals(5.0, $summary['avg_csat']);
        $this->assertEquals(1, $summary['csat_total_ratings']);
        $this->assertEquals(100.0, $summary['csat_satisfaction_rate']);
    }
}
