<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('billing_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_active')->default(false);
            $table->integer('generate_day')->default(1); // Tanggal 1-28
            $table->string('generate_time')->default('09:00'); // Format HH:mm
            $table->boolean('is_recurring')->default(true);
            $table->timestamp('last_run_at')->nullable(); // Untuk mencatat kapan terakhir jalan
            $table->timestamps();
        });

        // Insert default setting (hanya butuh 1 baris data untuk sistem ini)
        DB::table('billing_settings')->insert([
            'is_active' => false,
            'generate_day' => 1,
            'generate_time' => '09:00',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_settings');
    }
};
