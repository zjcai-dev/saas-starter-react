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
        Schema::create('feature_plan', function (Blueprint $table) {
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained('features')->cascadeOnDelete();
            $table->string('value')->nullable(); // Limit or value of the feature
            $table->primary(['plan_id', 'feature_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_plan');
    }
};
