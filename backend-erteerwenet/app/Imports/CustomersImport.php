<?php

namespace App\Imports;

use App\Models\Customer;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CustomersImport implements ToModel, WithHeadingRow, WithValidation
{
    private $lastId = 0;

    public function __construct()
    {
        // Cari ID terakhir yang ada di DB saat inisialisasi
        $lastCustomer = Customer::where('customer_number', 'like', '79%')
            ->orderBy('customer_number', 'desc')
            ->first();

        $this->lastId = $lastCustomer ? intval($lastCustomer->customer_number) : 790000;
    }

    public function model(array $row)
    {
        $this->lastId++;
        $newId = (string) $this->lastId;

        return new Customer([
            'name'            => $row['name'],
            'email'           => $row['email'],
            'phone'           => $row['phone'],
            'address'         => $row['address'],

            // PERUBAHAN DISINI:
            'latitude'        => $row['latitude'] ?? null,  // Ambil lat dari excel
            'longitude'       => $row['longitude'] ?? null, // Ambil long dari excel
            'odp_id'          => null, // Kosongkan dulu
            'package_id'      => null, // Kosongkan dulu

            'status'          => 'pending', // Ubah ke pending karena belum ada Paket/ODP
            'is_active'       => true,
            'customer_number' => $newId,
            'password'        => Hash::make($newId),
            'must_change_password' => true,
            'installation_date' => now(),
        ]);
    }

    public function rules(): array
    {
        return [
            'name'      => 'required',
            'email'     => 'required|email|unique:customers,email',
            'phone'     => 'required',
            'address'   => 'required',
            // Validasi ODP & Paket dihapus, ganti validasi koordinat (opsional)
            'latitude'  => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ];
    }
}
