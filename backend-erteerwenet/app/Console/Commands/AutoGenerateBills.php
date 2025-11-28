<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BillingSetting;
use App\Models\Customer;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AutoGenerateBills extends Command
{
    // Nama command yang nanti dipanggil scheduler
    protected $signature = 'billing:auto-generate';

    protected $description = 'Generate tagihan internet otomatis sesuai setting database';

    public function handle()
    {
        // 1. Ambil Setting
        $setting = BillingSetting::first();

        // Cek apakah fitur aktif?
        if (!$setting || !$setting->is_active) {
            $this->info('Auto billing is inactive.');
            return;
        }

        $now = Carbon::now();

        // 2. Validasi Waktu Eksekusi
        // Cek Tanggal (Apakah hari ini tanggal yang diminta?)
        if ($now->day != $setting->generate_day) {
            return;
        }

        // Cek Jam (Apakah jam sekarang sama dengan jam setting?)
        // Kita cek format H:i (misal 09:00)
        if ($now->format('H:i') != $setting->generate_time) {
            return;
        }

        // Cek apakah sudah jalan hari ini? (Mencegah double run dalam 1 menit yang sama)
        if ($setting->last_run_at && $setting->last_run_at->isToday()) {
            $this->info('Billing already generated today.');
            return;
        }

        $this->info('Starting auto billing generation...');
        Log::info('Auto Billing Started.');

        // --- LOGIKA GENERATE TAGIHAN (Mirip PaymentController) ---
        $month = $now->month;
        $year = $now->year;

        $customers = Customer::where('status', 'active')
            ->whereNotNull('package_id')
            ->with('package')
            ->get();

        $count = 0;
        foreach ($customers as $customer) {
            // Cek duplikasi
            $exists = Payment::where('customer_id', $customer->id)
                ->where('billing_month', $month)
                ->where('billing_year', $year)
                ->exists();

            if (!$exists && $customer->package) {
                Payment::create([
                    'customer_id' => $customer->id,
                    'amount' => $customer->package->price,
                    'due_date' => Carbon::create($year, $month, 20),
                    'status' => 'pending',
                    'billing_month' => $month,
                    'billing_year' => $year,
                    'description' => "Auto Tagihan {$customer->package->name} Periode {$month}/{$year}",
                    'token_status' => 'unused'
                ]);
                $count++;
            }
        }

        // 3. Update Status Setting
        $setting->last_run_at = $now;

        // Jika setting "Sekali Saja" (Not Recurring), matikan setelah jalan
        if (!$setting->is_recurring) {
            $setting->is_active = false;
            Log::info('Auto Billing set to inactive (One-time run completed).');
        }

        $setting->save();

        $this->info("Success! Generated {$count} bills.");
        Log::info("Auto Billing Completed. Generated {$count} bills.");
    }
}
