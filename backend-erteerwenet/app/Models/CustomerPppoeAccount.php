<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerPppoeAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'username',
        'password',
        'profile',
        'local_address',
        'remote_address',
        'caller_id',
        // Field Baru
        'service',
        'uptime',
        'session_id',
        'encoding',
        'limit_bytes_in',
        'limit_bytes_out',
        'radius',
        'last_seen_at'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
