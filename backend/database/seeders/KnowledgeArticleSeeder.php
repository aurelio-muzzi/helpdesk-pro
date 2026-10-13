<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\KnowledgeArticle;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KnowledgeArticleSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@helpdeskpro.local')->first()
            ?? User::first();

        if (! $admin) {
            return;
        }

        $catHardware = Category::where('name', 'like', '%Hardware%')->first();
        $catVpn = Category::where('name', 'like', '%VPN%')->orWhere('name', 'like', '%Conexão%')->first();
        $catEmail = Category::where('name', 'like', '%E-mail%')->first();
        $catErp = Category::where('name', 'like', '%ERP%')->first();
        $catAcessos = Category::where('name', 'like', '%Acessos%')->first();
        $catDuvidas = Category::where('name', 'like', '%Dúvidas%')->first();

        $articles = [
            [
                'title' => 'Como redefinir sua senha corporativa e autenticação MFA',
                'summary' => 'Instruções para alteração segura de credenciais do Active Directory e reconfiguração do aplicativo autenticador no celular.',
                'content' => "## Redefinição de Senha e MFA\n\nCaso tenha esquecido sua senha corporativa ou recebido aviso de expiração:\n\n1. Acesse o portal de autosserviço através de `https://identity.empresa.local`.\n2. Insira seu endereço de e-mail corporativo completo.\n3. Digite o código de 6 dígitos gerado pelo aplicativo Microsoft Authenticator ou Google Authenticator.\n4. Defina uma nova senha contendo no mínimo **12 caracteres** (letras maiúsculas, minúsculas, números e símbolos).\n\n> **⚠️ Política de Segurança:** Nunca compartilhe sua senha corporativa com terceiros, nem mesmo com analistas de suporte.",
                'category_id' => $catAcessos?->id ?? $catEmail?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 342,
                'helpful_count' => 89,
                'not_helpful_count' => 3,
            ],
            [
                'title' => 'Guia de conexão e resolução de problemas na VPN corporativa',
                'summary' => 'Passo a passo para conectar à rede segura da empresa em trabalho remoto (Home Office) e contornar erros de rota ou timeout.',
                'content' => "## Conexão Segura à VPN Corporativa\n\nPara acessar servidores de arquivos e sistemas restritos fora do escritório:\n\n1. Abra o aplicativo **OpenVPN Connect** ou **FortiClient** em seu notebook.\n2. Selecione o perfil corporativo `vpn.helpdeskpro.local`.\n3. Clique em **Conectar** e confirme o push de autenticação MFA no celular.\n\n### 🔧 O que fazer se a conexão falhar?\n- Reinicie o seu modem/roteador Wi-Fi residencial.\n- Verifique se a hora do seu computador está sincronizada automaticamente.\n- Se o erro persistir com a mensagem `TLS handshake timeout`, abra um chamado categorizado como **Falha de Conexão ou VPN**.",
                'category_id' => $catVpn?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 520,
                'helpful_count' => 142,
                'not_helpful_count' => 8,
            ],
            [
                'title' => 'Procedimento padrão de triagem de travamentos de hardware e tela azul (BSOD)',
                'summary' => 'Guia técnico para analistas de N1/N2 realizarem diagnóstico de memória RAM, integridade de SSD e análise de dump de memória.',
                'content' => "## Triagem de Hardware N1/N2 (Documento Interno)\n\nAo receber equipamento reportando desligamento súbito ou tela azul repetitiva:\n\n1. Coletar o relatório em `C:\\Windows\\Minidump` com a ferramenta **BlueScreenView**.\n2. Executar o teste rápido de integridade de memória via terminal: `mdsched.exe`.\n3. Inspecionar o estado de saúde do SSD NVMe com o utilitário **CrystalDiskInfo** (verificar percentual de vida útil e setores realocados).\n4. Se comprovada avaria física, registrar o RMA diretamente no portal corporativo do fabricante (Dell ProSupport / Lenovo Premier).",
                'category_id' => $catHardware?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => true, // Restrito a equipe técnica
                'views_count' => 88,
                'helpful_count' => 34,
                'not_helpful_count' => 1,
            ],
            [
                'title' => 'Limpeza de cache e resolução de lentidão no sistema ERP',
                'summary' => 'Como redefinir caches locais de sessão e arquivos temporários para sanar travamentos no módulo de faturamento.',
                'content' => "## Limpeza de Sessão do ERP Corporativo\n\nCaso o sistema ERP apresente erro de tela congelada ou inconsistência de saldo de estoque:\n\n1. Feche completamente todas as janelas do ERP.\n2. Pressione as teclas `Win + R`, digite `%temp%` e pressione **Enter**.\n3. Exclua os arquivos temporários criados nas últimas 24 horas.\n4. Reabra o inicializador do sistema utilizando o atalho da área de trabalho.\n5. Se o módulo contábil acusar inconsistência de lock de tabela, solicite intervenção da equipe **Suporte N2 - Sistemas & ERP**.",
                'category_id' => $catErp?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 415,
                'helpful_count' => 110,
                'not_helpful_count' => 6,
            ],
            [
                'title' => 'Como configurar assinatura de e-mail e regras de mensagens no Outlook',
                'summary' => 'Tutorial passo a passo para padronizar a assinatura corporativa e criar filtros automáticos para organizar sua caixa de entrada.',
                'content' => "## Assinatura Corporativa e Organização no Outlook\n\n### 1. Aplicando o Template de Assinatura\n1. Acesse **Arquivo > Opções > Email > Assinaturas**.\n2. Cole o template HTML fornecido pela equipe de Comunicação Interna.\n3. Preencha seus dados: Nome, Cargo, Departamento e Ramal telefônico.\n\n### 2. Criando Pastas e Regras de Mensagens\n- Clique com botão direito na pasta Raiz e selecione **Nova Pasta**.\n- Crie regras automáticas para mover notificações automáticas ou relatórios para suas respectivas pastas, mantendo a Caixa de Entrada limpa.",
                'category_id' => $catEmail?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 260,
                'helpful_count' => 78,
                'not_helpful_count' => 2,
            ],
            [
                'title' => 'Procedimento de Backup e Restauração de Banco de Dados de Homologação',
                'summary' => 'Roteiro de execução para analistas de Infraestrutura realizarem dump e restore periódico das bases de staging.',
                'content' => "## Procedimento Operacional de Backup (Uso Interno)\n\n### Comandos de Dump Automatizado:\n```bash\nmysqldump -u root -p --single-transaction --routines helpdesk_staging > /var/backups/helpdesk_$(date +%F).sql\ngzip -9 /var/backups/helpdesk_$(date +%F).sql\n```\n\n### Verificação de Integridade:\n- Confirmar o hash SHA256 do arquivo gerado.\n- Transferir cópia imutável para o bucket de retenção a frio no Amazon S3.",
                'category_id' => $catAcessos?->id ?? $catHardware?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => true,
                'views_count' => 64,
                'helpful_count' => 21,
                'not_helpful_count' => 0,
            ],
            [
                'title' => 'Boas práticas de segurança contra ataques de Phishing e Engenharia Social',
                'summary' => 'Orientações vitais para identificar e-mails maliciosos, anexos suspeitos e links fraudulentos.',
                'content' => "## Cartilha de Segurança da Informação\n\n- **Verifique o remetente:** Observe o domínio exato de quem enviou a mensagem (ex: `@banco-falso.com` ao invés de `@banco.com.br`).\n- **Cuidado com urgência excessiva:** Mensagens com ameaças de cancelamento de conta imediato são técnicas clássicas de phishing.\n- **Nunca clique em links sem inspecionar:** Passe o cursor do mouse sobre o link para visualizar o endereço real antes de clicar.\n- **Reporte imediatamente:** Se desconfiar de uma mensagem, encaminhe para `seguranca@helpdeskpro.local` ou abra um chamado.",
                'category_id' => $catDuvidas?->id ?? $catEmail?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 680,
                'helpful_count' => 215,
                'not_helpful_count' => 4,
            ],
            [
                'title' => 'Como solicitar e configurar ramal telefônico corporativo e Softphone',
                'summary' => 'Instruções para requisição de ramal SIP e configuração do aplicativo MicroSIP ou 3CX em seu computador.',
                'content' => "## Telefonia Corporativa e Ramal SIP\n\nPara colaboradores que realizam atendimento telefônico ou reuniões externas:\n\n1. Abra uma solicitação categorizada como **Telefonia & VoIP** com aprovação do gestor do departamento.\n2. Após liberação das credenciais, baixe o softphone homologado através do portal corporativo.\n3. Insira o servidor SIP: `sip.helpdeskpro.local:5060`, seu número de ramal e senha de autenticação.\n4. Realize a chamada de teste para o ramal `*99` para testar microfone e fone de ouvido.",
                'category_id' => $catDuvidas?->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_internal' => false,
                'views_count' => 195,
                'helpful_count' => 52,
                'not_helpful_count' => 1,
            ],
        ];

        foreach ($articles as $art) {
            $slug = Str::slug($art['title']);

            KnowledgeArticle::updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $art['title'],
                    'slug' => $slug,
                    'summary' => $art['summary'],
                    'content' => $art['content'],
                    'category_id' => $art['category_id'],
                    'author_id' => $art['author_id'],
                    'is_published' => $art['is_published'],
                    'is_internal' => $art['is_internal'],
                    'views_count' => $art['views_count'],
                    'helpful_count' => $art['helpful_count'],
                    'not_helpful_count' => $art['not_helpful_count'],
                ]
            );
        }
    }
}
