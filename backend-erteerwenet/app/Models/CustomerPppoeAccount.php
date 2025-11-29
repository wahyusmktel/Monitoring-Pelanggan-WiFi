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
        'remote_address'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
