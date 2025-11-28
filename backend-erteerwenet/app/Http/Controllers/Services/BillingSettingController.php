<?php

namespace App\Http\Controllers\Services;

use App\Http\Controllers\Controller;
use App\Models\BillingSetting;
use Illuminate\Http\Request;

class BillingSettingController extends Controller
{
    // Ambil Setting (Selalu ambil ID 1 karena single configuration)
    public function show()
    {
        $setting = BillingSetting::firstOrCreate(['id' => 1]);
        return response()->json($setting);
    }

    // Update Setting
    public function update(Request $request)
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
            'generate_day' => 'required|integer|min:1|max:28',
            'generate_time' => 'required|date_format:H:i',
            'is_recurring' => 'required|boolean',
        ]);

        $setting = BillingSetting::firstOrCreate(['id' => 1]);
        $setting->update($validated);

        return response()->json($setting);
    }
}
