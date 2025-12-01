<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MikrotikProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'local_address',
        'remote_address',
        'rate_limit',
        'dns_server',
        'default'
    ];

    protected $casts = [
        'default' => 'boolean',
    ];
}
