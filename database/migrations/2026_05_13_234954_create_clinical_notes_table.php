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
        Schema::create('clinical_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users');
            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->date('session_date');
            $table->unsignedInteger('session_duration_minutes');
            $table->enum('modality', ['video', 'audio', 'in_person'])->default('video');
            $table->text('raw_notes')->nullable();
            $table->text('soap_subjective')->nullable();
            $table->text('soap_objective')->nullable();
            $table->text('soap_assessment')->nullable();
            $table->text('soap_plan')->nullable();
            $table->boolean('generated_by_ai')->default(false);
            $table->unsignedInteger('ai_prompt_tokens')->nullable();
            $table->unsignedInteger('ai_completion_tokens')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_notes');
    }
};
