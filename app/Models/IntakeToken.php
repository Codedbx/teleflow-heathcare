<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IntakeToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'created_by',
        'expires_at',
        'used',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at'    => 'datetime',
        'used'       => 'boolean',
    ];

    /**
     * Check if the token is still valid (not used and not expired).
     */
    public function isValid(): bool
    {
        return !$this->used && $this->expires_at->isFuture();
    }

    public function createdBy() { return $this->belongsTo(User::class, 'created_by'); }
}