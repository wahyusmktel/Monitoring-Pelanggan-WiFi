<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'package_id',
        'monthly_fee',
        'start_date',
        'end_date',
        'status',    // active, inactive, suspended
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
        'monthly_fee' => 'decimal:2',
    ];

    // Relasi: Langganan milik satu Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Relasi: Langganan terhubung ke satu Paket Internet
    public function package()
    {
        return $this->belongsTo(InternetPackage::class, 'package_id');
    }

    // Relasi: Satu langganan bisa punya banyak riwayat pembayaran
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
