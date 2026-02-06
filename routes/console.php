<?php

use App\Models\System\Tenant;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('tenants:purge-canceled {--dry-run}', function () {
    $cutoff = now()->subDays(30);

    $query = Tenant::query()
        ->where('status', 'Canceled')
        ->whereNotNull('canceled_at')
        ->where('canceled_at', '<=', $cutoff);

    $count = $query->count();

    if ($this->option('dry-run')) {
        $this->info("Se eliminarían {$count} tenants cancelados hace más de 30 días.");
        return;
    }

    $this->info("Eliminando {$count} tenants cancelados hace más de 30 días...");

    $query->each(function (Tenant $tenant) {
        $this->info(" - {$tenant->id} ({$tenant->name})");
        // HasDatabase se encarga de eliminar la base de datos del tenant.
        $tenant->delete();
    });

    $this->info('Proceso de purga de tenants cancelados completado.');
})->purpose('Eliminar definitivamente tenants cancelados hace más de 30 días');

