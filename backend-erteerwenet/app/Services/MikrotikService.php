<?php

namespace App\Services;

use RouterOS\Client;
use RouterOS\Query;
use Illuminate\Support\Facades\Log;
use Exception;

class MikrotikService
{
    protected $client;

    public function __construct()
    {

        try {
            $this->client = new Client([
                'host' => env('MIKROTIK_HOST'),
                'user' => env('MIKROTIK_USER'),
                'pass' => env('MIKROTIK_PASS'),
                'port' => (int) env('MIKROTIK_PORT', 8728),
                'timeout' => 15, // Tambahkan timeout biar ga nunggu lama
                'attempts' => 3, // Coba 1x saja dul
            ]);
        } catch (Exception $e) {
            // --- EDIT BAGIAN INI UNTUK LIHAT ERROR ASLI ---
            // Jangan di throw dulu, kita dd (dump and die) biar kelihatan di network tab preview
            // dd([
            //     'Pesan Error' => $e->getMessage(),
            //     'Host' => env('MIKROTIK_HOST'),
            //     'Port' => env('MIKROTIK_PORT'),
            // ]);
            // ----------------------------------------------
            // Biarkan null jika koneksi gagal, nanti dicek di method
            $this->client = null;
        }
    }

    public function isConnected()
    {
        return $this->client !== null;
    }

    /**
     * Ambil semua data PPP Secrets
     */
    public function getPppSecrets()
    {
        if (!$this->client) {
            throw new Exception("Gagal terkoneksi ke MikroTik. Cek konfigurasi .env");
        }

        // Query ke /ppp/secret/print
        $query = new Query('/ppp/secret/print');
        return $this->client->query($query)->read();
    }

    /**
     * Ambil status user active (opsional, buat monitoring nanti)
     */
    public function getActivePppConnections()
    {
        if (!$this->client) {
            throw new Exception("Koneksi ke MikroTik terputus atau gagal inisialisasi.");
        }

        $query = new Query('/ppp/active/print');

        // Baca response
        $result = $this->client->query($query)->read();

        return $result;
    }

    /**
     * Ambil daftar Profile PPPoE
     */
    public function getPppProfiles()
    {
        if (!$this->client) {
            // Coba reconnect atau throw error
            throw new Exception("Koneksi MikroTik terputus/belum diinisialisasi.");
        }

        // Query yang benar untuk ambil profile
        $query = new Query('/ppp/profile/print');
        return $this->client->query($query)->read();
    }

    /**
     * Buat PPPoE Secret Baru
     */
    public function createPppSecret($data)
    {
        if (!$this->client) {
            throw new Exception("Gagal koneksi ke MikroTik");
        }

        $query = (new Query('/ppp/secret/add'))
            ->equal('name', $data['name'])
            ->equal('password', $data['password'])
            ->equal('profile', $data['profile'])
            ->equal('service', 'pppoe')
            ->equal('comment', $data['comment']); // Nama Pelanggan

        return $this->client->query($query)->read();
    }
}
