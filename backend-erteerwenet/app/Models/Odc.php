<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Odc extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'latitude',
        'longitude',
        'olt_id',
        'capacity',
        'used_capacity',
        'status',
    ];

    // Agar frontend menerima field 'olt_name' otomatis
    protected $appends = ['olt_name'];

    // Relasi: ODC milik OLT
    public function olt()
    {
        return $this->belongsTo(Olt::class);
    }

    // Accessor untuk olt_name
    public function getOltNameAttribute()
    {
        // Ambil nama OLT dari relasi, jika ada
        return $this->olt ? $this->olt->name : 'Unknown OLT';
    }

    public function odps()
    {
        return $this->hasMany(Odp::class);
    }
}