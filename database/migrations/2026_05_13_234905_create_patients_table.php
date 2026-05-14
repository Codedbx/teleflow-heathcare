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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('dob');
            $table->string('gender')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state', 2)->default('CA');
            $table->string('zip', 10)->nullable();
            $table->foreignId('assigned_provider_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('presenting_concerns')->nullable();
            $table->enum('modality_preference', ['video', 'audio', 'in_person'])->default('video');
            $table->enum('status', ['pending_intake', 'active', 'inactive'])->default('pending_intake');
            $table->timestamp('intake_completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
