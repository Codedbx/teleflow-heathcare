<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'provider_type', 'npi_number',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function isAdmin(): bool      { return $this->role === 'admin'; }
    public function isClinician(): bool  { return $this->role === 'clinician'; }
    public function isBiller(): bool     { return $this->role === 'biller'; }

    public function patients()      { return $this->hasMany(Patient::class, 'assigned_provider_id'); }
    public function appointments()  { return $this->hasMany(Appointment::class, 'provider_id'); }
    public function clinicalNotes() { return $this->hasMany(ClinicalNote::class, 'provider_id'); }
    public function billingClaims() { return $this->hasMany(BillingClaim::class, 'provider_id'); }

    public function intakeTokens() { return $this->hasMany(IntakeToken::class, 'created_by'); }
}
