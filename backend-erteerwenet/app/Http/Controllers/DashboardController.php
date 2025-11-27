<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Payment;
use App\Models\Olt;
use App\Models\Odc;
use App\Models\Odp;
use App\Models\InternetPackage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Main Stats (Card Atas)
        $stats = [
            'totalCustomers' => Customer::count(),
            'activeCustomers' => Customer::where('status', 'active')->count(),
            'inactiveCustomers' => Customer::where('status', 'inactive')->count(),
            'suspendedCustomers' => Customer::where('status', 'suspended')->count(),

            'totalRevenue' => Payment::where('status', 'paid')->sum('amount'),
            'monthlyRevenue' => Payment::where('status', 'paid')
                ->whereMonth('payment_date', Carbon::now()->month)
                ->whereYear('payment_date', Carbon::now()->year)
                ->sum('amount'),

            'pendingPayments' => Payment::where('status', 'pending')->count(),
            'overduePayments' => Payment::where('status', 'overdue')->count(),

            'totalOLT' => Olt::count(),
            'totalODC' => Odc::count(),
            'totalODP' => Odp::count(),

            'activePackages' => InternetPackage::where('is_active', true)->count(),
            'totalPackages' => InternetPackage::count(),
        ];

        // 2. Revenue Chart (Last 6 Months)
        $revenueData = Payment::select(
            DB::raw("DATE_FORMAT(payment_date, '%b') as month"), // Jan, Feb
            DB::raw('SUM(amount) as revenue'),
            DB::raw('COUNT(DISTINCT customer_id) as customers')
        )
            ->where('status', 'paid')
            ->where('payment_date', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('payment_date') // Note: orderBy date asli mungkin perlu penyesuaian di frontend atau raw query
            ->get();

        // Jika data kosong, kirim dummy structure agar frontend tidak error
        if ($revenueData->isEmpty()) {
            $revenueData = [];
        }

        // 3. Customer Growth (Last 6 Months Registration)
        $customerGrowthData = Customer::select(
            DB::raw("DATE_FORMAT(created_at, '%b') as month"),
            DB::raw('COUNT(*) as newCustomers')
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('created_at')
            ->get();

        // Hitung running total untuk totalCustomers per bulan
        $totalCust = 0; // Harusnya ambil base total sebelum 6 bulan lalu, tapi kita simplify
        $growthDataWithTotal = $customerGrowthData->map(function ($item) use (&$totalCust) {
            $totalCust += $item->newCustomers;
            return [
                'month' => $item->month,
                'newCustomers' => $item->newCustomers,
                'totalCustomers' => $totalCust // Ini angka kasar pertumbuhan periode ini
            ];
        });

        // 4. Payment Status Distribution
        $paymentStatusData = [
            ['name' => 'Lunas', 'value' => Payment::where('status', 'paid')->count(), 'color' => '#10B981'],
            ['name' => 'Menunggu', 'value' => Payment::where('status', 'pending')->count(), 'color' => '#F59E0B'],
            ['name' => 'Jatuh Tempo', 'value' => Payment::where('status', 'overdue')->count(), 'color' => '#EF4444'],
        ];

        // 5. Package Distribution (Active Customers)
        $packageDistribution = Customer::where('status', 'active')
            ->join('internet_packages', 'customers.package_id', '=', 'internet_packages.id')
            ->select('internet_packages.name as name', DB::raw('count(*) as value'))
            ->groupBy('internet_packages.name')
            ->get()
            ->map(function ($item, $key) {
                $colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
                return [
                    'name' => $item->name,
                    'value' => $item->value,
                    'color' => $colors[$key % count($colors)]
                ];
            });

        // 6. Network Status
        $networkStatus = [
            [
                'type' => 'OLT',
                'active' => Olt::where('status', 'active')->count(),
                'inactive' => Olt::where('status', '!=', 'active')->count(),
                'total' => Olt::count()
            ],
            [
                'type' => 'ODC',
                'active' => Odc::where('status', 'active')->count(),
                'inactive' => Odc::where('status', '!=', 'active')->count(),
                'total' => Odc::count()
            ],
            [
                'type' => 'ODP',
                'active' => Odp::where('status', 'active')->count(),
                'inactive' => Odp::where('status', '!=', 'active')->count(),
                'total' => Odp::count()
            ],
        ];

        return response()->json([
            'stats' => $stats,
            'revenueData' => $revenueData,
            'customerGrowthData' => $growthDataWithTotal,
            'paymentStatusData' => $paymentStatusData,
            'packageDistribution' => $packageDistribution,
            'networkStatus' => $networkStatus
        ]);
    }
}
