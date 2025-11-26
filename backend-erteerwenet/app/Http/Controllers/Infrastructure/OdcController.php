<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Models\Odc;
use Illuminate\Http\Request;

class OdcController extends Controller
{
    public function index(Request $request)
    {
        // Eager load 'olt' biar query lebih cepat (N+1 problem)
        $query = Odc::with('olt');

        // 1. Filter Search (Nama ODC, Lokasi, atau Nama OLT)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('olt', function($subQ) use ($search) {
                      $subQ->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // 2. Filter Status
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        // 3. Filter by OLT ID
        if ($request->has('olt_id') && $request->olt_id != '' && $request->olt_id != 'all') {
            $query->where('olt_id', $request->olt_id);
        }

        // 4. Pagination
        $size = $request->input('size', 10);
        $page = $request->input('page', 1);
        
        $odcs = $query->latest()->paginate($size, ['*'], 'page', $page);

        return response()->json([
            'data' => $odcs->items(),
            'total' => $odcs->total(),
            'page' => $odcs->currentPage(),
            'size' => $odcs->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string',
            'olt_id' => 'required|exists:olts,id', // Pastikan OLT ID ada di tabel olts
            'capacity' => 'required|integer|min:1',
            'used_capacity' => 'required|integer|min:0|lte:capacity',
            'status' => 'required|in:active,inactive,maintenance',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $odc = Odc::create($validated);

        // Refresh model untuk memuat relasi/appends jika perlu
        return response()->json($odc, 201);
    }

    public function show($id)
    {
        return Odc::with('olt')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $odc = Odc::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'location' => 'sometimes|required|string',
            'olt_id' => 'sometimes|required|exists:olts,id',
            'capacity' => 'sometimes|required|integer|min:1',
            'used_capacity' => 'sometimes|required|integer|min:0',
            'status' => 'sometimes|required|in:active,inactive,maintenance',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $odc->update($validated);

        return response()->json($odc);
    }

    public function destroy($id)
    {
        $odc = Odc::findOrFail($id);
        $odc->delete();

        return response()->json(['message' => 'ODC deleted successfully']);
    }

    // Endpoint khusus: Ambil semua ODC berdasarkan ID OLT
    public function getByOlt($oltId)
    {
        $odcs = Odc::where('olt_id', $oltId)->get();
        return response()->json($odcs);
    }
}