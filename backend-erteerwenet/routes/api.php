<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Infrastructure\OltController;
use App\Http\Controllers\Infrastructure\OdcController;
use App\Http\Controllers\Infrastructure\OdpController;
use App\Http\Controllers\Services\PackageController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Infrastructure\PortMonitoringController;
use App\Http\Controllers\Infrastructure\NetworkMapController;
use App\Http\Controllers\Services\PaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Services\BillingSettingController;
use App\Http\Controllers\CustomerPortal\AuthController as CustomerAuthController;
use App\Http\Controllers\Infrastructure\MikrotikController;
use App\Http\Controllers\Infrastructure\MikrotikProfileController;
use App\Services\MikrotikService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route Login (Public)
Route::post('/login', [AuthController::class, 'login']);

// Group Route yang butuh Token (Protected)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::post('/customers/{id}/activate', [CustomerController::class, 'activate']);

    // Route untuk ambil list profile PPPoE (taruh di infrastructure group)
    Route::get('/infrastructure/mikrotik/profiles', [MikrotikController::class, 'getProfiles']);

    // OLT Routes
    Route::prefix('infrastructure')->group(function () {
        Route::get('/olts', [OltController::class, 'index']);
        Route::post('/olts', [OltController::class, 'store']);
        Route::get('/olts/{id}', [OltController::class, 'show']);
        Route::put('/olts/{id}', [OltController::class, 'update']);
        Route::delete('/olts/{id}', [OltController::class, 'destroy']);

        // Extra endpoint sesuai request di service frontend
        Route::get('/olts/{id}/available-ports', [OltController::class, 'getAvailablePorts']);

        // ODC Routes
        Route::get('/odcs', [OdcController::class, 'index']);
        Route::post('/odcs', [OdcController::class, 'store']);
        Route::get('/odcs/{id}', [OdcController::class, 'show']);
        Route::put('/odcs/{id}', [OdcController::class, 'update']);
        Route::delete('/odcs/{id}', [OdcController::class, 'destroy']);

        // Extra endpoint sesuai service frontend (getByOLT)
        Route::get('/olts/{oltId}/odcs', [OdcController::class, 'getByOlt']);

        // ODP Routes
        Route::get('/odps', [OdpController::class, 'index']);
        Route::post('/odps', [OdpController::class, 'store']);
        Route::get('/odps/{id}', [OdpController::class, 'show']);
        Route::put('/odps/{id}', [OdpController::class, 'update']);
        Route::delete('/odps/{id}', [OdpController::class, 'destroy']);

        // Extra endpoint sesuai service frontend
        Route::get('/odcs/{odcId}/odps', [OdpController::class, 'getByOdc']); // Get ODP by ODC ID
        // Route Khusus Monitoring
        Route::get('/monitoring/ports', [PortMonitoringController::class, 'index']);
        // Route Network Map
        Route::get('/map/locations', [NetworkMapController::class, 'index']);

        // Route Sync MikroTik
        Route::post('/mikrotik/sync', [MikrotikController::class, 'syncCustomers']);

        // Di dalam prefix 'infrastructure'
        Route::get('/mikrotik/secrets', [MikrotikController::class, 'index']);

        // Action Sync
        Route::post('/mikrotik/sync', [MikrotikController::class, 'sync']);

        // Di dalam prefix 'infrastructure'
        Route::post('/mikrotik/map', [MikrotikController::class, 'mapCustomer']);

        // Di dalam prefix 'infrastructure'
        Route::get('/mikrotik/monitor', [MikrotikController::class, 'monitorCustomers']);

        // Tambahkan route baru untuk sync active
        Route::post('/mikrotik/sync-active', [MikrotikController::class, 'syncActive']);

        Route::get('/profiles', [MikrotikProfileController::class, 'index']); // Get Local
        Route::post('/profiles', [MikrotikProfileController::class, 'store']); // Create Baru
        Route::post('/profiles/sync', [MikrotikProfileController::class, 'sync']); // Sync
        Route::put('/profiles/{id}', [MikrotikProfileController::class, 'update']);
        Route::delete('/profiles/{id}', [MikrotikProfileController::class, 'destroy']);
    });

    // Services Routes
    Route::prefix('services')->group(function () {
        // Packages
        Route::get('/packages', [PackageController::class, 'index']);
        Route::post('/packages', [PackageController::class, 'store']);
        Route::get('/packages/{id}', [PackageController::class, 'show']);
        Route::put('/packages/{id}', [PackageController::class, 'update']);
        Route::delete('/packages/{id}', [PackageController::class, 'destroy']);

        // Payments
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments/generate', [PaymentController::class, 'generateBilling']); // Generate Bulanan
        Route::post('/payments/{id}/pay', [PaymentController::class, 'pay']); // Bayar per ID
        Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);

        // Monitoring Route (Letakkan SEBELUM route dengan {id})
        Route::get('/payments/monitoring', [PaymentController::class, 'monitoring']);

        Route::get('/billing-settings', [BillingSettingController::class, 'show']);
        Route::post('/billing-settings', [BillingSettingController::class, 'update']);
    });

    // Route khusus ODP Available (sesuai frontend service path: /odps/available)
    Route::get('/odps/available', [OdpController::class, 'getAvailable']);

    // Customer Routes
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/stats', [CustomerController::class, 'stats']); // Pastikan stats sebelum {id}
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
    Route::post('/customers/import', [CustomerController::class, 'import']);
});

// Group khusus Customer Portal
Route::prefix('portal')->group(function () {
    Route::post('/login', [CustomerAuthController::class, 'login']);

    // Protected Routes (Harus punya token customer)
    Route::middleware(['auth:sanctum', 'ability:customer_token'])->group(function () { // atau cukup auth:sanctum jika tidak pakai ability spesifik
        Route::get('/dashboard', [CustomerAuthController::class, 'dashboard']);
        Route::post('/change-password', [CustomerAuthController::class, 'changePassword']);
    });
});
