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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null'); // Opsional

            $table->decimal('amount', 10, 2);
            $table->date('payment_date')->nullable(); // Null jika belum bayar
            $table->date('due_date');

            $table->enum('status', ['pending', 'paid', 'overdue', 'cancelled'])->default('pending');
            $table->string('payment_method')->nullable(); // Cash, Transfer, dll

            // Untuk fitur token
            $table->string('token', 20)->nullable();
            $table->enum('token_status', ['unused', 'active', 'expired'])->default('unused');
            $table->dateTime('token_expiry')->nullable();

            $table->integer('billing_month'); // 1-12
            $table->integer('billing_year');  // 2024

            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
