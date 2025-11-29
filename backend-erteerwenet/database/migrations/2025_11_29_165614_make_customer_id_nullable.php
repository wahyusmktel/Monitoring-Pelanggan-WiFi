<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_pppoe_accounts', function (Blueprint $table) {
            // Ubah kolom customer_id agar boleh kosong (NULL)
            $table->foreignId('customer_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('customer_pppoe_accounts', function (Blueprint $table) {
            // Kembalikan jadi wajib diisi (jika rollback)
            // Note: Ini bisa error jika ada data yang null saat rollback, tapi ok untuk dev
            $table->foreignId('customer_id')->nullable(false)->change();
        });
    }
};
