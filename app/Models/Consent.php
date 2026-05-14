<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consent extends Model
{
    protected $fillable = [
        'patient_id', 'type', 'agreed_at', 'signature_text', 'ip_address',
    ];

    protected $casts = [
        'agreed_at' => 'datetime',
    ];

    public function patient() { return $this->belongsTo(Patient::class); }
}