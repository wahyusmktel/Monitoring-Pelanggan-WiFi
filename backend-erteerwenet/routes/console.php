<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Jalankan command billing kita SETIAP MENIT
// Command kita punya logic sendiri untuk mengecek tanggal/jam, jadi aman dijalankan tiap menit.
Schedule::command('billing:auto-generate')->everyMinute();
