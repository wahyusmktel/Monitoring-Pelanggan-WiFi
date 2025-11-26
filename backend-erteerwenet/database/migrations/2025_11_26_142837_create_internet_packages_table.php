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
    Schema::create('internet_packages', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->text('description');
        $table->integer('speed'); // Mbps
        $table->integer('quota')->default(0); // 0 = Unlimited
        $table->decimal('price', 10, 2);
        $table->integer('duration')->default(30); // Hari
        $table->boolean('is_active')->default(true);
        $table->json('features')->nullable(); // Array string fitur
        $table->enum('category', ['basic', 'standard', 'premium', 'enterprise']);
        $table->integer('max_devices')->default(1);
        $table->decimal('setup_fee', 10, 2)->default(0);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internet_packages');
    }
};
