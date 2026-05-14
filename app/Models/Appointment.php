<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id', 'provider_id', 'scheduled_at',
        'duration_minutes', 'modality', 'status', 'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    public function patient()      { return $this->belongsTo(Patient::class); }
    public function provider()     { return $this->belongsTo(User::class, 'provider_id'); }
    public function clinicalNote() { return $this->hasOne(ClinicalNote::class); }
}