<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Models\Olt;
use App\Models\Odc;
use App\Models\Odp;
use App\Models\Customer;
use Illuminate\Http\Request;

class NetworkMapController extends Controller
{
    public function index()
    {
        $locations = collect();

        // 1. Ambil OLT
        $olts = Olt::all()->map(function ($olt) {
            return [
                'id' => 'olt-' . $olt->id, // Prefix ID biar unik di frontend
                'name' => $olt->name,
                'lat' => (float) $olt->latitude,
                'lng' => (float) $olt->longitude,
                'address' => $olt->location,
                'type' => 'olt',
                'status' => $olt->status,
                'details' => [
                    'Merek' => $olt->brand . ' ' . $olt->model,
                    'IP Address' => $olt->ip_address,
                    'Total Port' => $olt->total_ports,
                    'Port Terpakai' => $olt->used_ports,
                ]
            ];
        });
        $locations = $locations->merge($olts);

        // 2. Ambil ODC
        $odcs = Odc::with('olt')->get()->map(function ($odc) {
            return [
                'id' => 'odc-' . $odc->id,
                'name' => $odc->name,
                'lat' => (float) $odc->latitude,
                'lng' => (float) $odc->longitude,
                'address' => $odc->location,
                'type' => 'odc',
                'status' => $odc->status,
                'details' => [
                    'Induk OLT' => $odc->olt ? $odc->olt->name : 'N/A',
                    'Kapasitas' => $odc->capacity,
                    'Terpakai' => $odc->used_capacity,
                ]
            ];
        });
        $locations = $locations->merge($odcs);

        // 3. Ambil ODP
        $odps = Odp::with('odc')->get()->map(function ($odp) {
            return [
                'id' => 'odp-' . $odp->id,
                'name' => $odp->name,
                'lat' => (float) $odp->latitude,
                'lng' => (float) $odp->longitude,
                'address' => $odp->location,
                'type' => 'odp',
                'status' => $odp->status,
                'details' => [
                    'Induk ODC' => $odp->odc ? $odp->odc->name : 'N/A',
                    'Kapasitas' => $odp->capacity,
                    'Terpakai' => $odp->used_capacity,
                ]
            ];
        });
        $locations = $locations->merge($odps);

        // 4. Ambil Customer
        $customers = Customer::with(['odp', 'package'])->get()->map(function ($cust) {
            return [
                'id' => 'cust-' . $cust->id,
                'name' => $cust->name,
                'lat' => (float) $cust->latitude,
                'lng' => (float) $cust->longitude,
                'address' => $cust->address,
                'type' => 'customer',
                'status' => $cust->status,
                'details' => [
                    'Paket' => $cust->package ? $cust->package->name : 'N/A',
                    'ODP' => $cust->odp ? $cust->odp->name : 'N/A',
                    'Telepon' => $cust->phone,
                ]
            ];
        });
        $locations = $locations->merge($customers);

        // Filter lokasi yang valid (punya lat/lng)
        $validLocations = $locations->filter(function ($loc) {
            return !empty($loc['lat']) && !empty($loc['lng']);
        })->values();

        return response()->json($validLocations);
    }
}
