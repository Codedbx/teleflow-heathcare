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
        Schema::create('patient_insurances', function (Blueprint $table) {
             $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->enum('insurance_type', ['medi_cal', 'commercial', 'both', 'self_pay']);
            $table->string('medi_cal_id')->nullable();
            $table->string('county_mhp')->nullable();
            $table->string('commercial_payer')->nullable();
            $table->string('member_id')->nullable();
            $table->string('group_number')->nullable();
            $table->string('subscriber_name')->nullable();
            $table->date('subscriber_dob')->nullable();
            $table->enum('cob_order', ['medi_cal_primary', 'commercial_primary'])->nullable();
            $table->boolean('prior_auth_required')->default(false);
            $table->string('prior_auth_number')->nullable();
            $table->date('prior_auth_expiry')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_insurances');
    }
};
