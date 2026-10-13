<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Department;
use App\Models\KnowledgeArticle;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KnowledgeArticleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $agent;

    private User $requester;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $adminRole = Role::where('name', UserRole::ADMIN->value)->firstOrFail();
        $agentRole = Role::where('name', UserRole::AGENT->value)->firstOrFail();
        $requesterRole = Role::where('name', UserRole::REQUESTER->value)->firstOrFail();

        $this->admin = User::factory()->create(['name' => 'Admin KB', 'role_id' => $adminRole->id]);
        $this->agent = User::factory()->create(['name' => 'Agente KB', 'role_id' => $agentRole->id]);
        $this->requester = User::factory()->create(['name' => 'Solicitante KB', 'role_id' => $requesterRole->id]);

        $dept = Department::create(['name' => 'TI', 'is_active' => true]);
        $this->category = Category::create([
            'department_id' => $dept->id,
            'name' => 'Redes',
            'slug' => 'redes',
            'is_active' => true,
        ]);
    }

    public function test_requires_authentication_for_articles(): void
    {
        $this->getJson('/api/v1/articles')->assertUnauthorized();
    }

    public function test_requester_can_only_view_published_and_public_articles(): void
    {
        KnowledgeArticle::create([
            'title' => 'Artigo Público de Redes',
            'content' => 'Conteúdo público acessível a todos.',
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'is_published' => true,
            'is_internal' => false,
        ]);

        $internalArticle = KnowledgeArticle::create([
            'title' => 'Procedimento Interno Confidencial',
            'content' => 'Conteúdo restrito apenas para analistas de suporte.',
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'is_published' => true,
            'is_internal' => true,
        ]);

        Sanctum::actingAs($this->requester);

        // Listagem
        $response = $this->getJson('/api/v1/articles');
        $response->assertOk();
        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertEquals('Artigo Público de Redes', $data[0]['title']);

        // Tentativa de ver artigo interno diretamente
        $this->getJson("/api/v1/articles/{$internalArticle->id}")->assertNotFound();
    }

    public function test_agent_and_admin_can_view_internal_and_draft_articles(): void
    {
        $article = KnowledgeArticle::create([
            'title' => 'Procedimento de Senhas N1',
            'content' => 'Como resetar senhas via terminal interno.',
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'is_published' => true,
            'is_internal' => true,
        ]);

        Sanctum::actingAs($this->agent);

        $response = $this->getJson("/api/v1/articles/{$article->id}");
        $response->assertOk();
        $this->assertEquals('Procedimento de Senhas N1', $response->json('data.title'));

        // Verifica que visualizações foram incrementadas
        $this->assertEquals(1, $article->fresh()->views_count);
    }

    public function test_agent_can_create_and_update_knowledge_article(): void
    {
        Sanctum::actingAs($this->agent);

        $payload = [
            'title' => 'Novo Artigo sobre Impressoras',
            'summary' => 'Solução para fila de impressão travada',
            'content' => 'Reiniciar o spooler de impressão do Windows.',
            'category_id' => $this->category->id,
            'is_published' => true,
            'is_internal' => false,
        ];

        $response = $this->postJson('/api/v1/articles', $payload);
        $response->assertCreated();
        $this->assertDatabaseHas('knowledge_articles', ['title' => 'Novo Artigo sobre Impressoras']);

        $articleId = $response->json('data.id');

        // Atualização
        $updateResponse = $this->putJson("/api/v1/articles/{$articleId}", [
            'title' => 'Novo Artigo sobre Impressoras Atualizado',
        ]);
        $updateResponse->assertOk();
        $this->assertEquals('Novo Artigo sobre Impressoras Atualizado', $updateResponse->json('data.title'));
    }

    public function test_requester_cannot_create_or_delete_articles(): void
    {
        Sanctum::actingAs($this->requester);

        $this->postJson('/api/v1/articles', [
            'title' => 'Tentativa de Artigo por Solicitante',
            'content' => 'Conteúdo',
        ])->assertForbidden();

        $article = KnowledgeArticle::create([
            'title' => 'Artigo Criado por Admin',
            'content' => 'Conteúdo',
            'author_id' => $this->admin->id,
        ]);

        $this->deleteJson("/api/v1/articles/{$article->id}")->assertForbidden();
    }

    public function test_user_can_submit_helpful_feedback(): void
    {
        $article = KnowledgeArticle::create([
            'title' => 'Artigo para Feedback',
            'content' => 'Conteúdo de teste',
            'author_id' => $this->admin->id,
            'is_published' => true,
            'is_internal' => false,
        ]);

        Sanctum::actingAs($this->requester);

        $responseHelpful = $this->postJson("/api/v1/articles/{$article->id}/feedback", [
            'is_helpful' => true,
        ]);
        $responseHelpful->assertOk();
        $this->assertEquals(1, $responseHelpful->json('helpful_count'));
        $this->assertEquals(0, $responseHelpful->json('not_helpful_count'));

        $responseNotHelpful = $this->postJson("/api/v1/articles/{$article->id}/feedback", [
            'is_helpful' => false,
        ]);
        $responseNotHelpful->assertOk();
        $this->assertEquals(1, $responseNotHelpful->json('helpful_count'));
        $this->assertEquals(1, $responseNotHelpful->json('not_helpful_count'));
    }

    public function test_article_suggestions_returns_relevant_articles(): void
    {
        KnowledgeArticle::create([
            'title' => 'Como configurar cliente VPN OpenVPN',
            'summary' => 'Resumo VPN',
            'content' => 'Passo a passo da VPN corporativa',
            'author_id' => $this->admin->id,
            'is_published' => true,
            'is_internal' => false,
        ]);

        KnowledgeArticle::create([
            'title' => 'Configuração de Monitor Externo HDMI',
            'summary' => 'Resumo Monitor',
            'content' => 'Passo a passo',
            'author_id' => $this->admin->id,
            'is_published' => true,
            'is_internal' => false,
        ]);

        Sanctum::actingAs($this->requester);

        $response = $this->getJson('/api/v1/articles/suggestions?q=VPN');
        $response->assertOk();

        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Como configurar cliente VPN OpenVPN', $data[0]['title']);
    }
}
