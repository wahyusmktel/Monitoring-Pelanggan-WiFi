<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::with(['odp', 'package']); // Eager load relasi

        // 1. Search
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // 2. Filter Status
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        // 3. Filter ODP
        if ($request->has('odp_id') && $request->odp_id != 'all') {
            $query->where('odp_id', $request->odp_id);
        }

        // 4. Pagination atau All
        // Frontend pakai getCustomers() tanpa pagination parameter explicit di service,
        // tapi biasanya butuh semua data atau pagination. Kita default return all collection dulu
        // sesuai kode frontend: setCustomers(customersData)

        return response()->json($query->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'odp_id' => 'required|exists:odps,id',
            'package_id' => 'required|exists:internet_packages,id',
            'status' => 'required|in:pending,active,inactive,suspended',
            'installation_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $customer = Customer::create($validated);

        return response()->json($customer, 201);
    }

    public function show($id)
    {
        return Customer::with(['odp', 'package'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:customers,email,' . $id,
            'phone' => 'sometimes|required|string|max:20',
            'address' => 'sometimes|required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'odp_id' => 'sometimes|required|exists:odps,id',
            'package_id' => 'sometimes|required|exists:internet_packages,id',
            'status' => 'sometimes|required|in:pending,active,inactive,suspended',
            'installation_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        // Jika status diubah jadi 'active' DAN belum punya customer_number
        if (
            isset($validated['status']) &&
            $validated['status'] === 'active' &&
            is_null($customer->customer_number)
        ) {
            // Cari nomor terakhir yang depannya 79
            $latestCustomer = Customer::where('customer_number', 'like', '79%')
                ->orderBy('customer_number', 'desc')
                ->first();

            if ($latestCustomer) {
                // Jika ada, tambah 1 (Contoh: 790001 -> 790002)
                $nextId = intval($latestCustomer->customer_number) + 1;
            } else {
                // Jika belum ada sama sekali, mulai dari 790001
                $nextId = 790001;
            }

            // Masukkan ke array validated untuk di-update
            $validated['customer_number'] = (string) $nextId;
        }

        $customer->update($validated);

        return response()->json($customer);
    }

    public function destroy($id)
    {
        $customer = Customer::findOrFail($id);
        $customer->delete();

        return response()->json(['message' => 'Customer deleted successfully']);
    }

    public function stats()
    {
        return response()->json([
            'total' => Customer::count(),
            'active' => Customer::where('status', 'active')->count(),
            'pending' => Customer::where('status', 'pending')->count(),
            'inactive' => Customer::where('status', 'inactive')->count(),
        ]);
    }
}
