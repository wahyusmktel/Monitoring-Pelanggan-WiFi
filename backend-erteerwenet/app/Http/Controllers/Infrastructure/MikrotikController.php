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
     * Tampilkan data dari Database Lokal (Bukan nembak MikroTik langsung)
     */
    public function index()
    {
        // Ambil data dari database lokal, beserta relasi ke customer
        $accounts = CustomerPppoeAccount::with('customer')->get();

        return response()->json($accounts);
    }

    /**
     * Sinkronisasi Data: MikroTik -> Database Lokal
     */
    public function sync(Request $request)
    {
        try {
            if (!$this->mikrotik->isConnected()) {
                return response()->json(['message' => 'Gagal koneksi ke MikroTik'], 500);
            }

            // 1. Ambil Data dari MikroTik (Secrets & Active)
            $secrets = $this->mikrotik->getPppSecrets();
            $actives = $this->mikrotik->getActivePppConnections();

            // Buat Map Active Connections biar pencarian cepat (Key: username)
            $activeMap = [];
            foreach ($actives as $conn) {
                if (isset($conn['name'])) {
                    $activeMap[$conn['name']] = $conn;
                }
            }

            $syncedCount = 0;
            $newCount = 0;

            foreach ($secrets as $secret) {
                $name = $secret['name'] ?? null;
                if (!$name) continue;

                // A. Ambil Data Statis (Dari Secret)
                // Sanitasi: Ubah '-' jadi null
                $localAddress = ($secret['local-address'] ?? '-') === '-' ? null : $secret['local-address'];
                $remoteAddress = ($secret['remote-address'] ?? '-') === '-' ? null : $secret['remote-address'];
                $callerId = ($secret['caller-id'] ?? '-') === '-' ? null : $secret['caller-id'];

                // B. Ambil Data Dinamis (Dari Active Connection jika ada)
                $activeData = [];
                if (isset($activeMap[$name])) {
                    $userActive = $activeMap[$name];

                    // Prioritaskan data Live untuk Address & Caller ID
                    if (isset($userActive['address'])) $remoteAddress = $userActive['address'];
                    if (isset($userActive['caller-id'])) $callerId = $userActive['caller-id'];

                    $activeData = [
                        'service' => $userActive['service'] ?? 'pppoe',
                        'uptime' => $userActive['uptime'] ?? null,
                        'session_id' => $userActive['.id'] ?? null,
                        'encoding' => $userActive['encoding'] ?? null,
                        'limit_bytes_in' => $userActive['limit-bytes-in'] ?? '0',
                        'limit_bytes_out' => $userActive['limit-bytes-out'] ?? '0',
                        'radius' => $userActive['radius'] ?? 'false',
                        'last_seen_at' => now(),
                    ];
                } else {
                    // Jika Offline, reset data dinamis agar tidak menyimpan data basi
                    $activeData = [
                        'service' => 'pppoe',
                        'uptime' => null,
                        'session_id' => null,
                        'encoding' => null,
                        'limit_bytes_in' => null, // Atau biarkan nilai terakhir (opsional)
                        'limit_bytes_out' => null,
                        'radius' => 'false',
                        // 'last_seen_at' tidak diupdate biar ketahuan kapan terakhir onlinenya
                    ];
                }

                // C. Siapkan Data Final untuk DB
                $dataToUpdate = array_merge([
                    'password' => $secret['password'] ?? '',
                    'profile' => $secret['profile'] ?? 'default',
                    'local_address' => $localAddress,
                    'remote_address' => $remoteAddress,
                    'caller_id' => $callerId,
                ], $activeData);


                // --- LOGIKA AUTO-CONNECT (Sama seperti sebelumnya) ---
                $matchedCustomer = Customer::where('customer_number', $name)->first();
                $currentAccount = CustomerPppoeAccount::where('username', $name)->first();

                if ($matchedCustomer && (!$currentAccount || is_null($currentAccount->customer_id))) {
                    $dataToUpdate['customer_id'] = $matchedCustomer->id;
                }
                // -----------------------------------------------------

                // D. Eksekusi Simpan ke DB
                $account = CustomerPppoeAccount::updateOrCreate(
                    ['username' => $name],
                    $dataToUpdate
                );

                if ($account->wasRecentlyCreated) {
                    $newCount++;
                } else {
                    $syncedCount++;
                }
            }

            return response()->json([
                'message' => "Sinkronisasi Selesai. {$newCount} data baru, {$syncedCount} data diperbarui.",
                'total' => $newCount + $syncedCount
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Sync Error: ' . $e->getMessage()], 500);
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
        // 1. Sanitasi Data Input
        $input = $request->all();
        $fieldsToNull = ['local_address', 'remote_address', 'caller_id', 'password', 'profile'];
        foreach ($fieldsToNull as $field) {
            if (isset($input[$field]) && ($input[$field] === '-' || trim($input[$field]) === '')) {
                $input[$field] = null;
            }
        }
        $request->merge($input);

        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'mikrotik_name' => 'required|string',
            'password' => 'nullable|string',
            'profile' => 'nullable|string',
            'local_address' => 'nullable|ip',
            'remote_address' => 'nullable|ip',
            'caller_id' => 'nullable|string',
        ]);

        try {
            // --- LOGIKA CLEANUP: Lepaskan akun lain milik pelanggan ini (Swap Logic) ---
            $oldAccount = CustomerPppoeAccount::where('customer_id', $request->customer_id)
                ->where('username', '!=', $request->mikrotik_name)
                ->first();

            if ($oldAccount) {
                $oldAccount->delete();
            }
            // ------------------------------------------------------------

            // 2. Siapkan Data Default (Offline State)
            $finalRemoteAddress = $request->remote_address;
            $finalLocalAddress = $request->local_address;
            $finalCallerId = $request->caller_id;

            // Data teknis default (null/kosong jika offline)
            $technicalData = [
                'service' => 'pppoe',
                'uptime' => null,
                'session_id' => null,
                'encoding' => null,
                'limit_bytes_in' => '0',
                'limit_bytes_out' => '0',
                'radius' => 'false',
                'last_seen_at' => now(),
            ];

            // 3. Cek Koneksi Aktif (Online State) -> Timpa data default dengan data live
            if ($this->mikrotik->isConnected()) {
                $actives = $this->mikrotik->getActivePppConnections();
                $userActive = collect($actives)->firstWhere('name', $request->mikrotik_name);

                if ($userActive) {
                    // Prioritaskan data Live untuk Address & Caller ID
                    if (isset($userActive['address'])) $finalRemoteAddress = $userActive['address'];
                    if (isset($userActive['caller-id'])) $finalCallerId = $userActive['caller-id'];

                    // Isi data teknis dari Active Connection
                    $technicalData = [
                        'service' => $userActive['service'] ?? 'pppoe',
                        'uptime' => $userActive['uptime'] ?? null,
                        'session_id' => $userActive['.id'] ?? null,
                        'encoding' => $userActive['encoding'] ?? null,
                        'limit_bytes_in' => $userActive['limit-bytes-in'] ?? '0',
                        'limit_bytes_out' => $userActive['limit-bytes-out'] ?? '0',
                        'radius' => $userActive['radius'] ?? 'false',
                        'last_seen_at' => now(),
                    ];
                }
            }

            // 4. Gabungkan Semua Data
            $saveData = array_merge([
                'customer_id' => $request->customer_id,
                'username' => $request->mikrotik_name,
                'password' => $request->password,
                'profile' => $request->profile,
                'local_address' => $finalLocalAddress,
                'remote_address' => $finalRemoteAddress,
                'caller_id' => $finalCallerId,
            ], $technicalData); // Merge dengan data teknis

            // 5. Simpan ke Database (Update jika username ada, Create jika belum)
            CustomerPppoeAccount::updateOrCreate(
                ['username' => $request->mikrotik_name],
                $saveData
            );

            // 6. Update status pelanggan jadi Active
            $customer = Customer::find($request->customer_id);
            if ($customer && $customer->status == 'pending') {
                $customer->status = 'active';
                $customer->save();
            }

            return response()->json([
                'message' => "Berhasil menghubungkan {$request->mikrotik_name}. Status: " . (isset($userActive) ? 'ONLINE (Data Live Diupdate)' : 'OFFLINE (Data Secret Disimpan)'),
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

    // /**
    //  * Monitoring Status Online/Offline Pelanggan
    //  */
    // public function monitorCustomers()
    // {
    //     try {
    //         // 1. Ambil Pelanggan Aktif yang punya akun PPPoE
    //         $customers = Customer::where('status', 'active')
    //             ->whereHas('pppoe_account')
    //             ->with(['pppoe_account', 'package'])
    //             ->get();

    //         // 2. Ambil Data Live dari MikroTik dengan RETRY MANUAL
    //         $activeConnections = [];
    //         $retryCount = 0;
    //         $maxRetries = 3;
    //         $success = false;
    //         $lastError = '';

    //         while ($retryCount < $maxRetries && !$success) {
    //             try {
    //                 // Cek koneksi
    //                 if (!$this->mikrotik->isConnected()) {
    //                     throw new \Exception("Client disconnected");
    //                 }

    //                 // Coba ambil data
    //                 $activeConnections = $this->mikrotik->getActivePppConnections();
    //                 $success = true; // Berhasil!

    //             } catch (\Exception $e) {
    //                 $retryCount++;
    //                 $lastError = $e->getMessage();
    //                 // Tunggu 1 detik sebelum coba lagi
    //                 sleep(1);
    //             }
    //         }

    //         // Jika setelah 3x percobaan masih gagal, return error 500
    //         if (!$success) {
    //             return response()->json([
    //                 'message' => 'Gagal mengambil data MikroTik setelah ' . $maxRetries . ' percobaan. Error: ' . $lastError
    //             ], 500);
    //         }

    //         // Ubah array MikroTik menjadi Key-Value biar pencarian cepat (Key: username)
    //         $activeMap = [];
    //         foreach ($activeConnections as $conn) {
    //             // Pastikan key 'name' ada (username pppoe)
    //             if (isset($conn['name'])) {
    //                 $activeMap[$conn['name']] = $conn;
    //             }
    //         }

    //         // 3. Gabungkan Data
    //         $monitoringData = $customers->map(function ($customer) use ($activeMap) {
    //             // Safety check jika relasi pppoe_account null (walaupun sudah di filter whereHas)
    //             if (!$customer->pppoe_account) return null;

    //             $username = $customer->pppoe_account->username;
    //             $isOnline = isset($activeMap[$username]);
    //             $activeData = $isOnline ? $activeMap[$username] : null;

    //             return [
    //                 'id' => $customer->id,
    //                 'name' => $customer->name,
    //                 'customer_number' => $customer->customer_number,
    //                 'package' => $customer->package ? $customer->package->name : '-',
    //                 'pppoe_user' => $username,
    //                 'status' => $isOnline ? 'online' : 'offline',
    //                 // Data teknis dari MikroTik
    //                 'ip_address' => $activeData['address'] ?? '-',
    //                 'uptime' => $activeData['uptime'] ?? '-',
    //                 'caller_id' => $activeData['caller-id'] ?? '-', // MAC Address
    //             ];
    //         })
    //             ->filter() // Hapus data null jika ada error relasi
    //             ->values(); // Reset index array JSON

    //         // Hitung Statistik
    //         $stats = [
    //             'total' => $monitoringData->count(),
    //             'online' => $monitoringData->where('status', 'online')->count(),
    //             'offline' => $monitoringData->where('status', 'offline')->count(),
    //         ];

    //         return response()->json([
    //             'stats' => $stats,
    //             'data' => $monitoringData
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json(['message' => 'Error monitoring: ' . $e->getMessage()], 500);
    //     }
    // }

    /**
     * Tampilkan Data Monitoring dari Database Lokal
     */
    public function monitorCustomers()
    {
        try {
            // Ambil Pelanggan Aktif yang punya akun PPPoE
            $customers = Customer::where('status', 'active')
                ->whereHas('pppoe_account')
                ->with(['pppoe_account', 'package'])
                ->get();

            $monitoringData = $customers->map(function ($customer) {
                if (!$customer->pppoe_account) return null;

                $account = $customer->pppoe_account;

                // Logika Status: Jika 'uptime' atau 'session_id' ada isinya, berarti Online
                $isOnline = !empty($account->session_id) && !empty($account->uptime);

                return [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'customer_number' => $customer->customer_number,
                    'package' => $customer->package ? $customer->package->name : '-',
                    'pppoe_user' => $account->username,
                    'status' => $isOnline ? 'online' : 'offline',
                    'ip_address' => $account->remote_address ?? '-',
                    'uptime' => $account->uptime ?? '-',
                    'caller_id' => $account->caller_id ?? '-',
                    'last_seen' => $account->last_seen_at, // Opsional: info kapan terakhir online
                ];
            })
                ->filter()
                ->values();

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

    /**
     * Sync Data Active Connection (Update Status Online/Offline)
     */
    public function syncActive()
    {
        try {
            if (!$this->mikrotik->isConnected()) {
                return response()->json(['message' => 'Gagal koneksi ke MikroTik'], 500);
            }

            // 1. Ambil Data Aktif dari MikroTik
            $actives = $this->mikrotik->getActivePppConnections();
            $activeUsernames = [];

            // 2. Update Akun yang sedang ONLINE
            foreach ($actives as $active) {
                $username = $active['name'] ?? null;
                if (!$username) continue;

                $activeUsernames[] = $username; // Simpan username yang online

                // Update data realtime ke database
                CustomerPppoeAccount::where('username', $username)->update([
                    'service' => $active['service'] ?? 'pppoe',
                    'uptime' => $active['uptime'] ?? null,
                    'session_id' => $active['.id'] ?? null,
                    'encoding' => $active['encoding'] ?? null,
                    'limit_bytes_in' => $active['limit-bytes-in'] ?? '0',
                    'limit_bytes_out' => $active['limit-bytes-out'] ?? '0',
                    'radius' => $active['radius'] ?? 'false',
                    'caller_id' => $active['caller-id'] ?? null,
                    'remote_address' => $active['address'] ?? null, // IP Client
                    'last_seen_at' => now(),
                ]);
            }

            // 3. Update Akun yang OFFLINE (Reset session data)
            // Semua akun di database yang username-nya TIDAK ADA di daftar $activeUsernames
            // berarti sedang Offline. Kita reset data sesinya.
            CustomerPppoeAccount::whereNotIn('username', $activeUsernames)->update([
                'uptime' => null,
                'session_id' => null,
                'encoding' => null,
                // 'caller_id' => null, // Opsional: Jangan hapus caller_id biar ada history
                // 'remote_address' => null, // Opsional: Jangan hapus IP biar ada history
            ]);

            return response()->json([
                'message' => 'Sinkronisasi status koneksi berhasil.',
                'online_count' => count($activeUsernames)
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Sync Error: ' . $e->getMessage()], 500);
        }
    }
}
