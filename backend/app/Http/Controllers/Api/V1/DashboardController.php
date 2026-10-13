<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DashboardMetricsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardMetricsService $metricsService
    ) {}

    public function metrics(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'period' => ['sometimes', 'string', 'in:7d,30d,90d,custom'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'priority_id' => ['nullable', 'integer', 'exists:priorities,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $data = $this->metricsService->getMetrics($user, $validated);

        return response()->json(['data' => $data]);
    }

    public function export(Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'period' => ['sometimes', 'string', 'in:7d,30d,90d,custom'],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'priority_id' => ['nullable', 'integer', 'exists:priorities,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        return $this->metricsService->exportTicketsCsv($user, $validated);
    }
}
