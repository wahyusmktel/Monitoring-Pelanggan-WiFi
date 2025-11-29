<?php

namespace App\Services;

use RouterOS\Client;
use RouterOS\Query;
use Illuminate\Support\Facades\Log;
use Exception;

class MikrotikService
{
    protected ?Client $client = null;

    public function __construct()
    {
        // Jangan langsung throw di constructor, cukup coba connect,
        // kalau gagal biarkan $client = null.
        $this->initClient();
    }

    protected function initClient(): void
    {
        try {
            $this->client = new Client([
                'host'     => env('MIKROTIK_HOST'),
                'user'     => env('MIKROTIK_USER'),
                'pass'     => env('MIKROTIK_PASS'),
                'port'     => (int) env('MIKROTIK_PORT', 8728),
                'timeout'  => (int) env('MIKROTIK_TIMEOUT', 60),   // <-- naikin timeout
                'attempts' => (int) env('MIKROTIK_ATTEMPTS', 2),
            ]);
        } catch (Exception $e) {
            Log::error('Gagal inisialisasi MikroTik Client', [
                'error' => $e->getMessage(),
                'host'  => env('MIKROTIK_HOST'),
            ]);
            $this->client = null;
        }
    }

    /**
     * Pastikan selalu punya client yang "sehat".
     */
    protected function getClient(): Client
    {
        if (!$this->client) {
            $this->initClient();
        }

        if (!$this->client) {
            throw new Exception('Tidak bisa terhubung ke MikroTik (client null).');
        }

        return $this->client;
    }

    public function isConnected(): bool
    {
        return $this->client !== null;
    }

    /**
     * Helper umum untuk call MikroTik dengan retry & reconnect
     */
    protected function callWithRetry(string $path, ?callable $builder = null, int $maxRetries = 3)
    {
        $attempt = 0;
        $lastException = null;

        while ($attempt < $maxRetries) {
            $attempt++;

            try {
                $client = $this->getClient();

                $query = new Query($path);
                if ($builder) {
                    // builder boleh memodifikasi query
                    $query = $builder($query) ?? $query;
                }

                $start = microtime(true);
                $result = $client->query($query)->read();
                $duration = round(microtime(true) - $start, 3);

                Log::info("MikroTik query sukses", [
                    'path'    => $path,
                    'attempt' => $attempt,
                    'count'   => is_array($result) ? count($result) : null,
                    'time'    => $duration . 's',
                ]);

                return $result;
            } catch (\Throwable $e) {
                $lastException = $e;

                Log::warning("MikroTik query gagal", [
                    'path'    => $path,
                    'attempt' => $attempt,
                    'error'   => $e->getMessage(),
                ]);

                // putuskan client biar next attempt re-init
                $this->client = null;

                // kecilkan delay sendiri kalau mau
                usleep(300_000); // 0.3 detik
            }
        }

        throw new Exception(
            'Gagal memanggil MikroTik setelah '
                . $maxRetries
                . ' percobaan. Error terakhir: '
                . ($lastException ? $lastException->getMessage() : 'unknown')
        );
    }

    /**
     * Ambil semua data PPP Secrets
     */
    public function getPppSecrets()
    {
        // bisa ditambah filter kalau mau (misal hanya service=pppoe)
        return $this->callWithRetry('/ppp/secret/print', function (Query $q) {
            // Contoh: kalau mau proplist biar respon lebih kecil dan cepat:
            // $q->equal('.proplist', 'name,password,profile,local-address,remote-address,last-logged-out,disabled,comment');
            return $q;
        });
    }

    /**
     * Ambil status user active (opsional, buat monitoring nanti)
     */
    public function getActivePppConnections()
    {
        return $this->callWithRetry('/ppp/active/print');
    }

    /**
     * Ambil daftar Profile PPPoE
     */
    public function getPppProfiles()
    {
        return $this->callWithRetry('/ppp/profile/print');
    }

    /**
     * Buat PPPoE Secret Baru
     */
    public function createPppSecret($data)
    {
        return $this->callWithRetry('/ppp/secret/add', function (Query $q) use ($data) {
            return $q
                ->equal('name', $data['name'])
                ->equal('password', $data['password'])
                ->equal('profile', $data['profile'])
                ->equal('service', 'pppoe')
                ->equal('comment', $data['comment'] ?? '');
        });
    }
}
