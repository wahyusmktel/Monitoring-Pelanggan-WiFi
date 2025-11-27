<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PaymentController extends Controller
{
    // List Pembayaran
    public function index(Request $request)
    {
        $query = Payment::with(['customer', 'subscription.package']);

        // Search
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->whereHas('customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('customer_number', 'like', "%{$search}%");
            });
        }

        // Filter Status
        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->get());
    }

    // Generate Tagihan Bulanan (Bulk)
    public function generateBilling(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
        ]);

        $month = $request->month;
        $year = $request->year;

        // Ambil semua customer aktif yang punya paket
        $customers = Customer::where('status', 'active')
            ->whereNotNull('package_id')
            ->with('package')
            ->get();

        $count = 0;
        foreach ($customers as $customer) {
            // Cek apakah tagihan bulan ini sudah ada?
            $exists = Payment::where('customer_id', $customer->id)
                ->where('billing_month', $month)
                ->where('billing_year', $year)
                ->exists();

            if (!$exists && $customer->package) {
                // Buat tagihan baru
                Payment::create([
                    'customer_id' => $customer->id,
                    'amount' => $customer->package->price, // Ambil harga dari paket saat ini
                    'due_date' => Carbon::create($year, $month, 20), // Jatuh tempo tgl 20
                    'status' => 'pending',
                    'billing_month' => $month,
                    'billing_year' => $year,
                    'description' => "Tagihan Internet {$customer->package->name} Periode {$month}/{$year}",
                    'token_status' => 'unused'
                ]);
                $count++;
            }
        }

        return response()->json(['message' => "Berhasil generate {$count} tagihan baru.", 'count' => $count]);
    }

    // Proses Pembayaran (Bayar & Generate Token)
    public function pay(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status == 'paid') {
            return response()->json(['message' => 'Tagihan sudah lunas'], 400);
        }

        // Update status pembayaran
        $payment->status = 'paid';
        $payment->payment_date = now();
        $payment->payment_method = 'Manual/Cash'; // Bisa dinamis dari request

        // Generate Token Unik (Format: TOKEN-XXXX-XXXX)
        $token = strtoupper('TOKEN-' . Str::random(4) . '-' . Str::random(4));
        $payment->token = $token;
        $payment->token_status = 'active';
        $payment->token_expiry = now()->addMonth(); // Token berlaku 1 bulan

        $payment->save();

        return response()->json([
            'message' => 'Pembayaran berhasil & Token dibuat',
            'data' => $payment
        ]);
    }
}
