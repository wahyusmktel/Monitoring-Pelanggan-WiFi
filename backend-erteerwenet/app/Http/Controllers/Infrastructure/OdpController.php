<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Models\Odp;
use Illuminate\Http\Request;

class OdpController extends Controller
{
    public function index(Request $request)
    {
        $query = Odp::with('odc'); // Eager load ODC

        // 1. Filter Search (Nama ODP, Lokasi, atau Nama ODC)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('odc', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Filter Status
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        // 3. Filter by ODC ID
        if ($request->has('odc_id') && $request->odc_id != '' && $request->odc_id != 'all') {
            $query->where('odc_id', $request->odc_id);
        }

        // 4. Pagination
        $size = $request->input('size', 10);
        $page = $request->input('page', 1);
        
        $odps = $query->latest()->paginate($size, ['*'], 'page', $page);

        return response()->json([
            'data' => $odps->items(),
            'total' => $odps->total(),
            'page' => $odps->currentPage(),
            'size' => $odps->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string',
            'odc_id' => 'required|exists:odcs,id', // Pastikan ODC ID valid
            'capacity' => 'required|integer|min:1',
            'used_capacity' => 'required|integer|min:0|lte:capacity',
            'status' => 'required|in:active,inactive,maintenance',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $odp = Odp::create($validated);

        return response()->json($odp, 201);
    }

    public function show($id)
    {
        return Odp::with('odc')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $odp = Odp::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string',
            'odc_id' => 'sometimes|required|exists:odcs,id',
            'capacity' => 'sometimes|required|integer|min:1',
            'used_capacity' => 'sometimes|required|integer|min:0',
            'status' => 'sometimes|required|in:active,inactive,maintenance',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $odp->update($validated);

        return response()->json($odp);
    }

    public function destroy($id)
    {
        $odp = Odp::findOrFail($id);
        $odp->delete();

        return response()->json(['message' => 'ODP deleted successfully']);
    }

    // Endpoint: Ambil ODP berdasarkan ODC ID
    public function getByOdc($odcId)
    {
        $odps = Odp::where('odc_id', $odcId)->get();
        return response()->json($odps);
    }

    // Endpoint: Ambil ODP yang masih punya slot kosong (untuk pendaftaran pelanggan)
    public function getAvailable()
    {
        // Cari ODP yang used_capacity < capacity
        $odps = Odp::whereRaw('used_capacity < capacity')->get();
        return response()->json($odps);
    }
}