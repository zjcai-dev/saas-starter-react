<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Tenant\UserController;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Guest Routes
    Route::middleware('guest')->group(function () {
        Route::get('login', [\App\Http\Controllers\Tenant\Auth\LoginController::class, 'create'])
            ->name('tenant.login');

        Route::post('login', [\App\Http\Controllers\Tenant\Auth\LoginController::class, 'store'])
            ->name('tenant.login.store');
    });

    // Authenticated Routes
    Route::middleware('auth')->group(function () {
        Route::post('logout', [\App\Http\Controllers\Tenant\Auth\LoginController::class, 'destroy'])
            ->name('tenant.logout');

        Route::get('/dashboard', [\App\Http\Controllers\Tenant\DashboardController::class, 'index'])
            ->name('tenant.dashboard');
            
        // Default redirect to dashboard
        Route::get('/', function () {
            return redirect()->route('tenant.dashboard');
        });

        Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);

        // Load Tenant Settings Routes (Profile, Password, 2FA)
        require __DIR__.'/tenant-settings.php';
    });
});
