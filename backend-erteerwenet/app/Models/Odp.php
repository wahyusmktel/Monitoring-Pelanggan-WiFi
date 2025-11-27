<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Odp extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'latitude',
        'longitude',
        'odc_id',
        'capacity',
        'used_capacity',
        'status',
    ];

    // Agar frontend menerima field 'odc_name' otomatis
    protected $appends = ['odc_name'];

    // Relasi: ODP milik ODC
    public function odc()
    {
        return $this->belongsTo(Odc::class);
    }

    // Accessor untuk odc_name
    public function getOdcNameAttribute()
    {
        return $this->odc ? $this->odc->name : 'Unknown ODC';
    }

    // Relasi: ODP punya banyak Customer
    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}
