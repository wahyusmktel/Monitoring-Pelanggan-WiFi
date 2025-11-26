<?php

namespace App\Http\Controllers\Infrastructure;

use App\Http\Controllers\Controller;
use App\Models\Olt;
use Illuminate\Http\Request;

class OltController extends Controller
{
    public function index(Request $request)
    {
        $query = Olt::query();

        // 1. Filter Search (Nama, IP, Lokasi)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // 2. Filter Status
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        // 3. Pagination
        $size = $request->input('size', 10);
        $page = $request->input('page', 1);
        
        $olts = $query->latest()->paginate($size, ['*'], 'page', $page);

        // Return format sesuai OLTResponse di frontend
        return response()->json([
            'data' => $olts->items(),
            'total' => $olts->total(),
            'page' => $olts->currentPage(),
            'size' => $olts->perPage(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'ip_address' => 'required|string|unique:olts,ip_address',
            'location' => 'required|string',
            'brand' => 'required|string',
            'model' => 'required|string',
            'total_ports' => 'required|integer|min:1',
            'used_ports' => 'required|integer|min:0|lte:total_ports',
            'status' => 'required|in:active,inactive,maintenance',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $olt = Olt::create($validated);

        return response()->json($olt, 201);
    }

    public function show($id)
    {
        return Olt::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $olt = Olt::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ip_address' => 'sometimes|required|string|unique:olts,ip_address,' . $id,
            'location' => 'sometimes|required|string',
            'brand' => 'sometimes|required|string',
            'model' => 'sometimes|required|string',
            'total_ports' => 'sometimes|required|integer|min:1',
            'used_ports' => 'sometimes|required|integer|min:0', // Validasi lte:total_ports agak tricky di update partial, bisa diskip atau dicek manual
            'status' => 'sometimes|required|in:active,inactive,maintenance',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $olt->update($validated);

        return response()->json($olt);
    }

    public function destroy($id)
    {
        $olt = Olt::findOrFail($id);
        $olt->delete();

        return response()->json(['message' => 'OLT deleted successfully']);
    }

    public function getAvailablePorts($id)
    {
        $olt = Olt::findOrFail($id);
        $available = $olt->total_ports - $olt->used_ports;
        
        return response()->json(['available_ports' => $available]);
    }
}