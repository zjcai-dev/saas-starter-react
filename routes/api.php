<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\System\TenantController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Central and Tenant API endpoints
*/

/*
|----------------------------------------------------------------------
| System (Central) Routes
|----------------------------------------------------------------------
| These routes are accessible only from central domains
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('tenants/{tenant}/cancel', [TenantController::class, 'cancel']);
Route::post('tenants/{tenant}/restore', [TenantController::class, 'restore']);

/*
|----------------------------------------------------------------------
| Tenant Routes
|----------------------------------------------------------------------
| These routes are accessible only from tenant domains
*/
Route::middleware('tenant')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
});

/*
|----------------------------------------------------------------------
| Shared Routes
|----------------------------------------------------------------------
| These routes are accessible from both central and tenant domains
*/
Route::group(function () {
    //
});