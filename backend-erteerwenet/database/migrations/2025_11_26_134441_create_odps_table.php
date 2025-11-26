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
    Schema::create('odps', function (Blueprint $table) {
        $table->id();
        // Relasi ke tabel ODC. Jika ODC dihapus, ODP-nya ikut hilang.
        $table->foreignId('odc_id')->constrained('odcs')->onDelete('cascade');
        
        $table->string('name');
        $table->string('location');
        $table->decimal('latitude', 10, 8)->nullable();
        $table->decimal('longitude', 11, 8)->nullable();
        $table->integer('capacity')->default(8); // Biasanya ODP 8/16 port
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
        Schema::dropIfExists('odps');
    }
};
