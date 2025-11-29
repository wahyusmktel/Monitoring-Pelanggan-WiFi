<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens; // Tambahkan ini
use Illuminate\Notifications\Notifiable;

class Customer extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'customer_number',
        'name',
        'email',
        'password', // Tambah ini
        'must_change_password', // Tambah ini
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

    // Sembunyikan password saat return JSON
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'must_change_password' => 'boolean',
        'installation_date' => 'date:Y-m-d',
        'latitude' => 'float',
        'longitude' => 'float',
        'password' => 'hashed', // Auto hash
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

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Relasi ke Akun PPPoE
    public function pppoe_account()
    {
        return $this->hasOne(CustomerPppoeAccount::class);
    }
}
