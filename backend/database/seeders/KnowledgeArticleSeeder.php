<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\KnowledgeArticle;
use App\Models\User;
use Illuminate\Database\Seeder;

class KnowledgeArticleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@helpdeskpro.local')->first();
        if (! $admin) {
            return;
        }

        $catHardware = Category::where('slug', 'hardware-equipamentos')->first();
        $catVpn = Category::where('slug', 'vpn-redes')->first();
        $catEmail = Category::where('slug', 'email-comunicacao')->first();
        $catErp = Category::where('slug', 'sistemas-erp')->first();

        $articles = [
            [
                'title' => 'Como redefinir sua senha de rede corporativa e autenticação em dois fatores',
                'summary' => 'Instruções para alteração segura de credenciais do Active Directory e reconfiguração do aplicativo de autenticação (MFA).',
                'content' => "## Redefinição de Senha de Rede\n\nCaso tenha esquecido sua senha corporativa ou recebido aviso de expiração:\n\n1. Acesse o portal de autosserviço através de `https://identity.empresa.local`.\n2. Insira seu endereço de e-mail corporativo completo.\n3. Digite o código de 6 dígitos gerado pelo aplicativo autenticador no seu smartphone.\n4. Defina uma nova senha contendo no mínimo 12 caracteres, com letras maiúsculas, minúsculas, números e símbolos.\n\n> **Atenção**: Nunca compartilhe sua senha com ninguém, nem mesmo com analistas de suporte.",
                'category_id' => $catEmail?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 124,
                'helpful_count' => 38,
                'not_helpful_count' => 2,
            ],
            [
                'title' => 'Guia de conexão e resolução de problemas na VPN corporativa',
                'summary' => 'Passo a passo para conectar à rede segura da empresa em trabalho remoto (home office) e contornar erros de rota.',
                'content' => "## Conexão Segura à VPN\n\nPara acessar servidores e recursos internos fora do escritório:\n\n1. Abra o cliente corporativo instalado em seu notebook.\n2. Selecione o servidor de entrada correspondente à sua região (`vpn-sp.empresa.local`).\n3. Clique em **Conectar** e confirme o push de autenticação MFA no celular.\n\n### O que fazer se a conexão falhar?\n- Reinicie o adaptador de rede ou o roteador Wi-Fi.\n- Verifique se a sua conexão de internet residencial está estável.\n- Se o erro persistir com código `TLS handshake failed`, abra um chamado categorizado como **VPN & Redes**.",
                'category_id' => $catVpn?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 210,
                'helpful_count' => 74,
                'not_helpful_count' => 5,
            ],
            [
                'title' => 'Procedimento padrão de triagem de travamentos de hardware e tela azul',
                'summary' => 'Guia técnico para analistas de N1/N2 realizarem diagnóstico de memória RAM, integridade de SSD e dump de memória.',
                'content' => "## Triagem de Hardware N1/N2 (Uso Interno)\n\nAo receber equipamento reportando BSOD repetitivo:\n\n1. Coletar log em `C:\\Windows\\Minidump`.\n2. Executar teste de estresse e diagnóstico rápido de memória (`mdsched.exe`).\n3. Verificar saúde do SSD NVMe com utilitário de telemetria SMART.\n4. Caso confirmada falha de módulo de memória ou disco, solicitar substituição em garantia com o fabricante.",
                'category_id' => $catHardware?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => true, // Apenas equipe interna
                'views_count' => 45,
                'helpful_count' => 12,
                'not_helpful_count' => 0,
            ],
            [
                'title' => 'Limpeza de cache e resolução de lentidão no sistema ERP',
                'summary' => 'Solução rápida para telas congeladas, timeouts de consulta e lentidão pontual no ERP corporativo.',
                'content' => "## Otimização do Cliente ERP\n\nQuando o sistema de gestão demorar para carregar telas ou relatórios:\n\n1. Salve qualquer lançamento pendente e feche o aplicativo ERP.\n2. Pressione `Win + R`, digite `%temp%` e exclua os arquivos temporários da sessão.\n3. Reabra o ERP executando com permissão padrão.\n4. Se o problema ocorrer em toda a equipe do setor, pode se tratar de fila de concorrência no banco de dados.",
                'category_id' => $catErp?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 88,
                'helpful_count' => 29,
                'not_helpful_count' => 1,
            ],
        ];

        foreach ($articles as $data) {
            KnowledgeArticle::firstOrCreate(
                ['title' => $data['title']],
                $data
            );
        }
    }
}
