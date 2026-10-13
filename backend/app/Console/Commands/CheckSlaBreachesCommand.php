<?php

namespace App\Console\Commands;

use App\Services\SlaService;
use Illuminate\Console\Command;

class CheckSlaBreachesCommand extends Command
{
    protected $signature = 'tickets:check-sla';

    protected $description = 'Verifica chamados que excederam os prazos de SLA e dispara alertas';

    public function handle(SlaService $slaService): int
    {
        $this->info('Iniciando monitoramento de políticas de SLA...');

        $breachedCount = $slaService->checkBreaches();

        $this->info("Verificação concluída. {$breachedCount} chamado(s) identificado(s) com estouro de SLA.");

        return Command::SUCCESS;
    }
}
