<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Models\InternetPackage;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $query = InternetPackage::query();

        // 1. Search
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        // 2. Filter Category
        if ($request->has('category') && $request->category != 'all') {
            $query->where('category', $request->category);
        }

        // 3. Filter Status
        if ($request->has('status') && $request->status != 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // 4. Sorting
        if ($request->has('sort_by')) {
            $sortField = $request->sort_by; // name, price, speed
            $sortOrder = $request->input('sort_order', 'asc'); // asc/desc
            
            // Validasi field agar aman
            if (in_array($sortField, ['name', 'price', 'speed'])) {
                $query->orderBy($sortField, $sortOrder);
            }
        } else {
            $query->latest();
        }

        // Get ALL data (frontend kamu filternya di client-side, tapi API ini support server-side filter juga)
        // Kalau mau pagination ganti get() dengan paginate()
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'speed' => 'required|integer|min:1',
            'quota' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'category' => 'required|in:basic,standard,premium,enterprise',
            'max_devices' => 'required|integer|min:1',
            'setup_fee' => 'required|numeric|min:0',
            'features' => 'array', // Array of strings
            'is_active' => 'boolean'
        ]);

        $package = InternetPackage::create($validated);

        return response()->json($package, 201);
    }

    public function show($id)
    {
        return InternetPackage::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $package = InternetPackage::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'speed' => 'sometimes|required|integer|min:1',
            'quota' => 'sometimes|required|integer|min:0',
            'price' => 'sometimes|required|numeric|min:0',
            'duration' => 'sometimes|required|integer|min:1',
            'category' => 'sometimes|required|in:basic,standard,premium,enterprise',
            'max_devices' => 'sometimes|required|integer|min:1',
            'setup_fee' => 'sometimes|required|numeric|min:0',
            'features' => 'array',
            'is_active' => 'boolean'
        ]);

        $package->update($validated);

        return response()->json($package);
    }

    public function destroy($id)
    {
        $package = InternetPackage::findOrFail($id);
        $package->delete();

        return response()->json(['message' => 'Package deleted successfully']);
    }
}