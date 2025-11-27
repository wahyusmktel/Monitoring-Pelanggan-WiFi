<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_number',
        'name',
        'email',
        'phone',
        'address',
        'latitude',
        'longitude',
        'odp_id',
        'package_id',
        'status',
        'installation_date',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'installation_date' => 'date:Y-m-d',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    // Relasi ke ODP
    public function odp()
    {
        return $this->belongsTo(Odp::class);
    }

    // Relasi ke Paket Internet
    public function package()
    {
        return $this->belongsTo(InternetPackage::class, 'package_id');
    }
}
