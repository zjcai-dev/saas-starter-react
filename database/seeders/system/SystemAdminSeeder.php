<?php

namespace Database\Seeders\System;

use App\Models\System\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SystemAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Generate random password
        $password = Str::random(9);
        
        // Get domain from APP_URL_BASE
        $domain = config('app.url_base', parse_url(config('app.url'), PHP_URL_HOST));
        $email = "admin@{$domain}";

        // Create or update admin user
        $admin = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'System Administrator',
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        // Store credentials for console output
        $this->command->getOutput()->writeln('');
        $this->command->getOutput()->writeln('<fg=green>✓ System Administrator created successfully</>');
        $this->command->getOutput()->writeln('<fg=yellow>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
        $this->command->getOutput()->writeln('<fg=cyan>  Email:</> ' . $email);
        $this->command->getOutput()->writeln('<fg=cyan>  Password:</> ' . $password);
        $this->command->getOutput()->writeln('<fg=yellow>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
        $this->command->getOutput()->writeln('<fg=red>⚠ Save these credentials securely!</>');
        $this->command->getOutput()->writeln('');
    }
}
