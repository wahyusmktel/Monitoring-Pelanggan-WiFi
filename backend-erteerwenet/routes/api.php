<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Infrastructure\OltController;
use App\Http\Controllers\Infrastructure\OdcController;
use App\Http\Controllers\Infrastructure\OdpController;
use App\Http\Controllers\Services\PackageController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Infrastructure\PortMonitoringController;
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
    });

    // Services Routes
    Route::prefix('services')->group(function () {
        // Packages
        Route::get('/packages', [PackageController::class, 'index']);
        Route::post('/packages', [PackageController::class, 'store']);
        Route::get('/packages/{id}', [PackageController::class, 'show']);
        Route::put('/packages/{id}', [PackageController::class, 'update']);
        Route::delete('/packages/{id}', [PackageController::class, 'destroy']);
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
});
