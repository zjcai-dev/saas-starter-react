<?php

namespace Database\Seeders;

use Database\Seeders\System\PlanSeeder;
use Database\Seeders\System\SystemAdminSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->getOutput()->writeln('');
        $this->command->getOutput()->writeln('<fg=blue>╔════════════════════════════════════════╗</>');
        $this->command->getOutput()->writeln('<fg=blue>║</> <fg=white;options=bold>  Seeding System Database          </> <fg=blue>║</>');
        $this->command->getOutput()->writeln('<fg=blue>╚════════════════════════════════════════╝</>');
        $this->command->getOutput()->writeln('');

        // Seed system admin
        $this->call(SystemAdminSeeder::class);

        // Seed subscription plans
        $this->call(PlanSeeder::class);

        $this->command->getOutput()->writeln('');
        $this->command->getOutput()->writeln('<fg=green;options=bold>✓ Database seeding completed successfully!</>');
        $this->command->getOutput()->writeln('');
    }
}
