<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillingSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'is_active',
        'generate_day',
        'generate_time',
        'is_recurring',
        'last_run_at'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_recurring' => 'boolean',
        'last_run_at' => 'datetime',
    ];
}
