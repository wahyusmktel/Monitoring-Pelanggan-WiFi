<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olt extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ip_address',
        'location',
        'latitude',
        'longitude',
        'brand',
        'model',
        'total_ports',
        'used_ports',
        'status',
    ];

    public function odcs()
    {
        return $this->hasMany(Odc::class);
    }
}