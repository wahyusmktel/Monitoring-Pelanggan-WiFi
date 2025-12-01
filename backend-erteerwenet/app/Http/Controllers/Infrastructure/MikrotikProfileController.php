<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Models\MikrotikProfile;
use App\Services\MikrotikService;
use Illuminate\Http\Request;

class MikrotikProfileController extends Controller
{
    protected $mikrotik;

    public function __construct(MikrotikService $mikrotik)
    {
        $this->mikrotik = $mikrotik;
    }

    // 1. Get Data dari DB Lokal (Cepat)
    public function index()
    {
        return response()->json(MikrotikProfile::all());
    }

    // 2. Sync: Tarik dari Router -> Simpan ke DB
    public function sync()
    {
        try {
            if (!$this->mikrotik->isConnected()) {
                return response()->json(['message' => 'Gagal koneksi ke MikroTik'], 500);
            }

            $profiles = $this->mikrotik->getPppProfiles();
            $count = 0;

            foreach ($profiles as $p) {
                MikrotikProfile::updateOrCreate(
                    ['name' => $p['name']],
                    [
                        'local_address' => $p['local-address'] ?? null,
                        'remote_address' => $p['remote-address'] ?? null,
                        'rate_limit' => $p['rate-limit'] ?? null,
                        'dns_server' => $p['dns-server'] ?? null,
                        'default' => ($p['default'] ?? 'false') === 'true'
                    ]
                );
                $count++;
            }

            return response()->json(['message' => "Berhasil sync {$count} profile."]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // 3. Store: Simpan ke Router -> Lalu ke DB
    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|unique:mikrotik_profiles,name']);

        try {
            // A. Push ke Router
            $this->mikrotik->addPppProfile($request->all());

            // B. Simpan ke DB Lokal
            $profile = MikrotikProfile::create($request->all());

            return response()->json(['message' => 'Profile berhasil dibuat', 'data' => $profile]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }
}
