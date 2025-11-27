<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Customer;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

    // METHOD BARU: Monitoring Stats
    public function monitoring(Request $request)
    {
        // 1. Statistik Ringkasan (Card Atas)
        $totalRevenue = Payment::where('status', 'paid')->sum('amount');
        $totalPayments = Payment::count();
        $paidCount = Payment::where('status', 'paid')->count();
        $pendingCount = Payment::where('status', 'pending')->count();
        $overdueCount = Payment::where('status', 'overdue')->count();

        // Rata-rata pembayaran
        $avgPayment = $paidCount > 0 ? $totalRevenue / $paidCount : 0;

        // 2. Data Grafik Bulanan (Last 12 Months)
        $monthlyStats = Payment::select(
            DB::raw('billing_year as year'),
            DB::raw('billing_month as month'),
            DB::raw('SUM(amount) as totalRevenue'),
            DB::raw('COUNT(*) as totalPayments'),
            DB::raw('SUM(CASE WHEN status = "paid" THEN 1 ELSE 0 END) as paidCount'),
            DB::raw('SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pendingCount'),
            DB::raw('SUM(CASE WHEN status = "overdue" THEN 1 ELSE 0 END) as overdueCount')
        )
            ->groupBy('billing_year', 'billing_month')
            ->orderBy('billing_year', 'desc')
            ->orderBy('billing_month', 'desc')
            ->limit(12)
            ->get();

        // 3. Data Distribusi Metode Pembayaran
        $methodStats = Payment::where('status', 'paid')
            ->select('payment_method', DB::raw('count(*) as count'), DB::raw('sum(amount) as value'))
            ->groupBy('payment_method')
            ->get();

        // 4. Top Customer (Berdasarkan total bayar)
        $customerStats = Payment::where('payments.status', 'paid')
            ->join('customers', 'payments.customer_id', '=', 'customers.id')
            ->select(
                'customers.id',
                'customers.name as customerName',
                'customers.customer_number as customerId',
                DB::raw('count(payments.id) as totalPayments'),
                DB::raw('sum(payments.amount) as totalAmount'),
                DB::raw('max(payments.payment_date) as lastPayment')
            )
            ->groupBy('customers.id', 'customers.name', 'customers.customer_number')
            ->orderByDesc('totalAmount')
            ->limit(10)
            ->get();

        return response()->json([
            'summary' => [
                'totalRevenue' => $totalRevenue,
                'totalPayments' => $totalPayments,
                'paidCount' => $paidCount,
                'pendingCount' => $pendingCount,
                'overdueCount' => $overdueCount,
                'averagePayment' => round($avgPayment),
            ],
            'monthly' => $monthlyStats,
            'methods' => $methodStats,
            'customers' => $customerStats
        ]);
    }
}
