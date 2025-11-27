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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');
            $table->text('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Relasi ke ODP (Infrastructure)
            // Set null on delete: kalau ODP dihapus, data pelanggan tetap ada tapi odp_id jadi null
            $table->foreignId('odp_id')->nullable()->constrained('odps')->onDelete('set null');

            // Relasi ke Paket Internet (Services)
            $table->foreignId('package_id')->nullable()->constrained('internet_packages')->onDelete('set null');

            $table->enum('status', ['pending', 'active', 'inactive', 'suspended'])->default('pending');
            $table->date('installation_date')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
