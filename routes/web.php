<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\ConfirmablePasswordController;
use Laravel\Fortify\Http\Controllers\ConfirmedPasswordStatusController;
use Laravel\Fortify\Http\Controllers\EmailVerificationNotificationController;
use Laravel\Fortify\Http\Controllers\EmailVerificationPromptController;
use Laravel\Fortify\Http\Controllers\NewPasswordController;
use Laravel\Fortify\Http\Controllers\PasswordController;
use Laravel\Fortify\Http\Controllers\PasswordResetLinkController;
use Laravel\Fortify\Http\Controllers\ProfileInformationController;
use Laravel\Fortify\Http\Controllers\RecoveryCodeController;
use Laravel\Fortify\Http\Controllers\RegisteredUserController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticatedSessionController;
use Laravel\Fortify\Http\Controllers\TwoFactorAuthenticationController;
use Laravel\Fortify\Http\Controllers\TwoFactorQrCodeController;
use Laravel\Fortify\Http\Controllers\TwoFactorSecretKeyController;
use Laravel\Fortify\Http\Controllers\VerifyEmailController;

/*
|--------------------------------------------------------------------------
| Central Domain Routes
|--------------------------------------------------------------------------
|
| Routes accessible only from the main application domain.
| These handle core authentication and dashboard functionality.
|
*/

