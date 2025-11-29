<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Services\MikrotikService;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\CustomerPppoeAccount;
use Illuminate\Support\Facades\Log;

class MikrotikController extends Controller
{
    protected $mikrotik;

    public function __construct(MikrotikService $mikrotik)
    {
        $this->mikrotik = $mikrotik;
    }

    /**
     * Ambil daftar Secret untuk ditampilkan di tabel
     */
    public function index()
    {
        try {
            $secrets = $this->mikrotik->getPppSecrets();

            $data = collect($secrets)->map(function ($secret) {
                // Ambil nama/username dengan aman
                $name = $secret['name'] ?? 'Unknown';

                // Cek sinkronisasi
                $exists = CustomerPppoeAccount::where('username', $name)->exists();

                return [
                    // Gunakan '??' untuk memberikan nilai default jika data kosong/tidak ada
                    'id' => $secret['.id'] ?? null,
                    'name' => $name,
                    'password' => $secret['password'] ?? '****',
                    'profile' => $secret['profile'] ?? 'default', // <--- INI SUMBER ERRORNYA (Sekarang aman)
                    'local_address' => $secret['local-address'] ?? '-',
                    'remote_address' => $secret['remote-address'] ?? '-',
                    'last_logged_out' => $secret['last-logged-out'] ?? '-',
                    'disabled' => ($secret['disabled'] ?? 'false') === 'true', // Handle boolean string
                    'is_synced' => $exists
                ];
            });

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data: ' . $e->getMessage()], 500);
        }
    }

