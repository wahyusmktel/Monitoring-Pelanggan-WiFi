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

    public function update(Request $request, $id)
    {
        $profile = MikrotikProfile::findOrFail($id);
        $oldName = $profile->name;

        $request->validate([
            'name' => 'required|string|unique:mikrotik_profiles,name,' . $id
        ]);

        try {
            // 1. Update di MikroTik
            if ($this->mikrotik->isConnected()) {
                $this->mikrotik->setPppProfile($oldName, $request->all());
            }

            // 2. Update di DB Lokal
            $profile->update($request->all());

            return response()->json(['message' => 'Profile berhasil diperbarui', 'data' => $profile]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $profile = MikrotikProfile::findOrFail($id);

        try {
            // 1. Hapus di MikroTik
            if ($this->mikrotik->isConnected()) {
                $this->mikrotik->removePppProfile($profile->name);
            }

            // 2. Hapus di DB Lokal
            $profile->delete();

            return response()->json(['message' => 'Profile berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal hapus: ' . $e->getMessage()], 500);
        }
    }
}
