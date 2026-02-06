<?php

use App\Http\Controllers\Tenant\Settings\PasswordController;
use App\Http\Controllers\Tenant\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('tenant.settings.profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('tenant.settings.profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('tenant.settings.profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('tenant.settings.password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('tenant.settings.password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('tenant/settings/appearance');
    })->name('tenant.settings.appearance.edit');

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
