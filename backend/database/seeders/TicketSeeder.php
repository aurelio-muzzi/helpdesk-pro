<?php

namespace Database\Seeders;

use App\Enums\PriorityLevel;
use App\Enums\TicketStatus;
use App\Models\Category;
use App\Models\Department;
use App\Models\Priority;
use App\Models\SlaPolicy;
use App\Models\Team;
use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\TicketHistory;
use App\Models\TicketSatisfaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Obter Usuários
        $admin = User::where('email', 'admin@helpdeskpro.local')->first();
        $manager = User::where('email', 'manager@helpdeskpro.local')->first();

        // Atendentes
        $agentBeatriz = User::whereIn('email', ['agente@helpdeskpro.local', 'agent@helpdeskpro.local'])->first();
        $agentMariana = User::where('email', 'mariana.souza@helpdeskpro.local')->first() ?? $agentBeatriz;
        $agentLucas = User::where('email', 'lucas.mendes@helpdeskpro.local')->first() ?? $agentBeatriz;
        $agentRafael = User::where('email', 'rafael.nogueira@helpdeskpro.local')->first() ?? $agentBeatriz;
        $agentCarlos = User::where('email', 'carlos.eduardo@helpdeskpro.local')->first() ?? $agentBeatriz;

        // Solicitantes
        $reqLucas = User::whereIn('email', ['solicitante@helpdeskpro.local', 'requester@helpdeskpro.local'])->first();
        $reqJuliana = User::where('email', 'juliana.silva@helpdeskpro.local')->first() ?? $reqLucas;
        $reqRodrigo = User::where('email', 'rodrigo.alves@helpdeskpro.local')->first() ?? $reqLucas;
        $reqCamila = User::where('email', 'camila.santos@helpdeskpro.local')->first() ?? $reqLucas;
        $reqFernando = User::where('email', 'fernando.castro@helpdeskpro.local')->first() ?? $reqLucas;
        $reqPatricia = User::where('email', 'patricia.ramos@helpdeskpro.local')->first() ?? $reqLucas;

        // 2. Departamentos e Equipes
        $deptIT = Department::where('name', 'like', '%Tecnologia%')->first();
        $deptInfra = Department::where('name', 'like', '%Infraestrutura%')->first();
        $deptFacilities = Department::where('name', 'like', '%Operações%')->first();
        $deptRH = Department::where('name', 'like', '%Recursos Humanos%')->first();
        $deptFin = Department::where('name', 'like', '%Financeiro%')->first();
        $deptCom = Department::where('name', 'like', '%Comercial%')->first();

        $teamL1 = Team::where('name', 'like', '%L1%')->first();
        $teamL2 = Team::where('name', 'like', '%L2%')->first();
        $teamInfra = Team::where('name', 'like', '%Infraestrutura%')->first();
        $teamSec = Team::where('name', 'like', '%Segurança%')->first();

        // 3. Categorias
        $catHardware = Category::where('name', 'like', '%Hardware%')->first();
        $catAcessos = Category::where('name', 'like', '%Acessos%')->first();
        $catVpn = Category::where('name', 'like', '%VPN%')->orWhere('name', 'like', '%Conexão%')->first();
        $catErp = Category::where('name', 'like', '%ERP%')->first();
        $catEmail = Category::where('name', 'like', '%E-mail%')->first();
        $catEquip = Category::where('name', 'like', '%Equipamento%')->first();
        $catVoip = Category::where('name', 'like', '%Telefonia%')->first();
        $catDuvidas = Category::where('name', 'like', '%Dúvidas%')->first();

        // 4. Prioridades
        $prioLow = Priority::where('name', PriorityLevel::LOW->value)->orWhere('display_name', 'Baixa')->first();
        $prioMed = Priority::where('name', PriorityLevel::MEDIUM->value)->orWhere('display_name', 'Média')->first();
        $prioHigh = Priority::where('name', PriorityLevel::HIGH->value)->orWhere('display_name', 'Alta')->first();
        $prioUrg = Priority::where('name', PriorityLevel::URGENT->value)->orWhere('display_name', 'Urgente')->first();

        // 5. Políticas de SLA
        $slaUrg = SlaPolicy::where('priority_id', $prioUrg?->id)->first();
        $slaHigh = SlaPolicy::where('priority_id', $prioHigh?->id)->first();
        $slaMed = SlaPolicy::where('priority_id', $prioMed?->id)->first();
        $slaLow = SlaPolicy::where('priority_id', $prioLow?->id)->first();

        // Fallbacks de segurança
        $defaultCategory = $catHardware ?? Category::first();
        $defaultPriority = $prioMed ?? Priority::first();
        $defaultRequester = $reqLucas ?? User::first();
        $defaultAgent = $agentBeatriz ?? User::first();

        // Definição da Carga Realista de Chamados
        $ticketsData = [
            // --- CHAMADOS ABERTOS / EM TRIAGEM (OPEN) ---
            [
                'code' => 'HD-2026-00001',
                'title' => 'Impressora térmica de etiquetas de expedição travada com luz vermelha',
                'description' => 'A impressora Zebra ZT230 da expedição parou de imprimir após atolamento de rolo. Os despachos de mercadorias das notas fiscais do turno da tarde estão aguardando.',
                'status' => TicketStatus::OPEN,
                'requester_id' => $reqFernando->id,
                'assigned_to' => null,
                'team_id' => $teamL1?->id,
                'department_id' => $deptFacilities?->id ?? $deptIT?->id,
                'category_id' => $catHardware?->id ?? $defaultCategory->id,
                'priority_id' => $prioHigh?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaHigh?->id,
                'sla_status' => 'warning',
                'created_at' => now()->subMinutes(45),
                'first_response_due_at' => now()->addMinutes(15),
                'resolution_due_at' => now()->addHours(7),
                'comments' => [
                    [
                        'user_id' => $reqFernando->id,
                        'content' => 'Já tentamos desligar e religar da tomada e trocar a bobina de etiquetas, mas a luz vermelha continua piscando.',
                        'is_internal' => false,
                        'created_at' => now()->subMinutes(40),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado pelo solicitante via Portal Web.', 'created_at' => now()->subMinutes(45)],
                ],
            ],
            [
                'code' => 'HD-2026-00002',
                'title' => 'Instabilidade e lentidão ao abrir relatórios no ERP Protheus',
                'description' => 'Ao executar o relatório de fechamento de conciliação bancária (FINR150), o sistema apresenta timeout após 5 minutos de processamento.',
                'status' => TicketStatus::OPEN,
                'requester_id' => $reqRodrigo->id,
                'assigned_to' => null,
                'team_id' => $teamL2?->id,
                'department_id' => $deptFin?->id ?? $deptIT?->id,
                'category_id' => $catErp?->id ?? $defaultCategory->id,
                'priority_id' => $prioHigh?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaHigh?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subMinutes(25),
                'first_response_due_at' => now()->addMinutes(35),
                'resolution_due_at' => now()->addHours(7),
                'comments' => [],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado aberto pelo setor Financeiro.', 'created_at' => now()->subMinutes(25)],
                ],
            ],
            [
                'code' => 'HD-2026-00003',
                'title' => 'Solicitação de mouse ergonômico e suporte de notebook para colaboradora',
                'description' => 'Conforme recomendação médica do laudo de ergonomia da CIPA, solicitamos fornecimento de mouse vertical ergonômico e suporte regulável.',
                'status' => TicketStatus::OPEN,
                'requester_id' => $reqJuliana->id,
                'assigned_to' => null,
                'team_id' => $teamL1?->id,
                'department_id' => $deptRH?->id ?? $deptFacilities?->id,
                'category_id' => $catEquip?->id ?? $defaultCategory->id,
                'priority_id' => $prioLow?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaLow?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subHours(2),
                'first_response_due_at' => now()->addHours(6),
                'resolution_due_at' => now()->addDays(2),
                'comments' => [],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Solicitação de equipamento cadastrada pelo RH.', 'created_at' => now()->subHours(2)],
                ],
            ],
            [
                'code' => 'HD-2026-00004',
                'title' => 'Portal de Vendas exibindo erro 502 Bad Gateway no ambiente de produção',
                'description' => 'A equipe comercial externa não está conseguindo enviar pedidos de vendas pelo aplicativo web. O proxy reverso Nginx está retornando 502.',
                'status' => TicketStatus::OPEN,
                'requester_id' => $reqCamila->id,
                'assigned_to' => null,
                'team_id' => $teamInfra?->id,
                'department_id' => $deptCom?->id ?? $deptIT?->id,
                'category_id' => $catVpn?->id ?? $defaultCategory->id,
                'priority_id' => $prioUrg?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaUrg?->id,
                'sla_status' => 'warning',
                'created_at' => now()->subMinutes(12),
                'first_response_due_at' => now()->addMinutes(3),
                'resolution_due_at' => now()->addMinutes(108),
                'comments' => [],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Incidente crítico reportado pela Gerência Comercial.', 'created_at' => now()->subMinutes(12)],
                ],
            ],

            // --- CHAMADOS EM ANDAMENTO (IN_PROGRESS) ---
            [
                'code' => 'HD-2026-00005',
                'title' => 'Notebook não liga e acende LED de erro de memória (3x âmbar)',
                'description' => 'O computador Dell Latitude 3420 parou de ligar nesta manhã. O cooler gira por 2 segundos e desliga com código de falha no LED frontal.',
                'status' => TicketStatus::IN_PROGRESS,
                'requester_id' => $reqLucas->id,
                'assigned_to' => $agentMariana->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptIT?->id,
                'category_id' => $catHardware?->id ?? $defaultCategory->id,
                'priority_id' => $prioHigh?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaHigh?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subHours(3),
                'first_response_at' => now()->subHours(2)->subMinutes(40),
                'first_response_due_at' => now()->subHours(2),
                'resolution_due_at' => now()->addHours(5),
                'comments' => [
                    [
                        'user_id' => $agentMariana->id,
                        'content' => 'Olá Lucas! Já recebi o seu chamado. Estou me deslocando até a sua mesa para recolher o equipamento para teste na bancada do Service Desk.',
                        'is_internal' => false,
                        'created_at' => now()->subHours(2)->subMinutes(40),
                    ],
                    [
                        'user_id' => $agentMariana->id,
                        'content' => 'NOTA INTERNA: Equipamento aberto na bancada. Módulo DDR4 de 16GB com oxidação leve nos pinos. Efetuada limpeza com álcool isopropílico. Realizando teste de estresse com MemTest86.',
                        'is_internal' => true,
                        'created_at' => now()->subHours(1)->subMinutes(15),
                    ],
                    [
                        'user_id' => $reqLucas->id,
                        'content' => 'Obrigado Mariana! Se precisar, estou disponível no ramal 4022.',
                        'is_internal' => false,
                        'created_at' => now()->subHours(1),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subHours(3)],
                    ['action' => 'assigned', 'field_name' => 'assigned_to', 'new_value' => $agentMariana->name, 'comment' => 'Atribuído para Mariana Souza.', 'created_at' => now()->subHours(2)->subMinutes(45)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'in_progress', 'comment' => 'Iniciado atendimento técnico.', 'created_at' => now()->subHours(2)->subMinutes(40)],
                ],
            ],
            [
                'code' => 'HD-2026-00006',
                'title' => 'Quedas repetitivas de túnel IPsec entre Filial Curitiba e Matriz',
                'description' => 'A filial Curitiba está reportando perda de pacotes e desconexões a cada 20 minutos com a rede corporativa da Matriz.',
                'status' => TicketStatus::IN_PROGRESS,
                'requester_id' => $reqFernando->id,
                'assigned_to' => $agentLucas->id,
                'team_id' => $teamInfra?->id,
                'department_id' => $deptInfra?->id ?? $deptIT?->id,
                'category_id' => $catVpn?->id ?? $defaultCategory->id,
                'priority_id' => $prioHigh?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaHigh?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subHours(2),
                'first_response_at' => now()->subHours(1)->subMinutes(45),
                'first_response_due_at' => now()->subHours(1),
                'resolution_due_at' => now()->addHours(6),
                'comments' => [
                    [
                        'user_id' => $agentLucas->id,
                        'content' => 'NOTA INTERNA: Analisando telemetria do firewall FortiGate 100F. Identificado DPD (Dead Peer Detection) desarmando por oscilação de latência do link secundário da operadora Vivo.',
                        'is_internal' => true,
                        'created_at' => now()->subHours(1)->subMinutes(30),
                    ],
                    [
                        'user_id' => $agentLucas->id,
                        'content' => 'Prezado Fernando, identificamos uma instabilidade no link de fibra da operadora local de Curitiba. Forçamos o tráfego pelo link redundante e estamos monitorando a estabilidade.',
                        'is_internal' => false,
                        'created_at' => now()->subHours(1),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subHours(2)],
                    ['action' => 'assigned', 'field_name' => 'assigned_to', 'new_value' => $agentLucas->name, 'comment' => 'Escalonado para N2 Infraestrutura.', 'created_at' => now()->subHours(1)->subMinutes(50)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'in_progress', 'comment' => 'Análise de telemetria iniciada.', 'created_at' => now()->subHours(1)->subMinutes(45)],
                ],
            ],
            [
                'code' => 'HD-2026-00007',
                'title' => 'Liberação de permissão especial na pasta confidencial do Jurídico no File Server',
                'description' => 'Necessário conceder acesso de Leitura/Gravação na pasta \\\\fs01\\juridico\\auditorias-2026 para a auditora externa contratada.',
                'status' => TicketStatus::IN_PROGRESS,
                'requester_id' => $reqPatricia->id,
                'assigned_to' => $agentCarlos->id,
                'team_id' => $teamSec?->id ?? $teamL1?->id,
                'department_id' => $deptIT?->id,
                'category_id' => $catAcessos?->id ?? $defaultCategory->id,
                'priority_id' => $prioMed?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaMed?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subHours(4),
                'first_response_at' => now()->subHours(3)->subMinutes(20),
                'first_response_due_at' => now(),
                'resolution_due_at' => now()->addHours(20),
                'comments' => [
                    [
                        'user_id' => $agentCarlos->id,
                        'content' => 'Olá Patricia, o chamado está em análise. Para pastas de conformidade jurídica, precisamos do termo de aprovação formal assinado pelo DPO.',
                        'is_internal' => false,
                        'created_at' => now()->subHours(3)->subMinutes(20),
                    ],
                    [
                        'user_id' => $reqPatricia->id,
                        'content' => 'Anexei o documento assinado digitalmente pelo DPO nesta solicitação.',
                        'is_internal' => false,
                        'created_at' => now()->subHours(2),
                    ],
                    [
                        'user_id' => $agentCarlos->id,
                        'content' => 'NOTA INTERNA: Termo DPO conferido e validado com sucesso. Aplicando grupo de segurança G_FS_JURIDICO_AUDIT no Active Directory.',
                        'is_internal' => true,
                        'created_at' => now()->subMinutes(40),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado aberto pelo setor Jurídico.', 'created_at' => now()->subHours(4)],
                    ['action' => 'assigned', 'field_name' => 'assigned_to', 'new_value' => $agentCarlos->name, 'comment' => 'Atribuído a Carlos Eduardo.', 'created_at' => now()->subHours(3)->subMinutes(30)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'in_progress', 'comment' => 'Em validação de conformidade.', 'created_at' => now()->subHours(3)->subMinutes(20)],
                ],
            ],
            [
                'code' => 'HD-2026-00008',
                'title' => 'Lentidão nas consultas de estoque e inventário do banco de dados MySQL',
                'description' => 'A query de consolidação de estoque da virada de turno está demorando mais de 45 segundos e bloqueando transações concorrentes.',
                'status' => TicketStatus::IN_PROGRESS,
                'requester_id' => $admin->id,
                'assigned_to' => $agentRafael->id,
                'team_id' => $teamL2?->id,
                'department_id' => $deptIT?->id,
                'category_id' => $catErp?->id ?? $defaultCategory->id,
                'priority_id' => $prioUrg?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaUrg?->id,
                'sla_status' => 'breached', // Demonstração de SLA estourado para KPIs
                'created_at' => now()->subHours(3),
                'first_response_at' => now()->subHours(2)->subMinutes(30),
                'first_response_due_at' => now()->subHours(2)->subMinutes(45), // Breached
                'resolution_due_at' => now()->subHours(1), // Breached
                'comments' => [
                    [
                        'user_id' => $agentRafael->id,
                        'content' => 'NOTA INTERNA: Executado EXPLAIN na query. Detectado Full Table Scan na tabela `inventory_items` por ausência de índice composto em (warehouse_id, status). Criando migration com índice concorrente.',
                        'is_internal' => true,
                        'created_at' => now()->subMinutes(50),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Incidente de banco de dados aberto.', 'created_at' => now()->subHours(3)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'open', 'new_value' => 'in_progress', 'comment' => 'Rafael Nogueira assumiu investigação técnica.', 'created_at' => now()->subHours(2)->subMinutes(30)],
                ],
            ],

            // --- CHAMADOS PENDENTES (PENDING) ---
            [
                'code' => 'HD-2026-00009',
                'title' => 'Substituição de monitor secundário que apresenta linhas verticais verdes',
                'description' => 'O monitor Dell 24 polegadas do setor comercial começou a exibir linhas intermitentes na parte superior da tela.',
                'status' => TicketStatus::PENDING,
                'requester_id' => $reqCamila->id,
                'assigned_to' => $agentBeatriz->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptIT?->id,
                'category_id' => $catHardware?->id ?? $defaultCategory->id,
                'priority_id' => $prioMed?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaMed?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(1),
                'first_response_at' => now()->subDays(1)->addMinutes(30),
                'first_response_due_at' => now()->subDays(1)->addHours(4),
                'resolution_due_at' => now()->addHours(12),
                'comments' => [
                    [
                        'user_id' => $agentBeatriz->id,
                        'content' => 'Olá Camila! Para acionarmos a troca junto ao almoxarifado, por favor envie uma foto da etiqueta de patrimônio (número de série) e da tela ligada.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(1)->addMinutes(30),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subDays(1)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'in_progress', 'new_value' => 'pending', 'comment' => 'Pausado aguardando envio de evidências fotográficas pelo solicitante.', 'created_at' => now()->subDays(1)->addMinutes(35)],
                ],
            ],
            [
                'code' => 'HD-2026-00010',
                'title' => 'Aquisição de licença adicional do Power BI Pro para Controladoria',
                'description' => 'Solicito atribuição de licença do Microsoft Power BI Pro para a nova analista de BI recém-admitida.',
                'status' => TicketStatus::PENDING,
                'requester_id' => $reqRodrigo->id,
                'assigned_to' => $agentMariana->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptFin?->id ?? $deptIT?->id,
                'category_id' => $catAcessos?->id ?? $defaultCategory->id,
                'priority_id' => $prioMed?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaMed?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(2),
                'first_response_at' => now()->subDays(2)->addMinutes(45),
                'first_response_due_at' => now()->subDays(2)->addHours(4),
                'resolution_due_at' => now()->addHours(16),
                'comments' => [
                    [
                        'user_id' => $agentMariana->id,
                        'content' => 'Solicitação encaminhada para aprovação de centro de custos do gestor financeiro antes da compra da licença no portal da Microsoft.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(2)->addMinutes(45),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado cadastrado.', 'created_at' => now()->subDays(2)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'in_progress', 'new_value' => 'pending', 'comment' => 'Aguardando aprovação orçamentária.', 'created_at' => now()->subDays(2)->addHours(1)],
                ],
            ],

            // --- CHAMADOS RESOLVIDOS (RESOLVED) ---
            [
                'code' => 'HD-2026-00011',
                'title' => 'Configuração de alias comercial@helpdeskpro.local e assinatura corporativa',
                'description' => 'Necessário vincular o alias comercial e padronizar o layout HTML da assinatura de e-mail institucional.',
                'status' => TicketStatus::RESOLVED,
                'requester_id' => $reqCamila->id,
                'assigned_to' => $agentBeatriz->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptIT?->id,
                'category_id' => $catEmail?->id ?? $defaultCategory->id,
                'priority_id' => $prioLow?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaLow?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(3),
                'first_response_at' => now()->subDays(3)->addMinutes(20),
                'first_response_due_at' => now()->subDays(3)->addHours(8),
                'resolved_at' => now()->subDays(1),
                'resolution_due_at' => now()->subDays(1)->addHours(24),
                'satisfaction' => [
                    'rating' => 5,
                    'comment' => 'Atendimento excelente e super rápido! O alias e a nova assinatura já estão funcionando perfeitamente.',
                ],
                'comments' => [
                    [
                        'user_id' => $agentBeatriz->id,
                        'content' => 'O alias comercial@ foi configurado na caixa de correio e o template HTML foi aplicado no seu perfil do Outlook.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(1),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado aberto.', 'created_at' => now()->subDays(3)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'in_progress', 'new_value' => 'resolved', 'comment' => 'Concluído e enviado para validação.', 'created_at' => now()->subDays(1)],
                ],
            ],
            [
                'code' => 'HD-2026-00012',
                'title' => 'Liberação de porta 8443 no firewall para homologação de webhook de pagamentos',
                'description' => 'A equipe de desenvolvimento necessita de liberação de tráfego de entrada na porta 8443 para os IPs do gateway de pagamentos.',
                'status' => TicketStatus::RESOLVED,
                'requester_id' => $admin->id,
                'assigned_to' => $agentLucas->id,
                'team_id' => $teamInfra?->id,
                'department_id' => $deptInfra?->id ?? $deptIT?->id,
                'category_id' => $catVpn?->id ?? $defaultCategory->id,
                'priority_id' => $prioHigh?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaHigh?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(2),
                'first_response_at' => now()->subDays(2)->addMinutes(15),
                'first_response_due_at' => now()->subDays(2)->addHours(1),
                'resolved_at' => now()->subHours(6),
                'resolution_due_at' => now()->subDays(1),
                'satisfaction' => [
                    'rating' => 5,
                    'comment' => 'Regra criada com precisão e tráfego testado via telnet com sucesso imediato.',
                ],
                'comments' => [
                    [
                        'user_id' => $agentLucas->id,
                        'content' => 'NOTA INTERNA: Regra de DNAT criada no FortiGate direcionando para o servidor de staging porta 8443 com restrição aos blocos CIDR autorizados.',
                        'is_internal' => true,
                        'created_at' => now()->subHours(6)->subMinutes(10),
                    ],
                    [
                        'user_id' => $agentLucas->id,
                        'content' => 'Regra aplicada e testada no firewall corporativo. O webhook já está recebendo as notificações com status 200 OK.',
                        'is_internal' => false,
                        'created_at' => now()->subHours(6),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado criado.', 'created_at' => now()->subDays(2)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'in_progress', 'new_value' => 'resolved', 'comment' => 'Regra homologada.', 'created_at' => now()->subHours(6)],
                ],
            ],
            [
                'code' => 'HD-2026-00013',
                'title' => 'Reset de credenciais e reconfiguração de aplicativo MFA para analista contábil',
                'description' => 'A colaboradora trocou de aparelho celular e perdeu o vínculo com o Microsoft Authenticator, impedindo o login no ERP.',
                'status' => TicketStatus::RESOLVED,
                'requester_id' => $reqRodrigo->id,
                'assigned_to' => $agentMariana->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptFin?->id ?? $deptIT?->id,
                'category_id' => $catAcessos?->id ?? $defaultCategory->id,
                'priority_id' => $prioMed?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaMed?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(4),
                'first_response_at' => now()->subDays(4)->addMinutes(18),
                'first_response_due_at' => now()->subDays(4)->addHours(4),
                'resolved_at' => now()->subDays(3),
                'resolution_due_at' => now()->subDays(3)->addHours(24),
                'satisfaction' => [
                    'rating' => 4,
                    'comment' => 'Atendimento ágil pelo Teams e reconfiguração rápida do QR Code.',
                ],
                'comments' => [
                    [
                        'user_id' => $agentMariana->id,
                        'content' => 'Efetuada validação de identidade por chamada de vídeo. QR Code de pareamento gerado e enviado com senha temporária de uso único.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(3),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subDays(4)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'in_progress', 'new_value' => 'resolved', 'comment' => 'MFA pareado com êxito.', 'created_at' => now()->subDays(3)],
                ],
            ],

            // --- CHAMADOS FECHADOS / ENCERRADOS (CLOSED) ---
            [
                'code' => 'HD-2026-00014',
                'title' => 'Onboarding e criação de usuário de rede para analista fiscal recém-admitido',
                'description' => 'Criar conta de Active Directory, e-mail institucional no Microsoft 365 e permissão no grupo fiscal para o novo colaborador.',
                'status' => TicketStatus::CLOSED,
                'requester_id' => $reqJuliana->id,
                'assigned_to' => $agentCarlos->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptRH?->id ?? $deptIT?->id,
                'category_id' => $catAcessos?->id ?? $defaultCategory->id,
                'priority_id' => $prioMed?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaMed?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(7),
                'first_response_at' => now()->subDays(7)->addMinutes(25),
                'first_response_due_at' => now()->subDays(7)->addHours(4),
                'resolved_at' => now()->subDays(6),
                'resolution_due_at' => now()->subDays(6)->addHours(24),
                'closed_at' => now()->subDays(5),
                'satisfaction' => [
                    'rating' => 5,
                    'comment' => 'Processo de onboarding de TI impecável. O analista começou no primeiro dia com todos os acessos liberados!',
                ],
                'comments' => [
                    [
                        'user_id' => $agentCarlos->id,
                        'content' => 'Conta criada: bruno.fiscal@helpdeskpro.local. Grupos de segurança e permissões do ERP associadas com sucesso.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(6),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado de onboarding cadastrado.', 'created_at' => now()->subDays(7)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'in_progress', 'new_value' => 'resolved', 'comment' => 'Acessos configurados.', 'created_at' => now()->subDays(6)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'resolved', 'new_value' => 'closed', 'comment' => 'Homologado e encerrado pelo solicitante.', 'created_at' => now()->subDays(5)],
                ],
            ],
            [
                'code' => 'HD-2026-00015',
                'title' => 'Instalação de cliente VPN e certificado digital em notebook corporativo',
                'description' => 'Instalação e testes de acesso remoto seguro em máquina de colaborador transferido para regime de Home Office.',
                'status' => TicketStatus::CLOSED,
                'requester_id' => $reqLucas->id,
                'assigned_to' => $agentBeatriz->id,
                'team_id' => $teamL1?->id,
                'department_id' => $deptIT?->id,
                'category_id' => $catVpn?->id ?? $defaultCategory->id,
                'priority_id' => $prioMed?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaMed?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(10),
                'first_response_at' => now()->subDays(10)->addMinutes(30),
                'first_response_due_at' => now()->subDays(10)->addHours(4),
                'resolved_at' => now()->subDays(9),
                'resolution_due_at' => now()->subDays(9)->addHours(24),
                'closed_at' => now()->subDays(8),
                'satisfaction' => [
                    'rating' => 5,
                    'comment' => 'Configuração rápida e instruções muito claras.',
                ],
                'comments' => [
                    [
                        'user_id' => $agentBeatriz->id,
                        'content' => 'Certificado instalado no repositório de chaves do Windows e perfil OpenVPN testado com IP corporativo validado.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(9),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Chamado registrado.', 'created_at' => now()->subDays(10)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'resolved', 'new_value' => 'closed', 'comment' => 'Chamado encerrado automaticamente.', 'created_at' => now()->subDays(8)],
                ],
            ],
            [
                'code' => 'HD-2026-00016',
                'title' => 'Manutenção preventiva e substituição de nobreak do rack de servidores',
                'description' => 'Troca programada de baterias e teste de transferência estática do nobreak APC Smart-UPS 3000VA.',
                'status' => TicketStatus::CLOSED,
                'requester_id' => $admin->id,
                'assigned_to' => $agentLucas->id,
                'team_id' => $teamInfra?->id,
                'department_id' => $deptInfra?->id ?? $deptIT?->id,
                'category_id' => $catHardware?->id ?? $defaultCategory->id,
                'priority_id' => $prioHigh?->id ?? $defaultPriority->id,
                'sla_policy_id' => $slaHigh?->id,
                'sla_status' => 'compliant',
                'created_at' => now()->subDays(14),
                'first_response_at' => now()->subDays(14)->addMinutes(10),
                'first_response_due_at' => now()->subDays(14)->addHours(1),
                'resolved_at' => now()->subDays(13),
                'resolution_due_at' => now()->subDays(13)->addHours(8),
                'closed_at' => now()->subDays(12),
                'satisfaction' => [
                    'rating' => 5,
                    'comment' => 'Manutenção realizada na janela noturna sem qualquer interrupção dos serviços em produção.',
                ],
                'comments' => [
                    [
                        'user_id' => $agentLucas->id,
                        'content' => 'NOTA INTERNA: Baterias substituídas, autoteste executado com carga de 45%, autonomia estimada de 42 minutos em caso de queda de energia.',
                        'is_internal' => true,
                        'created_at' => now()->subDays(13),
                    ],
                ],
                'histories' => [
                    ['action' => 'created', 'comment' => 'Manutenção preventiva agendada.', 'created_at' => now()->subDays(14)],
                    ['action' => 'status_changed', 'field_name' => 'status', 'old_value' => 'resolved', 'new_value' => 'closed', 'comment' => 'Homologado pela equipe de infraestrutura.', 'created_at' => now()->subDays(12)],
                ],
            ],
        ];

        // 6. Persistir Chamados, Comentários, Histórico e CSAT
        foreach ($ticketsData as $data) {
            $comments = $data['comments'] ?? [];
            unset($data['comments']);

            $histories = $data['histories'] ?? [];
            unset($data['histories']);

            $satisfaction = $data['satisfaction'] ?? null;
            unset($data['satisfaction']);

            $ticket = Ticket::updateOrCreate(
                ['code' => $data['code']],
                $data
            );

            // Timeline / Comentários
            foreach ($comments as $c) {
                TicketComment::firstOrCreate(
                    [
                        'ticket_id' => $ticket->id,
                        'content' => $c['content'],
                    ],
                    [
                        'user_id' => $c['user_id'],
                        'is_internal' => $c['is_internal'],
                        'created_at' => $c['created_at'],
                        'updated_at' => $c['created_at'],
                    ]
                );
            }

            // Histórico de Ações
            foreach ($histories as $h) {
                TicketHistory::firstOrCreate(
                    [
                        'ticket_id' => $ticket->id,
                        'action' => $h['action'],
                        'created_at' => $h['created_at'],
                    ],
                    [
                        'user_id' => $ticket->assigned_to ?? $ticket->requester_id,
                        'field_name' => $h['field_name'] ?? null,
                        'old_value' => $h['old_value'] ?? null,
                        'new_value' => $h['new_value'] ?? null,
                        'comment' => $h['comment'],
                    ]
                );
            }

            // Avaliação CSAT
            if ($satisfaction) {
                TicketSatisfaction::updateOrCreate(
                    ['ticket_id' => $ticket->id],
                    [
                        'user_id' => $ticket->requester_id,
                        'rating' => $satisfaction['rating'],
                        'comment' => $satisfaction['comment'] ?? null,
                    ]
                );
            }
        }
    }
}
