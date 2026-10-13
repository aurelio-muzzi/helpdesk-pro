<?php

namespace App\Services;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Department;
use App\Models\Priority;
use App\Models\Ticket;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardMetricsService
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getMetrics(User $user, array $filters = []): array
    {
        [$dateFrom, $dateTo] = $this->resolveDateRange($filters);

        $query = $this->buildBaseQuery($user, $filters, $dateFrom, $dateTo);

        // 1. Sumário de KPIs
        $summary = $this->calculateSummary(clone $query);

        // 2. Chamados por Status
        $byStatus = $this->calculateByStatus(clone $query);

        // 3. Chamados por Prioridade
        $byPriority = $this->calculateByPriority(clone $query);

        // 4. Chamados por Departamento
        $byDepartment = $this->calculateByDepartment(clone $query);

        // 5. Volume ao longo do tempo (diário)
        $volumeOverTime = $this->calculateVolumeOverTime(clone $query, $dateFrom, $dateTo);

        // 6. Produtividade por Atendente
        $agentPerformance = $this->calculateAgentPerformance(clone $query);

        // 7. Chamados Recentes
        $recentTickets = $this->getRecentTickets(clone $query);

        return [
            'period' => [
                'from' => $dateFrom->toDateString(),
                'to' => $dateTo->toDateString(),
            ],
            'summary' => $summary,
            'tickets_by_status' => $byStatus,
            'tickets_by_priority' => $byPriority,
            'tickets_by_department' => $byDepartment,
            'volume_over_time' => $volumeOverTime,
            'agent_performance' => $agentPerformance,
            'recent_tickets' => $recentTickets,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function exportTicketsCsv(User $user, array $filters = []): StreamedResponse
    {
        [$dateFrom, $dateTo] = $this->resolveDateRange($filters);
        $query = $this->buildBaseQuery($user, $filters, $dateFrom, $dateTo)
            ->with(['requester', 'assignedTo', 'priority', 'department', 'category']);

        $filename = 'relatorio-chamados-'.date('Y-m-d').'.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($query): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            // UTF-8 BOM para compatibilidade com Microsoft Excel
            fwrite($handle, "\xEF\xBB\xBF");

            // Cabeçalho CSV
            fputcsv($handle, [
                'Código',
                'Título',
                'Status',
                'Prioridade',
                'Departamento',
                'Categoria',
                'Solicitante',
                'Atendente',
                'SLA Status',
                'Data de Criação',
                'Primeira Resposta',
                'Data de Resolução',
            ], ';');

            $query->chunk(100, function ($tickets) use ($handle): void {
                /** @var Ticket $ticket */
                foreach ($tickets as $ticket) {
                    $slaStatusLabel = match ($ticket->sla_status) {
                        'within_sla' => 'Dentro do Prazo',
                        'breached' => 'Violado',
                        default => 'Pendente',
                    };

                    fputcsv($handle, [
                        $ticket->code,
                        $ticket->title,
                        $ticket->status->label(),
                        $ticket->priority->display_name,
                        $ticket->department ? $ticket->department->name : 'N/A',
                        $ticket->category->name,
                        $ticket->requester->name,
                        $ticket->assignedTo ? $ticket->assignedTo->name : 'Não atribuído',
                        $slaStatusLabel,
                        $ticket->created_at?->format('d/m/Y H:i') ?? '',
                        $ticket->first_response_at?->format('d/m/Y H:i') ?? 'Pendente',
                        $ticket->resolved_at?->format('d/m/Y H:i') ?? 'Não resolvido',
                    ], ';');
                }
            });

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveDateRange(array $filters): array
    {
        $period = $filters['period'] ?? '7d';

        if (! empty($filters['date_from']) && ! empty($filters['date_to'])) {
            $from = Carbon::parse((string) $filters['date_from'])->startOfDay();
            $to = Carbon::parse((string) $filters['date_to'])->endOfDay();

            return [$from, $to];
        }

        $now = Carbon::now();
        $to = $now->copy()->endOfDay();

        $from = match ($period) {
            '30d' => $now->copy()->subDays(29)->startOfDay(),
            '90d' => $now->copy()->subDays(89)->startOfDay(),
            default => $now->copy()->subDays(6)->startOfDay(),
        };

        return [$from, $to];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Builder<Ticket>
     */
    private function buildBaseQuery(User $user, array $filters, Carbon $dateFrom, Carbon $dateTo): Builder
    {
        /** @var Builder<Ticket> $query */
        $query = Ticket::query()
            ->whereBetween('created_at', [$dateFrom, $dateTo]);

        // Scoping por papel de usuário (solicitantes só veem seus chamados)
        if ($user->isRequester()) {
            $query->where('requester_id', $user->id);
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', (int) $filters['department_id']);
        }

        if (! empty($filters['priority_id'])) {
            $query->where('priority_id', (int) $filters['priority_id']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }

        if (! empty($filters['assigned_to'])) {
            $query->where('assigned_to', (int) $filters['assigned_to']);
        }

        return $query;
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<string, mixed>
     */
    private function calculateSummary(Builder $query): array
    {
        $total = (int) (clone $query)->count();
        $open = (int) (clone $query)->where('status', TicketStatus::OPEN->value)->count();
        $inProgress = (int) (clone $query)->where('status', TicketStatus::IN_PROGRESS->value)->count();
        $pending = (int) (clone $query)->where('status', TicketStatus::PENDING->value)->count();
        $resolved = (int) (clone $query)->where('status', TicketStatus::RESOLVED->value)->count();
        $closed = (int) (clone $query)->where('status', TicketStatus::CLOSED->value)->count();
        $cancelled = (int) (clone $query)->where('status', TicketStatus::CANCELLED->value)->count();

        $slaBreached = (int) (clone $query)->where('sla_status', 'breached')->count();
        $slaWithin = (int) (clone $query)->where('sla_status', 'within_sla')->count();
        $slaEvaluated = $slaBreached + $slaWithin;
        $slaComplianceRate = $slaEvaluated > 0
            ? round(($slaWithin / $slaEvaluated) * 100, 1)
            : 100.0;

        // Tempo médio de primeira resposta (MTTA)
        $firstResponses = (clone $query)
            ->whereNotNull('first_response_at')
            ->get(['created_at', 'first_response_at']);

        $avgFirstResponseMinutes = $firstResponses->isEmpty()
            ? null
            : round((float) $firstResponses->avg(function (Ticket $t): float {
                return (float) Carbon::parse($t->created_at)->diffInMinutes(Carbon::parse($t->first_response_at));
            }), 1);

        // Tempo médio de resolução (MTTR)
        $resolutions = (clone $query)
            ->whereNotNull('resolved_at')
            ->get(['created_at', 'resolved_at']);

        $avgResolutionMinutes = $resolutions->isEmpty()
            ? null
            : round((float) $resolutions->avg(function (Ticket $t): float {
                return (float) Carbon::parse($t->created_at)->diffInMinutes(Carbon::parse($t->resolved_at));
            }), 1);

        return [
            'total_tickets' => $total,
            'open_tickets' => $open,
            'in_progress_tickets' => $inProgress,
            'pending_tickets' => $pending,
            'resolved_tickets' => $resolved,
            'closed_tickets' => $closed,
            'cancelled_tickets' => $cancelled,
            'sla_breached' => $slaBreached,
            'sla_within' => $slaWithin,
            'sla_compliance_rate' => $slaComplianceRate,
            'avg_first_response_minutes' => $avgFirstResponseMinutes,
            'avg_resolution_minutes' => $avgResolutionMinutes,
        ];
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<int, array<string, mixed>>
     */
    private function calculateByStatus(Builder $query): array
    {
        $counts = (clone $query)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $result = [];
        foreach (TicketStatus::cases() as $status) {
            $result[] = [
                'status' => $status->value,
                'label' => $status->label(),
                'color' => $status->color(),
                'count' => (int) ($counts[$status->value] ?? 0),
            ];
        }

        return $result;
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<int, array<string, mixed>>
     */
    private function calculateByPriority(Builder $query): array
    {
        $priorities = Priority::orderBy('order', 'asc')->get();
        $counts = (clone $query)
            ->selectRaw('priority_id, COUNT(*) as aggregate')
            ->groupBy('priority_id')
            ->pluck('aggregate', 'priority_id');

        return $priorities->map(function (Priority $priority) use ($counts): array {
            return [
                'id' => $priority->id,
                'name' => $priority->name,
                'display_name' => $priority->display_name,
                'color' => $priority->color,
                'count' => (int) ($counts[$priority->id] ?? 0),
            ];
        })->values()->toArray();
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<int, array<string, mixed>>
     */
    private function calculateByDepartment(Builder $query): array
    {
        $departments = Department::orderBy('name', 'asc')->get();
        $counts = (clone $query)
            ->whereNotNull('department_id')
            ->selectRaw('department_id, COUNT(*) as aggregate')
            ->groupBy('department_id')
            ->pluck('aggregate', 'department_id');

        return $departments->map(function (Department $department) use ($counts): array {
            return [
                'id' => $department->id,
                'name' => $department->name,
                'count' => (int) ($counts[$department->id] ?? 0),
            ];
        })->values()->toArray();
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<int, array<string, mixed>>
     */
    private function calculateVolumeOverTime(Builder $query, Carbon $dateFrom, Carbon $dateTo): array
    {
        $createdCounts = (clone $query)
            ->selectRaw('DATE(created_at) as day, COUNT(*) as aggregate')
            ->groupBy('day')
            ->pluck('aggregate', 'day');

        $resolvedCounts = (clone $query)
            ->whereNotNull('resolved_at')
            ->selectRaw('DATE(resolved_at) as day, COUNT(*) as aggregate')
            ->groupBy('day')
            ->pluck('aggregate', 'day');

        $result = [];
        $current = $dateFrom->copy();

        while ($current->lte($dateTo)) {
            $dayStr = $current->toDateString();
            $result[] = [
                'date' => $dayStr,
                'created' => (int) ($createdCounts[$dayStr] ?? 0),
                'resolved' => (int) ($resolvedCounts[$dayStr] ?? 0),
            ];
            $current->addDay();
        }

        return $result;
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<int, array<string, mixed>>
     */
    private function calculateAgentPerformance(Builder $query): array
    {
        $agents = User::whereHas('role', function ($q): void {
            $q->whereIn('name', [UserRole::AGENT->value, UserRole::MANAGER->value, UserRole::ADMIN->value]);
        })->get();

        $assignedCounts = (clone $query)
            ->whereNotNull('assigned_to')
            ->selectRaw('assigned_to, COUNT(*) as aggregate')
            ->groupBy('assigned_to')
            ->pluck('aggregate', 'assigned_to');

        $resolvedCounts = (clone $query)
            ->whereNotNull('assigned_to')
            ->whereIn('status', [TicketStatus::RESOLVED->value, TicketStatus::CLOSED->value])
            ->selectRaw('assigned_to, COUNT(*) as aggregate')
            ->groupBy('assigned_to')
            ->pluck('aggregate', 'assigned_to');

        /** @var array<int, array<string, mixed>> $performance */
        $performance = $agents->map(function (User $agent) use ($assignedCounts, $resolvedCounts): array {
            $assigned = (int) ($assignedCounts[$agent->id] ?? 0);
            $resolved = (int) ($resolvedCounts[$agent->id] ?? 0);
            $rate = $assigned > 0 ? round(($resolved / $assigned) * 100, 1) : 0.0;

            return [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'assigned_count' => $assigned,
                'resolved_count' => $resolved,
                'resolution_rate' => $rate,
            ];
        })
            ->filter(fn (array $a): bool => $a['assigned_count'] > 0)
            ->values()
            ->toArray();

        return $performance;
    }

    /**
     * @param  Builder<Ticket>  $query
     * @return array<int, array<string, mixed>>
     */
    private function getRecentTickets(Builder $query): array
    {
        return (clone $query)
            ->with(['requester', 'assignedTo', 'priority', 'department'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function (Ticket $ticket): array {
                return [
                    'id' => $ticket->id,
                    'code' => $ticket->code,
                    'title' => $ticket->title,
                    'status' => $ticket->status->value,
                    'status_label' => $ticket->status->label(),
                    'status_color' => $ticket->status->color(),
                    'priority_name' => $ticket->priority->display_name,
                    'priority_color' => $ticket->priority->color,
                    'requester_name' => $ticket->requester->name,
                    'assigned_name' => $ticket->assignedTo?->name,
                    'created_at' => $ticket->created_at?->toISOString(),
                ];
            })
            ->toArray();
    }
}
