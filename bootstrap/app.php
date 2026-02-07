<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

return Application::configure(basePath: dirname(__DIR__))
    /*
    |--------------------------------------------------------------------------
    | Routing
    |--------------------------------------------------------------------------
    | Central domains, tenant domains, API and console routes
    */
    ->withRouting(
        using: function () {
            $centralDomains = config('tenancy.central_domains', []);

            /*
            |--------------------------------------------------------------
            | Central (Admin / Platform)
            |--------------------------------------------------------------
            */
            foreach ($centralDomains as $domain) {
                Route::middleware('web')
                    ->domain($domain)
                    ->group(base_path('routes/web.php'));
            }

            /*
            |--------------------------------------------------------------
            | Tenant (Customer / Client)
            |--------------------------------------------------------------
            */
            Route::middleware([
                'web',
                InitializeTenancyByDomain::class,
                PreventAccessFromCentralDomains::class,
            ])->group(base_path('routes/tenant.php'));

            /*
            |--------------------------------------------------------------
            | API Routes (Central & Tenant)
            |--------------------------------------------------------------
            */
            Route::prefix('api')
                ->middleware([
                    'api',
                    InitializeTenancyByDomain::class,
                ])
                ->group(base_path('routes/api.php'));
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    
    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    */
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->redirectGuestsTo(function (\Illuminate\Http\Request $request) {
            if (function_exists('tenancy') && tenancy()->initialized) {
                return route('tenant.login');
            }

            return route('login');
        });
    })
    
    /*
    |--------------------------------------------------------------------------
    | Exception Handling
    |--------------------------------------------------------------------------
    */
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();