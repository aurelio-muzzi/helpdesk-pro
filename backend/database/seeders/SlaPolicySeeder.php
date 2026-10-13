<?php

namespace Database\Seeders;

use App\Enums\PriorityLevel;
use App\Models\Priority;
use App\Models\SlaPolicy;
use Illuminate\Database\Seeder;

class SlaPolicySeeder extends Seeder
{
    public function run(): void
    {
        $urgente = Priority::where('name', PriorityLevel::URGENT->value)
            ->orWhere('name', 'urgente')
            ->orWhere('display_name', 'Urgente')
            ->first();

        $alta = Priority::where('name', PriorityLevel::HIGH->value)
            ->orWhere('name', 'alta')
            ->orWhere('display_name', 'Alta')
            ->first();

        $media = Priority::where('name', PriorityLevel::MEDIUM->value)
            ->orWhere('name', 'media')
            ->orWhere('display_name', 'Média')
            ->first();

        $baixa = Priority::where('name', PriorityLevel::LOW->value)
            ->orWhere('name', 'baixa')
            ->orWhere('display_name', 'Baixa')
            ->first();

        $policies = [
            [
                'name' => 'SLA Crítico / Urgente (P1)',
                'description' => 'Aplica-se a incidentes de parada total de operação, sistemas críticos ou filiais inacessíveis.',
                'priority_id' => $urgente?->id,
                'first_response_time_minutes' => 15,
                'resolution_time_minutes' => 120, // 2 horas
                'is_active' => true,
            ],
            [
                'name' => 'SLA Alta Severidade (P2)',
                'description' => 'Aplica-se a falhas que afetam processos operacionais essenciais sem solução temporária de contorno.',
                'priority_id' => $alta?->id,
                'first_response_time_minutes' => 60, // 1 hora
                'resolution_time_minutes' => 480, // 8 horas
                'is_active' => true,
            ],
            [
                'name' => 'SLA Padrão / Médio (P3)',
                'description' => 'Aplica-se a solicitações do dia a dia com impacto parcial ou moderado nas atividades do colaborador.',
                'priority_id' => $media?->id,
                'first_response_time_minutes' => 240, // 4 horas
                'resolution_time_minutes' => 1440, // 24 horas
                'is_active' => true,
            ],
            [
                'name' => 'SLA Baixa Prioridade (P4)',
                'description' => 'Aplica-se a pedidos informativos, ajustes cosméticos, periféricos secundários ou melhorias não urgentes.',
                'priority_id' => $baixa?->id,
                'first_response_time_minutes' => 480, // 8 horas
                'resolution_time_minutes' => 2880, // 48 horas
                'is_active' => true,
            ],
        ];

        foreach ($policies as $data) {
            if ($data['priority_id'] !== null) {
                SlaPolicy::updateOrCreate(
                    ['priority_id' => $data['priority_id']],
                    $data
                );
            }
        }
    }
}
