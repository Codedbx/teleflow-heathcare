<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingClaim extends Model
{
    protected $fillable = [
        'patient_id', 'provider_id', 'clinical_note_id',
        'service_date', 'cpt_code', 'modifier', 'pos_code',
        'icd10_primary', 'icd10_secondary',
        'primary_payer', 'secondary_payer', 'cob_order',
        'prior_auth_number', 'prior_auth_expiry',
        'session_duration_minutes', 'amount',
        'validation_status', 'validation_results', 'claim_status',
    ];

    protected $casts = [
        'service_date'       => 'date',
        'prior_auth_expiry'  => 'date',
        'validation_results' => 'array',
        'amount'             => 'decimal:2',
    ];

    public function patient()      { return $this->belongsTo(Patient::class); }
    public function provider()     { return $this->belongsTo(User::class, 'provider_id'); }
    public function clinicalNote() { return $this->belongsTo(ClinicalNote::class); }
}