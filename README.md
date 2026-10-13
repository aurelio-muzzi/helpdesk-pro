# HelpDesk Pro — Enterprise Service Desk & Issue Tracking SaaS

[![Backend Tests](https://img.shields.io/badge/PHPUnit-67%20Passed-brightgreen.svg)](file:///c:/Projeto/helpdesk-pro/backend)
[![Frontend Tests](https://img.shields.io/badge/Vitest-34%20Passed-brightgreen.svg)](file:///c:/Projeto/helpdesk-pro/frontend)
[![PHPStan](https://img.shields.io/badge/PHPStan-Level%205%20Clean-brightgreen.svg)](file:///c:/Projeto/helpdesk-pro/backend)
[![Pint](https://img.shields.io/badge/Pint-PSR--12%20Clean-brightgreen.svg)](file:///c:/Projeto/helpdesk-pro/backend)
[![ESLint](https://img.shields.io/badge/ESLint-0%20Warnings-brightgreen.svg)](file:///c:/Projeto/helpdesk-pro/frontend)
[![Docker](https://img.shields.io/badge/Docker-Production%20Ready-blue.svg)](file:///c:/Projeto/helpdesk-pro/docker-compose.yml)

Sistema corporativo de Service Desk, Gestão de Incidentes (ITIL) e Rastreamento de Problemas projetado com arquitetura moderna fullstack, alta confiabilidade e padrões avançados de engenharia de software.

---

## 🚀 Tecnologias Utilizadas

### Backend
- **PHP 8.4+** / **Laravel 12+**
- **Autenticação**: Laravel Sanctum (Stateful SPA / Bearer Token)
- **Banco de Dados**: MySQL 8.0+ com migrations transacionais e índices compostos
- **Cache & Filas**: Redis 7.0+ (armazenamento de sessões, cache e queue worker assíncrono)
- **Qualidade & Análise Estática**: PHPStan / Larastan (Level 5), Laravel Pint (PSR-12), PHPUnit & Pest

### Frontend
- **React 19** com **TypeScript** rígido (`strict: true`)
- **Build & Dev Server**: Vite 8+
- **Gerenciamento de Estado de Servidor**: TanStack Query (React Query v5)
- **Gerenciamento de Estado Global**: Zustand
- **Roteamento**: React Router DOM v7 com Code-Splitting e Lazy Loading
- **Design System**: Vanilla CSS corporativo estruturado com tokens HSL, Dark Mode nativo, microinterações e acessibilidade
- **Testes**: Vitest, React Testing Library, User Event

### Infraestrutura & DevOps
- **Docker & Docker Compose**: Nginx, PHP-FPM 8.4, MySQL 8, Redis 7, Queue Worker
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`) com execução de linting, checagem de tipos, testes automatizados e builds

---

## 🏛️ Módulos e Funcionalidades

### 1. Central de Atendimento e Gestão de Chamados (Tickets Core)
- Ciclo de vida completo do chamado: `Aberto` ➔ `Em Atendimento` ➔ `Pendente` ➔ `Resolvido` ➔ `Fechado` / `Cancelado`.
- Protocolos automáticos padronizados (`HD-YYYY-NNNNN`).
- Atribuição para atendentes e equipes técnicas especializadas.
- Drawer lateral com histórico de auditoria e linha do tempo de eventos.
- Comentários públicos, notas internas exclusivas para suporte e anexos de arquivos.

### 2. Motor de Políticas e Monitoramento de SLA (Service Level Agreement)
- Regras de SLA configuráveis por severidade e departamento.
- Metas de **Primeira Resposta (MTTA)** e **Tempo de Resolução (MTTR)**.
- Monitoramento de cumprimento ou violação de prazo em tempo real (`normal`, `warning`, `breached`, `met`).
- Notificações in-app disparadas automaticamente na aproximação do vencimento.

### 3. Portal do Solicitante e Avaliação de Satisfação (CSAT)
- Interface simplificada para abertura e acompanhamento de solicitações pelos usuários finais.
- Sistema de avaliação de satisfação (1 a 5 estrelas com comentário descritivo) após a resolução.
- Fluxo de **Reabertura de Chamado** com justificativa obrigatória e reset de marcos de SLA.

### 4. Base de Conhecimento e FAQ Integrada
- Artigos categorizados com controle de visibilidade (público vs. interno para suporte).
- Busca instantânea com sugestões dinâmicas ao digitar (`typeahead search`).
- Votação de utilidade do artigo (Útil / Não Útil).

### 5. Painel Executivo e Analytics (Dashboard)
- Indicadores de performance do Service Desk em tempo real.
- Gráficos em SVG de volume temporal, distribuição por status, severidade e departamento.
- Tabela de produtividade individual e taxa de resolução de atendentes.
- Exportação de relatórios gerenciais consolidados em CSV.

### 6. Trilha de Auditoria, Segurança e Hardening (Audit Trail)
- Registro cronológico imutável de autenticações, ações administrativas e modificações de tickets.
- Rastreamento de endereço IP, User-Agent e comparativo de diff JSON (`old_values` vs `new_values`).
- Proteção contra força bruta (Rate Limiting de 5 req/min no login).
- Cabeçalhos de segurança HTTP OWASP (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`, `Referrer-Policy`).
- Acesso à trilha restrito exclusivamente a administradores (`role:admin`).

---

## ⚙️ Instalação e Execução

### Opção 1: Execução Completa via Docker Compose (Recomendado)

1. Clone o repositório:
```bash
git clone https://github.com/aurelio-muzzi/helpdesk-pro.git
cd helpdesk-pro
```

2. Inicialize os contêineres:
```bash
docker compose up -d
```

3. Instale as dependências e popule o banco de dados de demonstração:
```bash
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed
```

4. Acesse as aplicações:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **API Backend**: [http://localhost:8088/api/v1](http://localhost:8088/api/v1)

---

### Opção 2: Execução em Ambiente Local

#### Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --port=8000
```

#### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Credenciais Padrão de Demonstração

O comando `php artisan db:seed` cria os seguintes usuários para homologação imediata:

| Papel (Role) | E-mail | Senha | Acessos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@helpdeskpro.local` | `Secret123!` | Acesso irrestrito, Trilha de Auditoria, SLAs, Configurações |
| **Agente / Suporte** | `agente@helpdeskpro.local` | `Secret123!` | Triagem de tickets, atendimento, notas internas, Base de Conhecimento |
| **Solicitante / Cliente** | `solicitante@helpdeskpro.local` | `Secret123!` | Central do Cliente, abertura de chamados, avaliação CSAT, reabertura |

---

## 🧪 Quality Gates e Testes Automatizados

O projeto mantém **100% de cobertura nos fluxos principais**, com zero erros em análise estática e padronização rigorosa de código:

### Backend
```bash
cd backend
php vendor/bin/pint --test             # Validação de estilo de código PSR-12 (0 issues)
php vendor/bin/phpstan analyse          # Análise estática PHPStan Level 5 (0 errors)
php artisan test                        # 67 testes unitários e de feature (260 asserções)
```

### Frontend
```bash
cd frontend
npm run lint                           # Validação de código ESLint (0 errors, 0 warnings)
npm run typecheck                      # Verificação de tipos TypeScript (tsc --noEmit)
npm test -- --run                      # 10 suites Vitest (34 testes passando)
npm run build                          # Build de produção otimizado com Vite
```

---

## 📂 Estrutura do Repositório

```text
helpdesk-pro/
├── .github/workflows/ci.yml       # Pipeline automatizado de CI/CD (GitHub Actions)
├── backend/                       # Aplicação Laravel 12 REST API
│   ├── app/Models/                # Modelos Eloquent com type-hinting completo
│   ├── app/Http/Controllers/      # Controllers desacoplados de API V1
│   ├── app/Http/Middleware/       # Middlewares de segurança e controle de papéis
│   ├── app/Services/              # Camada de serviços (SLA, CSAT, Auditoria, Métricas)
│   ├── database/migrations/       # Migrations transacionais
│   └── tests/Feature/             # Testes de integração e feature da API
├── frontend/                      # Aplicação React 19 + TypeScript + Vite
│   ├── src/features/auth/         # Módulo de Autenticação e RBAC
│   ├── src/features/tickets/      # Módulo de Chamados, CSAT e Timeline
│   ├── src/features/sla/          # Módulo de Políticas de SLA
│   ├── src/features/audit/        # Módulo de Trilha de Auditoria & Segurança
│   ├── src/features/kb/           # Módulo da Base de Conhecimento
│   ├── src/features/dashboard/    # Módulo de Analytics e Relatórios
│   └── src/styles/                # Tokens de design e CSS estruturado
├── docker/                        # Dockerfiles e configurações Nginx/PHP/MySQL
├── docker-compose.yml             # Orquestração do ambiente completo
└── README.md                      # Documentação técnica do projeto
```

---

## 🗺️ Etapas Desenvolvidas (Roadmap de Implementação)

- [x] **Etapa 0** — Setup do Ambiente, Arquitetura Base & Estrutura Monorepo
- [x] **Etapa 1** — Autenticação, Perfis de Usuário (RBAC) e Permissões Granulares
- [x] **Etapa 2** — Estrutura Organizacional (Departamentos, Equipes, Categorias e Prioridades)
- [x] **Etapa 3** — Ciclo de Vida dos Chamados (Tickets Core, Máquina de Estados e Protocolos)
- [x] **Etapa 4** — Frontend da Central de Chamados (Dashboard, Tabela Reativa, Filtros e Modais)
- [x] **Etapa 5** — Interações, Linha do Tempo, Comentários Públicos/Internos e Upload de Anexos
- [x] **Etapa 6** — Políticas de SLA, Motor de Prazos (MTTA/MTTR), Detecção de Violações e Notificações In-App
- [x] **Etapa 7** — Painel Executivo (Dashboard Analytics), Gráficos SVG e Exportação de Relatórios CSV
- [x] **Etapa 8** — Base de Conhecimento (KB), Catálogo de Artigos, Busca Instantânea e Votação de Utilidade
- [x] **Etapa 9** — Portal do Solicitante, Avaliação de Satisfação (CSAT 1-5★) e Reabertura de Chamados
- [x] **Etapa 10** — Auditoria, Segurança, Logs de Atividade Imutáveis e Hardening OWASP
- [x] **Etapa 11** — CI/CD (GitHub Actions), Docker de Produção e Documentação Consolidada

---

## 📜 Licença

Este projeto é desenvolvido para fins corporativos e portfólio profissional de arquitetura de software sob a licença **MIT**.
