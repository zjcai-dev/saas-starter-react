<?php

use App\Http\Controllers\System\Settings\PasswordController;
use App\Http\Controllers\System\Settings\ProfileController;
use App\Http\Controllers\System\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('system/settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::get('settings/general', [\App\Http\Controllers\System\Settings\SystemSettingController::class, 'editGeneral'])
        ->name('system.settings.general.edit');

    Route::post('settings/general', [\App\Http\Controllers\System\Settings\SystemSettingController::class, 'updateGeneral'])
        ->name('system.settings.general');

    Route::get('settings/guest-register', [\App\Http\Controllers\System\Settings\SystemSettingController::class, 'editGuestRegistration'])
        ->name('system.settings.guest-register.edit');

    Route::post('settings/guest-register', [\App\Http\Controllers\System\Settings\SystemSettingController::class, 'updateGuestRegistration'])
        ->name('system.settings.guest-register');
});
