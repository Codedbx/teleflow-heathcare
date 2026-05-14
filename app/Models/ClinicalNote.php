<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicalNote extends Model
{
    protected $fillable = [
        'patient_id', 'provider_id', 'appointment_id',
        'session_date', 'session_duration_minutes', 'modality',
        'raw_notes', 'soap_subjective', 'soap_objective', 'soap_assessment', 'soap_plan',
        'generated_by_ai', 'ai_prompt_tokens', 'ai_completion_tokens',
    ];

    protected $casts = [
        'session_date'     => 'date',
        'generated_by_ai'  => 'boolean',
    ];

    public function patient()     { return $this->belongsTo(Patient::class); }
    public function provider()    { return $this->belongsTo(User::class, 'provider_id'); }
    public function appointment() { return $this->belongsTo(Appointment::class); }
    public function billingClaim(){ return $this->hasOne(BillingClaim::class); }
}