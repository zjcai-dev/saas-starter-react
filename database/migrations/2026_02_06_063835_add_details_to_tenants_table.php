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
        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->constrained('plans');
            $table->string('status')->default('Trial')->comment('Trial, Active, Suspended, Canceled');
            $table->timestamp('subscription_ends_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropForeign(['plan_id']);
            $table->dropColumn(['plan_id', 'status', 'subscription_ends_at', 'trial_ends_at', 'is_active']);
        });
    }
};