    public function syncCustomers()
    {
        try {
            // 1. Ambil data dari MikroTik
            $secrets = $this->mikrotik->getPppSecrets();

            $synced = 0;
            $new = 0;

            foreach ($secrets as $secret) {
                // Asumsi: 'name' di secret adalah ID Pelanggan atau Username unik
                // Kita coba cari customer berdasarkan name (username di mikrotik)
                // Atau jika belum ada, kita bisa buat (opsional)

                // Contoh Logic: Mapping berdasarkan kolom 'name' di MikroTik == 'customer_number' di DB
                $customer = Customer::where('customer_number', $secret['name'])->first();

                if ($customer) {
                    // Jika ketemu, kita update status paketnya atau info lainnya
                    // Misal service profile di mikrotik = paket di database (perlu mapping ID)
                    $customer->notes = "Synced from MikroTik Profile: " . ($secret['profile'] ?? '-');
                    $customer->save();
                    $synced++;
                } else {
                    // OPSI: Jika mau auto-create customer dari MikroTik
                    // Customer::create([...]);
                    // $new++;

                    // Untuk sekarang kita log saja yang tidak ketemu
                    Log::info("MikroTik Secret {$secret['name']} tidak ditemukan di database lokal.");
                }
            }

            return response()->json([
                'message' => "Sinkronisasi selesai.",
                'details' => [
                    'total_mikrotik' => count($secrets),
                    'synced_db' => $synced,
                    'new_db' => $new
                ],
                'data_preview' => array_slice($secrets, 0, 5) // Kirim 5 data sampel buat debug
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mapping user MikroTik ke Customer Database
     */
    public function mapCustomer(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'mikrotik_name' => 'required|string',
            // Tambahan data opsional dari frontend jika ada, atau ambil nanti
        ]);

        try {
            // Cek apakah username ini sudah dipakai orang lain?
            $exists = CustomerPppoeAccount::where('username', $request->mikrotik_name)->exists();
            if ($exists) {
                return response()->json(['message' => 'Username PPPoE ini sudah terhubung ke pelanggan lain!'], 400);
            }

            // Simpan ke tabel mapping baru
            CustomerPppoeAccount::create([
                'customer_id' => $request->customer_id,
                'username' => $request->mikrotik_name,
                // Password/Profile bisa diupdate nanti saat sync ulang atau dikirim dari frontend
            ]);

            // Update status pelanggan jadi active jika masih pending
            $customer = Customer::find($request->customer_id);
            if ($customer->status == 'pending') {
                $customer->status = 'active';
                $customer->save();
            }

            return response()->json([
                'message' => "Berhasil menghubungkan {$request->mikrotik_name} ke pelanggan",
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mapping: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Ambil daftar Profile PPPoE
     */
    public function getProfiles()
    {
        try {
            // Pastikan koneksi hidup
            if (!$this->mikrotik->isConnected()) {
                return response()->json(['message' => 'Gagal koneksi ke MikroTik'], 500);
            }

            $profiles = $this->mikrotik->getPppProfiles();

            // Debugging: Cek apakah data kosong
            if (empty($profiles)) {
                return response()->json([], 200); // Return array kosong valid
            }

            // Format data agar lebih bersih (opsional)
            $formatted = collect($profiles)->map(function ($p) {
                return [
                    '.id' => $p['.id'] ?? null,
                    'name' => $p['name'],
                    'rate_limit' => $p['rate-limit'] ?? '-',
                ];
            });

            return response()->json($formatted);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error ambil profile: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Monitoring Status Online/Offline Pelanggan
     */
    public function monitorCustomers()
    {
        try {
            // 1. Ambil Pelanggan Aktif yang punya akun PPPoE
            $customers = Customer::where('status', 'active')
                ->whereHas('pppoe_account')
                ->with(['pppoe_account', 'package'])
                ->get();

            // 2. Ambil Data Live dari MikroTik dengan RETRY MANUAL
            $activeConnections = [];
            $retryCount = 0;
            $maxRetries = 3;
            $success = false;
            $lastError = '';

            while ($retryCount < $maxRetries && !$success) {
                try {
                    // Cek koneksi
                    if (!$this->mikrotik->isConnected()) {
                        throw new \Exception("Client disconnected");
                    }

                    // Coba ambil data
                    $activeConnections = $this->mikrotik->getActivePppConnections();
                    $success = true; // Berhasil!

                } catch (\Exception $e) {
                    $retryCount++;
                    $lastError = $e->getMessage();
                    // Tunggu 1 detik sebelum coba lagi
                    sleep(1);
                }
            }

            // Jika setelah 3x percobaan masih gagal, return error 500
            if (!$success) {
                return response()->json([
                    'message' => 'Gagal mengambil data MikroTik setelah ' . $maxRetries . ' percobaan. Error: ' . $lastError
                ], 500);
            }

            // Ubah array MikroTik menjadi Key-Value biar pencarian cepat (Key: username)
            $activeMap = [];
            foreach ($activeConnections as $conn) {
                // Pastikan key 'name' ada (username pppoe)
                if (isset($conn['name'])) {
                    $activeMap[$conn['name']] = $conn;
                }
            }

            // 3. Gabungkan Data
            $monitoringData = $customers->map(function ($customer) use ($activeMap) {
                // Safety check jika relasi pppoe_account null (walaupun sudah di filter whereHas)
                if (!$customer->pppoe_account) return null;

                $username = $customer->pppoe_account->username;
                $isOnline = isset($activeMap[$username]);
                $activeData = $isOnline ? $activeMap[$username] : null;

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'customer_number' => $customer->customer_number,
                    'package' => $customer->package ? $customer->package->name : '-',
                    'pppoe_user' => $username,
                    'status' => $isOnline ? 'online' : 'offline',
                    // Data teknis dari MikroTik
                    'ip_address' => $activeData['address'] ?? '-',
                    'uptime' => $activeData['uptime'] ?? '-',
                    'caller_id' => $activeData['caller-id'] ?? '-', // MAC Address
                ];
            })
                ->filter() // Hapus data null jika ada error relasi
                ->values(); // Reset index array JSON

            // Hitung Statistik
            $stats = [
                'total' => $monitoringData->count(),
                'online' => $monitoringData->where('status', 'online')->count(),
                'offline' => $monitoringData->where('status', 'offline')->count(),
            ];

            return response()->json([
                'stats' => $stats,
                'data' => $monitoringData
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error monitoring: ' . $e->getMessage()], 500);
        }
    }
}
