<?php

namespace App\Http\Controllers\Tenant\Settings;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SmtpController extends Controller
{
    /**
     * Show the SMTP settings page.
     */
    public function edit()
    {
        return Inertia::render('tenant/settings/smtp', [
            'smtp_host' => Setting::where('key', 'smtp_host')->value('value') ?? '',
            'smtp_port' => Setting::where('key', 'smtp_port')->value('value') ?? '587',
            'smtp_encryption' => Setting::where('key', 'smtp_encryption')->value('value') ?? 'tls',
            'smtp_username' => Setting::where('key', 'smtp_username')->value('value') ?? '',
            'smtp_from_address' => Setting::where('key', 'smtp_from_address')->value('value') ?? '',
            'smtp_from_name' => Setting::where('key', 'smtp_from_name')->value('value') ?? tenant('name'),
        ]);
    }

    /**
     * Update SMTP settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'smtp_host' => 'required|string|max:255',
            'smtp_port' => 'required|integer|min:1|max:65535',
            'smtp_encryption' => 'required|in:tls,ssl,none',
            'smtp_username' => 'required|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'smtp_from_address' => 'required|email|max:255',
            'smtp_from_name' => 'required|string|max:255',
        ]);

        // Update all settings except password if empty
        foreach ($validated as $key => $value) {
            if ($key === 'smtp_password' && empty($value)) {
                continue; // Don't overwrite password if empty
            }

            $settingValue = $key === 'smtp_password' ? encrypt($value) : $value;

            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $settingValue]
            );
        }

        return redirect()->back()
            ->with('success', 'SMTP settings updated successfully.');
    }

    /**
     * Send a test email.
     */
    public function test(Request $request)
    {
        try {
            // Configure mail on the fly with stored settings
            $this->configureMailer();

            Mail::raw('This is a test email from your tenant SMTP configuration.', function ($message) use ($request) {
                $message->to($request->user()->email)
                    ->subject('SMTP Test Email - ' . tenant('name'));
            });

            return redirect()->back()
                ->with('success', 'Test email sent successfully to ' . $request->user()->email);
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to send test email: ' . $e->getMessage()]);
        }
    }

    /**
     * Configure the mailer with stored SMTP settings.
     */
    private function configureMailer(): void
    {
        $host = Setting::where('key', 'smtp_host')->value('value');
        $port = Setting::where('key', 'smtp_port')->value('value');
        $encryption = Setting::where('key', 'smtp_encryption')->value('value');
        $username = Setting::where('key', 'smtp_username')->value('value');
        $password = Setting::where('key', 'smtp_password')->value('value');
        $fromAddress = Setting::where('key', 'smtp_from_address')->value('value');
        $fromName = Setting::where('key', 'smtp_from_name')->value('value');

        if ($password) {
            $password = decrypt($password);
        }

        config([
            'mail.mailers.smtp.host' => $host,
            'mail.mailers.smtp.port' => $port,
            'mail.mailers.smtp.encryption' => $encryption === 'none' ? null : $encryption,
            'mail.mailers.smtp.username' => $username,
            'mail.mailers.smtp.password' => $password,
            'mail.from.address' => $fromAddress,
            'mail.from.name' => $fromName,
        ]);
    }
}
