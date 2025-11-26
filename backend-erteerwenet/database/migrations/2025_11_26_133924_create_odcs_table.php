<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('odcs', function (Blueprint $table) {
        $table->id();
        // Relasi ke tabel OLT. Jika OLT dihapus, ODC-nya ikut terhapus (cascade)
        $table->foreignId('olt_id')->constrained('olts')->onDelete('cascade');
        
        $table->string('name');
        $table->string('location');
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 11, 8)->nullable();
        $table->integer('capacity')->default(32); // Biasanya ODC 32/64/144 core
        $table->integer('used_capacity')->default(0);
        $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('odcs');
    }
};
