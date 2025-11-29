<?php

use App\Services\MikrotikService;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/test-mikrotik', function (MikrotikService $service) {
    try {
        if ($service->isConnected()) {
            $data = $service->getPppSecrets();
            return response()->json([
                'status' => 'Sukses',
                'jumlah_secret' => count($data),
                'data_pertama' => $data[0] ?? 'Kosong'
            ]);
        } else {
            return response()->json(['status' => 'Gagal Konek (Client Null)'], 500);
        }
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'Error Exception',
            'message' => $e->getMessage()
        ], 500);
    }
});
