<?php

namespace App\Http\Controllers\CustomerPortal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Customer;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'customer_number' => 'required|string', // Login pakai ID
            'password' => 'required|string',
        ]);

        $customer = Customer::where('customer_number', $request->customer_number)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            return response()->json(['message' => 'ID Pelanggan atau Password salah'], 401);
        }

        // Hapus token lama (opsional, biar single device login)
        $customer->tokens()->delete();

        // Buat Token
        $token = $customer->createToken('customer_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'customer' => $customer,
            'must_change_password' => $customer->must_change_password
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed', // butuh field new_password_confirmation
        ]);

        $customer = $request->user(); // Ambil user dari token

        // Cek password lama
        if (!Hash::check($request->current_password, $customer->password)) {
            return response()->json(['message' => 'Password lama salah'], 400);
        }

        // Update Password
        $customer->password = Hash::make($request->new_password);
        $customer->must_change_password = false; // Flag dimatikan
        $customer->save();

        return response()->json(['message' => 'Password berhasil diubah. Silakan lanjut ke dashboard.']);
    }

    public function dashboard(Request $request)
    {
        // Data untuk dashboard pelanggan (Tagihan, Profil)
        $customer = $request->user();

        // Load riwayat pembayaran & paket
        $customer->load(['package', 'payments' => function ($q) {
            $q->latest();
        }]);

        return response()->json($customer);
    }
}
