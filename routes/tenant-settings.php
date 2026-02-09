<?php

use App\Http\Controllers\Tenant\Settings\TenantPasswordController;
use App\Http\Controllers\Tenant\Settings\TenantProfileController;
use App\Http\Controllers\Tenant\Settings\SmtpController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', 'tenant/settings/profile');

    Route::get('tenant/settings/profile', [TenantProfileController::class, 'edit'])->name('tenant.settings.profile.edit');
    Route::patch('tenant/settings/profile', [TenantProfileController::class, 'update'])->name('tenant.settings.profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::delete('tenant/settings/profile', [TenantProfileController::class, 'destroy'])->name('tenant.settings.profile.destroy');

    Route::get('tenant/settings/password', [TenantPasswordController::class, 'edit'])->name('tenant.settings.password.edit');

    Route::put('tenant/settings/password', [TenantPasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('tenant.settings.password.update');

    Route::get('tenant/settings/appearance', function () {
        return Inertia::render('tenant/settings/appearance');
    })->name('tenant.settings.appearance.edit');

    Route::get('tenant/settings/smtp', [SmtpController::class, 'edit'])->name('tenant.settings.smtp.edit');
    Route::post('tenant/settings/smtp', [SmtpController::class, 'update'])->name('tenant.settings.smtp.update');
    Route::post('tenant/settings/smtp/test', [SmtpController::class, 'test'])->name('tenant.settings.smtp.test');

    // Two Factor Auth for Tenants? Maybe later. Commenting out for now or keeping if we want to support it.
    // The previous file had it, let's keep it but ideally we need Tenant\Settings\TwoFactorController
    // For now let's reuse System one OR disable it until requested. 
    // User only mentioned "Profile, Password, Appearance" in conversation about "diferenciar".
    // I will keep it commented out to avoid errors if System controller renders system view.
    /*
    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
    */
});
