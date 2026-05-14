<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'patient_id', 'sender_id', 'sender_type',
        'subject', 'body', 'is_read', 'parent_id',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'created_at' => 'datetime',
    ];

    public function patient() { return $this->belongsTo(Patient::class); }
    public function sender()  { return $this->belongsTo(User::class, 'sender_id'); }
    public function parent()  { return $this->belongsTo(Message::class, 'parent_id'); }
    public function replies() { return $this->hasMany(Message::class, 'parent_id'); }
}