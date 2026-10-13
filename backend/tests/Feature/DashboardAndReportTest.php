<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
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

class DashboardAndReportTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $agent;

    private User $requester;

    private Department $deptTi;

    private Department $deptRh;

    private Priority $priorityAlta;

    private Priority $priorityBaixa;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $adminRole = Role::where('name', UserRole::ADMIN->value)->firstOrFail();
        $agentRole = Role::where('name', UserRole::AGENT->value)->firstOrFail();
        $requesterRole = Role::where('name', UserRole::REQUESTER->value)->firstOrFail();

        $this->admin = User::factory()->create(['name' => 'Admin Teste', 'role_id' => $adminRole->id]);
        $this->agent = User::factory()->create(['name' => 'Agente Teste', 'role_id' => $agentRole->id]);
        $this->requester = User::factory()->create(['name' => 'Solicitante Teste', 'role_id' => $requesterRole->id]);

        $this->deptTi = Department::create(['name' => 'Tecnologia da Informação', 'is_active' => true]);
        $this->deptRh = Department::create(['name' => 'Recursos Humanos', 'is_active' => true]);

        $this->priorityAlta = Priority::create(['name' => 'alta', 'display_name' => 'Alta', 'order' => 1, 'color' => '#ef4444', 'is_active' => true]);
        $this->priorityBaixa = Priority::create(['name' => 'baixa', 'display_name' => 'Baixa', 'order' => 2, 'color' => '#10b981', 'is_active' => true]);

        $this->category = Category::create([
            'department_id' => $this->deptTi->id,
            'name' => 'Hardware',
            'slug' => 'hardware',
            'is_active' => true,
        ]);
    }

    public function test_requires_authentication_for_dashboard_metrics_and_export(): void
    {
        $this->getJson('/api/v1/dashboard/metrics')->assertUnauthorized();
        $this->getJson('/api/v1/dashboard/export')->assertUnauthorized();
    }

    public function test_admin_can_retrieve_dashboard_metrics(): void
    {
        Sanctum::actingAs($this->admin);

        // Criar chamados variados
        Ticket::create([
            'code' => 'HD-2026-00001',
            'title' => 'Problema no Servidor',
            'description' => 'Servidor de banco fora do ar',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'department_id' => $this->deptTi->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'sla_status' => 'pending',
            'created_at' => now()->subDay(),
        ]);

        Ticket::create([
            'code' => 'HD-2026-00002',
            'title' => 'Configurar email novo colaborador',
            'description' => 'Email corporativo para RH',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->deptRh->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityBaixa->id,
            'sla_status' => 'within_sla',
            'first_response_at' => now()->subHours(20),
            'resolved_at' => now()->subHours(10),
            'created_at' => now()->subDay(),
        ]);

        Ticket::create([
            'code' => 'HD-2026-00003',
            'title' => 'Lentidão no sistema ERP',
            'description' => 'Tempo de resposta muito alto',
            'status' => TicketStatus::IN_PROGRESS,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->deptTi->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'sla_status' => 'breached',
            'first_response_at' => now()->subHours(5),
            'created_at' => now()->subHours(12),
        ]);

        $response = $this->getJson('/api/v1/dashboard/metrics?period=7d');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'period' => ['from', 'to'],
                    'summary' => [
                        'total_tickets',
                        'open_tickets',
                        'in_progress_tickets',
                        'resolved_tickets',
                        'closed_tickets',
                        'sla_breached',
                        'sla_within',
                        'sla_compliance_rate',
                        'avg_first_response_minutes',
                        'avg_resolution_minutes',
                    ],
                    'tickets_by_status',
                    'tickets_by_priority',
                    'tickets_by_department',
                    'volume_over_time',
                    'agent_performance',
                    'recent_tickets',
                ],
            ]);

        $data = $response->json('data');
        $this->assertEquals(3, $data['summary']['total_tickets']);
        $this->assertEquals(1, $data['summary']['open_tickets']);
        $this->assertEquals(1, $data['summary']['in_progress_tickets']);
        $this->assertEquals(1, $data['summary']['resolved_tickets']);
        $this->assertEquals(1, $data['summary']['sla_breached']);
        $this->assertEquals(1, $data['summary']['sla_within']);
        // 1 within de 2 avaliados = 50%
        $this->assertEquals(50.0, $data['summary']['sla_compliance_rate']);
        $this->assertNotNull($data['summary']['avg_first_response_minutes']);
        $this->assertNotNull($data['summary']['avg_resolution_minutes']);

        // Agent performance
        $this->assertCount(1, $data['agent_performance']);
        $this->assertEquals($this->agent->name, $data['agent_performance'][0]['name']);
        $this->assertEquals(2, $data['agent_performance'][0]['assigned_count']);
        $this->assertEquals(1, $data['agent_performance'][0]['resolved_count']);
    }

    public function test_metrics_are_filtered_by_department(): void
    {
        Sanctum::actingAs($this->admin);

        Ticket::create([
            'code' => 'HD-2026-00001',
            'title' => 'Chamado de TI',
            'description' => 'Desc',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'department_id' => $this->deptTi->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'created_at' => now(),
        ]);

        Ticket::create([
            'code' => 'HD-2026-00002',
            'title' => 'Chamado de RH',
            'description' => 'Desc',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'department_id' => $this->deptRh->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'created_at' => now(),
        ]);

        $response = $this->getJson("/api/v1/dashboard/metrics?department_id={$this->deptTi->id}");
        $response->assertOk();

        $data = $response->json('data');
        $this->assertEquals(1, $data['summary']['total_tickets']);
    }

    public function test_requester_metrics_are_strictly_scoped_to_their_tickets(): void
    {
        $otherRequester = User::factory()->create([
            'role_id' => Role::where('name', UserRole::REQUESTER->value)->firstOrFail()->id,
        ]);

        Ticket::create([
            'code' => 'HD-2026-00001',
            'title' => 'Meu Chamado',
            'description' => 'Desc',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'department_id' => $this->deptTi->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'created_at' => now(),
        ]);

        Ticket::create([
            'code' => 'HD-2026-00002',
            'title' => 'Chamado de Outro',
            'description' => 'Desc',
            'status' => TicketStatus::OPEN,
            'requester_id' => $otherRequester->id,
            'department_id' => $this->deptTi->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'created_at' => now(),
        ]);

        Sanctum::actingAs($this->requester);
        $response = $this->getJson('/api/v1/dashboard/metrics');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertEquals(1, $data['summary']['total_tickets']);
    }

    public function test_csv_export_returns_streamed_file_with_headers_and_data(): void
    {
        Sanctum::actingAs($this->admin);

        Ticket::create([
            'code' => 'HD-2026-99999',
            'title' => 'Chamado para Teste de Exportação CSV',
            'description' => 'Descrição do chamado CSV',
            'status' => TicketStatus::RESOLVED,
            'requester_id' => $this->requester->id,
            'assigned_to' => $this->agent->id,
            'department_id' => $this->deptTi->id,
            'category_id' => $this->category->id,
            'priority_id' => $this->priorityAlta->id,
            'sla_status' => 'within_sla',
            'created_at' => now(),
        ]);

        $response = $this->get('/api/v1/dashboard/export?period=7d');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('attachment; filename=', (string) $response->headers->get('content-disposition'));

        $content = $response->streamedContent();

        // Verifica UTF-8 BOM
        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);

        // Verifica cabeçalhos e linha de dados
        $this->assertStringContainsString('Código;Título;Status;Prioridade;', $content);
        $this->assertStringContainsString('HD-2026-99999;', $content);
        $this->assertStringContainsString('Chamado para Teste de Exportação CSV', $content);
        $this->assertStringContainsString('Dentro do Prazo', $content);
    }
}