Route::domain(env('APP_URL_BASE'))->group(function () {
    
    // Root redirect
    Route::get('/', function () {
        return redirect()->route('login');
    });

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */
    Route::get('dashboard', function () {
        return Inertia::render('system/dashboard');
    })->middleware(['auth', 'verified'])->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Plans Management
    |--------------------------------------------------------------------------
    */
    Route::resource('plans', \App\Http\Controllers\System\PlanController::class)
        ->middleware(['auth', 'verified'])
        ->except(['show', 'create', 'edit']);

    /*
    |--------------------------------------------------------------------------
    | Logs Viewer
    |--------------------------------------------------------------------------
    */
    Route::get('logs', [\App\Http\Controllers\System\LogViewerController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('logs.index');

    /*
    |--------------------------------------------------------------------------
    | Tenants Management
    |--------------------------------------------------------------------------
    */
    Route::resource('tenants', \App\Http\Controllers\System\TenantController::class)
        ->middleware(['auth', 'verified'])
        ->except(['show', 'create', 'edit']);

    Route::post('tenants/{tenant}/cancel', [\App\Http\Controllers\System\TenantController::class, 'cancel'])
        ->middleware(['auth', 'verified'])
        ->name('tenants.cancel');
        
    Route::post('tenants/{tenant}/restore', [\App\Http\Controllers\System\TenantController::class, 'restore'])
        ->middleware(['auth', 'verified'])
        ->name('tenants.restore');
    /*
    |--------------------------------------------------------------------------
    | Authentication Routes
    |--------------------------------------------------------------------------
    |
    | Handles user authentication including login, logout, registration,
    | password reset, email verification, and two-factor authentication.
    |
    */
    Route::prefix('auth')->group(function () {
        $enableViews = config('fortify.views', true);

        // Login
        if ($enableViews) {
            Route::get('/login', [AuthenticatedSessionController::class, 'create'])
                ->middleware(['guest:'.config('fortify.guard')])
                ->name('login');
        }

        Route::post('/login', [AuthenticatedSessionController::class, 'store'])
            ->middleware(['guest:'.config('fortify.guard')])
            ->name('login.store');

        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
            ->name('logout');

        // Password Reset
        if (Features::enabled(Features::resetPasswords())) {
            if ($enableViews) {
                Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
                    ->middleware(['guest:'.config('fortify.guard')])
                    ->name('password.request');

                Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
                    ->middleware(['guest:'.config('fortify.guard')])
                    ->name('password.reset');
            }

            Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
                ->middleware(['guest:'.config('fortify.guard')])
                ->name('password.email');

            Route::post('/reset-password', [NewPasswordController::class, 'store'])
                ->middleware(['guest:'.config('fortify.guard')])
                ->name('password.update');
        }

        // Registration
        if (Features::enabled(Features::registration())) {
            if ($enableViews) {
                Route::get('/register', [RegisteredUserController::class, 'create'])
                    ->middleware(['guest:'.config('fortify.guard')])
                    ->name('register');
            }

            Route::post('/register', [RegisteredUserController::class, 'store'])
                ->middleware(['guest:'.config('fortify.guard')]);
        }

        // Email Verification
        if (Features::enabled(Features::emailVerification())) {
            if ($enableViews) {
                Route::get('/email/verify', [EmailVerificationPromptController::class, '__invoke'])
                    ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
                    ->name('verification.notice');
            }

            Route::get('/email/verify/{id}/{hash}', [VerifyEmailController::class, '__invoke'])
                ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard'), 'signed', 'throttle:6,1'])
                ->name('verification.verify');

            Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
                ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard'), 'throttle:6,1'])
                ->name('verification.send');
        }

        // Profile Management
        if (Features::enabled(Features::updateProfileInformation())) {
            Route::put('/user/profile-information', [ProfileInformationController::class, 'update'])
                ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
                ->name('user-profile-information.update');
        }

        // Password Management
        if (Features::enabled(Features::updatePasswords())) {
            Route::put('/user/password', [PasswordController::class, 'update'])
                ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
                ->name('user-password.update');
        }

        // Password Confirmation
        if ($enableViews) {
            Route::get('/user/confirm-password', [ConfirmablePasswordController::class, 'show'])
                ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
                ->name('password.confirm');
        }

        Route::get('/user/confirmed-password-status', [ConfirmedPasswordStatusController::class, 'show'])
            ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')])
            ->name('password.confirmation');

        Route::post('/user/confirm-password', [ConfirmablePasswordController::class, 'store'])
            ->middleware([config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')]);

        // Two-Factor Authentication
        if (Features::enabled(Features::twoFactorAuthentication())) {
            if ($enableViews) {
                Route::get('/two-factor-challenge', [TwoFactorAuthenticatedSessionController::class, 'create'])
                    ->middleware(['guest:'.config('fortify.guard')])
                    ->name('two-factor.login');
            }

            Route::post('/two-factor-challenge', [TwoFactorAuthenticatedSessionController::class, 'store'])
                ->middleware(['guest:'.config('fortify.guard')]);

            $twoFactorMiddleware = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirmPassword')
                ? [config('fortify.auth_middleware', 'auth').':'.config('fortify.guard'), 'password.confirm']
                : [config('fortify.auth_middleware', 'auth').':'.config('fortify.guard')];

            Route::post('/user/two-factor-authentication', [TwoFactorAuthenticationController::class, 'store'])
                ->middleware($twoFactorMiddleware)
                ->name('two-factor.enable');

            Route::post('/user/two-factor-recovery-codes', [RecoveryCodeController::class, 'store'])
                ->middleware($twoFactorMiddleware)
                ->name('two-factor.recovery-codes.store');

            Route::delete('/user/two-factor-authentication', [TwoFactorAuthenticationController::class, 'destroy'])
                ->middleware($twoFactorMiddleware)
                ->name('two-factor.disable');

            Route::get('/user/two-factor-qr-code', [TwoFactorQrCodeController::class, 'show'])
                ->middleware($twoFactorMiddleware)
                ->name('two-factor.qr-code');

            Route::get('/user/two-factor-secret-key', [TwoFactorSecretKeyController::class, 'show'])
                ->middleware($twoFactorMiddleware)
                ->name('two-factor.secret-key');

            Route::get('/user/two-factor-recovery-codes', [RecoveryCodeController::class, 'index'])
                ->middleware($twoFactorMiddleware)
                ->name('two-factor.recovery-codes');
        }
    });

    /*
    |--------------------------------------------------------------------------
    | Settings Routes
    |--------------------------------------------------------------------------
    |
    | User settings and profile management routes.
    |
    */
    require __DIR__.'/settings.php';
});
