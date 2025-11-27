<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'subscription_id',
        'amount',
        'payment_date',
        'due_date',
        'status',         // pending, paid, overdue, cancelled
        'payment_method',
        'token',
        'token_status',   // unused, active, expired
        'token_expiry',
        'billing_month',
        'billing_year',
        'description',
    ];

    protected $casts = [
        'payment_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
        'token_expiry' => 'datetime',
        'amount' => 'decimal:2',
        'billing_month' => 'integer',
        'billing_year' => 'integer',
    ];

    // Relasi: Pembayaran milik satu Customer
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // Relasi: Pembayaran terkait dengan satu Langganan (Opsional)
    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
