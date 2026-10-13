<?php

namespace Database\Seeders;

use App\Models\Priority;
use App\Models\SlaPolicy;
use Illuminate\Database\Seeder;

class SlaPolicySeeder extends Seeder
{
    public function run(): void
    {
        $urgente = Priority::where('name', 'urgente')->first();
        $alta = Priority::where('name', 'alta')->first();
        $media = Priority::where('name', 'media')->first();
        $baixa = Priority::where('name', 'baixa')->first();

        $policies = [
            [
                'name' => 'SLA Crítico / Urgente',
                'description' => 'Aplica-se a incidentes de parada total de operação ou sistemas críticos fora do ar.',
                'priority_id' => $urgente?->id,
                'first_response_time_minutes' => 15,
                'resolution_time_minutes' => 120,
                'is_active' => true,
            ],
            [
                'name' => 'SLA Alta Severidade',
                'description' => 'Aplica-se a falhas que afetam processos operacionais essenciais sem solução de contorno.',
                'priority_id' => $alta?->id,
                'first_response_time_minutes' => 60,
                'resolution_time_minutes' => 480,
                'is_active' => true,
            ],
            [
                'name' => 'SLA Padrão / Médio',
                'description' => 'Aplica-se a solicitações do dia a dia com impacto parcial ou moderado.',
                'priority_id' => $media?->id,
                'first_response_time_minutes' => 240,
                'resolution_time_minutes' => 1440,
                'is_active' => true,
            ],
            [
                'name' => 'SLA Baixa Prioridade',
                'description' => 'Aplica-se a dúvidas, ajustes cosméticos ou melhorias não urgentes.',
                'priority_id' => $baixa?->id,
                'first_response_time_minutes' => 480,
                'resolution_time_minutes' => 2880,
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
