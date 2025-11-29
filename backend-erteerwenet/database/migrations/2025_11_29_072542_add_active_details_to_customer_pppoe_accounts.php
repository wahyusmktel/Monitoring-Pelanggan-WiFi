<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customer_pppoe_accounts', function (Blueprint $table) {
            // Data dinamis dari Active Connection
            $table->string('service')->nullable()->after('profile'); // pppoe
            $table->string('uptime')->nullable()->after('caller_id');
            $table->string('session_id')->nullable()->after('uptime');
            $table->string('encoding')->nullable()->after('session_id');
            $table->string('limit_bytes_in')->nullable()->after('encoding');
            $table->string('limit_bytes_out')->nullable()->after('limit_bytes_in');
            $table->string('radius')->nullable()->after('limit_bytes_out'); // true/false string
            $table->timestamp('last_seen_at')->nullable(); // Kapan terakhir data ini diupdate
        });
    }

    public function down(): void
    {
        Schema::table('customer_pppoe_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'service',
                'uptime',
                'session_id',
                'encoding',
                'limit_bytes_in',
                'limit_bytes_out',
                'radius',
                'last_seen_at'
            ]);
        });
    }
};
