<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Models\Odp;
use App\Models\Customer;
use Illuminate\Http\Request;

class PortMonitoringController extends Controller
{
    public function index(Request $request)
    {
        // Ambil semua ODP beserta relasi ODC dan Customer
        // Kita perlu data customer untuk tahu port mana saja yang dipakai
        $odps = Odp::with(['odc', 'customers'])->get();

        // Transformasi data agar sesuai dengan kebutuhan chart frontend
        $data = $odps->map(function ($odp) {
            $ports = [];
            // Loop sebanyak kapasitas ODP (misal 8 port)
            for ($i = 1; $i <= $odp->capacity; $i++) {
                // Cari customer yang pakai port ini (Logic sederhana: asumsi kita nanti simpan port_number di customer)
                // *Catatan: Di tabel customer saat ini belum ada kolom 'port_number'. 
                // Untuk sekarang kita simulasi saja berdasarkan urutan atau random agar tidak error.
                // Idealnya nanti tambah kolom 'odp_port_number' di tabel customers.

                // Simulasi logic port:
                // Kita anggap customer yang terhubung ke ODP ini memakan port secara berurutan
                $customer = $odp->customers->skip($i - 1)->first();

                if ($odp->status === 'maintenance') {
                    $status = 'maintenance';
                } elseif ($customer) {
                    $status = $customer->status === 'active' ? 'used' : 'maintenance'; // inactive dianggap maintenance/problem
                } else {
                    $status = 'available';
                }

                $ports[] = [
                    'portNumber' => $i,
                    'status' => $status,
                    'customerName' => $customer ? $customer->name : null,
                    'customerId' => $customer ? $customer->id : null,
                ];
            }

            // Hitung utilisasi
            $utilizationRate = $odp->capacity > 0 ? ($odp->used_capacity / $odp->capacity) * 100 : 0;

            return [
                'id' => $odp->id,
                'name' => $odp->name,
                'location' => $odp->location,
                'capacity' => $odp->capacity,
                'usedPorts' => $odp->used_capacity,
                'odcId' => $odp->odc_id,
                'odcName' => $odp->odc ? $odp->odc->name : 'Unknown',
                'odcPort' => 0, // Data ini belum ada di DB, default 0
                'status' => $odp->status, // active, inactive, maintenance
                'type' => 'distribution', // Default dulu
                'customerCount' => $odp->customers->count(),
                'ports' => $ports,
                'utilizationRate' => $utilizationRate,
                'availablePorts' => $odp->capacity - $odp->used_capacity
            ];
        });

        return response()->json($data);
    }
}
