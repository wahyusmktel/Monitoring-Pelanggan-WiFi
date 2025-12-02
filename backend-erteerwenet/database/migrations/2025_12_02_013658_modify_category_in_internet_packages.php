<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ubah definisi kolom ENUM untuk menambahkan 'family'
        DB::statement("ALTER TABLE internet_packages MODIFY COLUMN category ENUM('basic', 'standard', 'premium', 'enterprise', 'family') NOT NULL");
    }

    public function down(): void
    {
        // Kembalikan ke semula jika rollback (Hati-hati, data 'family' bisa error/hilang)
        DB::statement("ALTER TABLE internet_packages MODIFY COLUMN category ENUM('basic', 'standard', 'premium', 'enterprise') NOT NULL");
    }
};
