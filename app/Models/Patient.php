<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'dob', 'gender', 'phone', 'email',
        'address', 'city', 'state', 'zip',
        'assigned_provider_id', 'presenting_concerns',
        'modality_preference', 'status', 'intake_completed_at',
    ];

    protected $casts = [
        'presenting_concerns' => 'array',
        'dob'                 => 'date',
        'intake_completed_at' => 'datetime',
    ];

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute(): int
    {
        return $this->dob->age;
    }

    public function provider()      { return $this->belongsTo(User::class, 'assigned_provider_id'); }
    public function insurance()     { return $this->hasOne(PatientInsurance::class); }
    public function consents()      { return $this->hasMany(Consent::class); }
    public function appointments()  { return $this->hasMany(Appointment::class); }
    public function clinicalNotes() { return $this->hasMany(ClinicalNote::class); }
    public function billingClaims() { return $this->hasMany(BillingClaim::class); }
    public function messages()      { return $this->hasMany(Message::class); }
}