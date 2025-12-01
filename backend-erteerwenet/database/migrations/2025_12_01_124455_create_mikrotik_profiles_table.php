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
        Schema::create('mikrotik_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Nama Profile (Key)
            $table->string('local_address')->nullable();
            $table->string('remote_address')->nullable();
            $table->string('rate_limit')->nullable(); // ex: 10M/10M
            $table->string('dns_server')->nullable();
            $table->boolean('default')->default(false); // Apakah ini profile default?
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mikrotik_profiles');
    }
};
