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
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardMetricsService
{
    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getMetrics(User $user, array $filters = []): array
    {
        $cacheKey = 'dashboard_metrics:u'.$user->id.':'.md5(serialize($filters));

        return Cache::remember($cacheKey, 30, function () use ($user, $filters): array {
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
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function exportTicketsCsv(User $user, array $filters = []): StreamedResponse
    {
        [$dateFrom, $dateTo] = $this->resolveDateRange($filters);
        $query = $this->buildBaseQuery($user, $filters, $dateFrom, $dateTo)
            ->with(['requester', 'assignedTo', 'priority', 'department', 'category', 'satisfaction']);

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
                'Avaliação CSAT',
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

                    $csatLabel = $ticket->satisfaction
                        ? "{$ticket->satisfaction->rating}/5"
                        : 'Não avaliado';

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
                        $csatLabel,
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
        $statusCounts = (clone $query)
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $open = (int) ($statusCounts[TicketStatus::OPEN->value] ?? 0);
        $inProgress = (int) ($statusCounts[TicketStatus::IN_PROGRESS->value] ?? 0);
        $pending = (int) ($statusCounts[TicketStatus::PENDING->value] ?? 0);
        $resolved = (int) ($statusCounts[TicketStatus::RESOLVED->value] ?? 0);
        $closed = (int) ($statusCounts[TicketStatus::CLOSED->value] ?? 0);
        $cancelled = (int) ($statusCounts[TicketStatus::CANCELLED->value] ?? 0);
        $total = array_sum($statusCounts->toArray());

        $slaCounts = (clone $query)
            ->selectRaw('sla_status, COUNT(*) as aggregate')
            ->groupBy('sla_status')
            ->pluck('aggregate', 'sla_status');

        $slaBreached = (int) ($slaCounts['breached'] ?? 0);
        $slaWithin = (int) ($slaCounts['within_sla'] ?? 0);
        $slaEvaluated = $slaBreached + $slaWithin;
        $slaComplianceRate = $slaEvaluated > 0
            ? round(($slaWithin / $slaEvaluated) * 100, 1)
            : 100.0;

        // Tempo médio de primeira resposta (MTTA) via banco de dados
        $isMysql = DB::connection()->getDriverName() === 'mysql';
        $mttaDiff = $isMysql
            ? 'TIMESTAMPDIFF(MINUTE, created_at, first_response_at)'
            : '(strftime("%s", first_response_at) - strftime("%s", created_at)) / 60.0';
        $mttrDiff = $isMysql
            ? 'TIMESTAMPDIFF(MINUTE, created_at, resolved_at)'
            : '(strftime("%s", resolved_at) - strftime("%s", created_at)) / 60.0';

        $avgFirstResponseMinutes = (clone $query)
            ->whereNotNull('first_response_at')
            ->selectRaw("AVG({$mttaDiff}) as avg_mtta")
            ->value('avg_mtta');
        $avgFirstResponseMinutes = $avgFirstResponseMinutes !== null ? round((float) $avgFirstResponseMinutes, 1) : null;

        // Tempo médio de resolução (MTTR) via banco de dados
        $avgResolutionMinutes = (clone $query)
            ->whereNotNull('resolved_at')
            ->selectRaw("AVG({$mttrDiff}) as avg_mttr")
            ->value('avg_mttr');
        $avgResolutionMinutes = $avgResolutionMinutes !== null ? round((float) $avgResolutionMinutes, 1) : null;

        // Satisfação do Cliente (CSAT) consolidado via agregação SQL
        $ticketIds = (clone $query)->select('id');
        /** @var object{total_ratings?: int|string|null, avg_rating?: float|string|null, satisfied_count?: int|string|null}|null $csatRow */
        $csatRow = DB::table('ticket_satisfactions')
            ->whereIn('ticket_id', $ticketIds)
            ->selectRaw('
                COUNT(*) as total_ratings,
                AVG(rating) as avg_rating,
                SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as satisfied_count
            ')
            ->first();

        $totalCsat = 0;
        $avgCsat = null;
        $csatSatisfactionRate = 100.0;

        if ($csatRow !== null) {
            $totalCsat = (int) ($csatRow->total_ratings ?? 0);
            $avgCsat = $totalCsat > 0 && $csatRow->avg_rating !== null
                ? round((float) $csatRow->avg_rating, 1)
                : null;
            $satisfiedCount = (int) ($csatRow->satisfied_count ?? 0);
            $csatSatisfactionRate = $totalCsat > 0 ? round(($satisfiedCount / $totalCsat) * 100, 1) : 100.0;
        }

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
            'avg_csat' => $avgCsat,
            'csat_total_ratings' => $totalCsat,
            'csat_satisfaction_rate' => $csatSatisfactionRate,
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
