<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternetPackage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'speed',
        'quota',
        'price',
        'duration',
        'is_active',
        'features',
        'category',
        'max_devices',
        'setup_fee',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'features' => 'array', // Penting: Cast JSON ke Array
        'price' => 'decimal:2',
        'setup_fee' => 'decimal:2',
    ];
    
    // Tambahan helper attribute untuk warna (opsional, logika warna di frontend sudah ada sih)
    protected $appends = ['color'];

    public function getColorAttribute()
    {
        return match($this->category) {
            'basic' => 'blue',
            'standard' => 'green',
            'premium' => 'purple',
            'enterprise' => 'red',
            default => 'gray'
        };
    }
}