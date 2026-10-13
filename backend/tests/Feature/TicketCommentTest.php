<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\TicketComment;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TicketCommentTest extends TestCase
{
    use RefreshDatabase;

    private User $agent;

    private User $requester;

    private User $otherRequester;

    private Ticket $ticket;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->seed(RolesAndPermissionsSeeder::class);

        $agentRole = Role::where('name', UserRole::AGENT->value)->firstOrFail();
        $requesterRole = Role::where('name', UserRole::REQUESTER->value)->firstOrFail();

        $this->agent = User::factory()->create(['role_id' => $agentRole->id]);
        $this->requester = User::factory()->create(['role_id' => $requesterRole->id]);
        $this->otherRequester = User::factory()->create(['role_id' => $requesterRole->id]);

        $department = Department::create(['name' => 'TI', 'is_active' => true]);
        $category = Category::create([
            'department_id' => $department->id,
            'name' => 'Hardware',
            'slug' => 'hardware',
            'is_active' => true,
        ]);
        $priority = Priority::create([
            'name' => 'media',
            'display_name' => 'Média',
            'order' => 2,
            'color' => '#3b82f6',
            'is_active' => true,
        ]);

        $this->ticket = Ticket::create([
            'title' => 'Problema com monitor',
            'description' => 'Monitor piscando.',
            'status' => TicketStatus::OPEN,
            'requester_id' => $this->requester->id,
            'category_id' => $category->id,
            'priority_id' => $priority->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_or_post_comments(): void
    {
        $this->getJson("/api/v1/tickets/{$this->ticket->id}/comments")->assertUnauthorized();
        $this->postJson("/api/v1/tickets/{$this->ticket->id}/comments", ['content' => 'Teste'])->assertUnauthorized();
    }

    public function test_requester_can_add_public_comment_to_their_ticket(): void
    {
        $response = $this->actingAs($this->requester)
            ->postJson("/api/v1/tickets/{$this->ticket->id}/comments", [
                'content' => 'Já tentei trocar o cabo HDMI e o defeito continua.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.content', 'Já tentei trocar o cabo HDMI e o defeito continua.')
            ->assertJsonPath('data.is_internal', false);

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->requester->id,
            'is_internal' => false,
        ]);

        $this->assertDatabaseHas('ticket_histories', [
            'ticket_id' => $this->ticket->id,
            'action' => 'comment_added',
        ]);
    }

    public function test_requester_cannot_add_comment_to_other_users_ticket(): void
    {
        $response = $this->actingAs($this->otherRequester)
            ->postJson("/api/v1/tickets/{$this->ticket->id}/comments", [
                'content' => 'Tentando comentar no chamado de outro usuário.',
            ]);

        $response->assertForbidden();
    }

    public function test_requester_cannot_force_internal_note(): void
    {
        $response = $this->actingAs($this->requester)
            ->postJson("/api/v1/tickets/{$this->ticket->id}/comments", [
                'content' => 'Tentativa de criar nota interna sendo solicitante.',
                'is_internal' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.is_internal', false);

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $this->ticket->id,
            'content' => 'Tentativa de criar nota interna sendo solicitante.',
            'is_internal' => false,
        ]);
    }

    public function test_agent_can_add_internal_note_to_ticket(): void
    {
        $response = $this->actingAs($this->agent)
            ->postJson("/api/v1/tickets/{$this->ticket->id}/comments", [
                'content' => 'Nota interna: suspeita de capacitor estufado na placa de vídeo.',
                'is_internal' => true,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.is_internal', true);

        $this->assertDatabaseHas('ticket_comments', [
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->agent->id,
            'is_internal' => true,
        ]);
    }

    public function test_requester_does_not_see_internal_notes_in_comments_list(): void
    {
        // Comentário público
        TicketComment::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->requester->id,
            'content' => 'Mensagem visível para todos',
            'is_internal' => false,
        ]);

        // Nota interna técnica
        TicketComment::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->agent->id,
            'content' => 'Mensagem confidencial técnica',
            'is_internal' => true,
        ]);

        $response = $this->actingAs($this->requester)
            ->getJson("/api/v1/tickets/{$this->ticket->id}/comments");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Mensagem visível para todos', $response->json('data.0.content'));
    }

    public function test_agent_sees_both_public_and_internal_comments(): void
    {
        TicketComment::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->requester->id,
            'content' => 'Mensagem visível para todos',
            'is_internal' => false,
        ]);

        TicketComment::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->agent->id,
            'content' => 'Mensagem confidencial técnica',
            'is_internal' => true,
        ]);

        $response = $this->actingAs($this->agent)
            ->getJson("/api/v1/tickets/{$this->ticket->id}/comments");

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_comment_with_attachment_uploads_file_and_creates_records(): void
    {
        $file = UploadedFile::fake()->create('evidencia_erro.png', 500, 'image/png');

        $response = $this->actingAs($this->requester)
            ->postJson("/api/v1/tickets/{$this->ticket->id}/comments", [
                'content' => 'Foto do monitor com a falha na tela.',
                'attachments' => [$file],
            ]);

        $response->assertCreated();

        $this->assertDatabaseHas('ticket_attachments', [
            'ticket_id' => $this->ticket->id,
            'original_name' => 'evidencia_erro.png',
            'mime_type' => 'image/png',
        ]);
    }

    public function test_download_attachment_serves_file(): void
    {
        $filePath = "tickets/{$this->ticket->id}/attachments/documento.pdf";
        Storage::disk('local')->put($filePath, 'conteudo de teste do arquivo');

        $attachment = TicketAttachment::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->requester->id,
            'original_name' => 'documento.pdf',
            'file_path' => $filePath,
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
        ]);

        $response = $this->actingAs($this->requester)
            ->get("/api/v1/tickets/{$this->ticket->id}/attachments/{$attachment->id}/download");

        $response->assertOk();
    }

    public function test_requester_cannot_download_attachment_from_internal_note(): void
    {
        $filePath = "tickets/{$this->ticket->id}/attachments/log_interno.txt";
        Storage::disk('local')->put($filePath, 'dados confidenciais de log');

        $internalComment = TicketComment::create([
            'ticket_id' => $this->ticket->id,
            'user_id' => $this->agent->id,
            'content' => 'Log interno anexado',
            'is_internal' => true,
        ]);

        $attachment = TicketAttachment::create([
            'ticket_id' => $this->ticket->id,
            'comment_id' => $internalComment->id,
            'user_id' => $this->agent->id,
            'original_name' => 'log_interno.txt',
            'file_path' => $filePath,
            'file_size' => 2048,
            'mime_type' => 'text/plain',
        ]);

        $response = $this->actingAs($this->requester)
            ->get("/api/v1/tickets/{$this->ticket->id}/attachments/{$attachment->id}/download");

        $response->assertForbidden();
    }
}
