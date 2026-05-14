<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientInsurance extends Model
{

    protected $fillable = [
        'patient_id', 'insurance_type', 'medi_cal_id', 'county_mhp',
        'commercial_payer', 'member_id', 'group_number',
        'subscriber_name', 'subscriber_dob', 'cob_order',
        'prior_auth_required', 'prior_auth_number', 'prior_auth_expiry',
    ];

    protected $casts = [
        'prior_auth_required' => 'boolean',
        'subscriber_dob'      => 'date',
        'prior_auth_expiry'   => 'date',
    ];

    public function patient() { return $this->belongsTo(Patient::class); }
}