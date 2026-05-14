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
        Schema::create('billing_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users');
            $table->foreignId('clinical_note_id')->nullable()->constrained('clinical_notes')->nullOnDelete();
            $table->date('service_date');
            $table->string('cpt_code', 10);
            $table->string('modifier', 10)->nullable();
            $table->string('pos_code', 5)->nullable();
            $table->string('icd10_primary', 10)->nullable();
            $table->string('icd10_secondary', 10)->nullable();
            $table->string('primary_payer')->nullable();
            $table->string('secondary_payer')->nullable();
            $table->string('cob_order')->nullable();
            $table->string('prior_auth_number')->nullable();
            $table->date('prior_auth_expiry')->nullable();
            $table->unsignedInteger('session_duration_minutes')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->enum('validation_status', ['not_checked', 'clean', 'warning', 'error'])->default('not_checked');
            $table->json('validation_results')->nullable();
            $table->enum('claim_status', ['draft', 'validated', 'submitted', 'paid', 'denied', 'appealing'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_claims');
    }
};
