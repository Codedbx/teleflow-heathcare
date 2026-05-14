<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /* ─────────────────────────────────────────────────────────────────────
     | GET /settings
     ┗──────────────────────────────────────────────────────────────────── */
    public function index()
    {
        $providers = User::whereIn('role', ['clinician', 'admin'])
            ->select('id', 'name', 'email', 'role', 'provider_type', 'npi_number')
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role,
                'provider_type' => $u->provider_type,
                'npi_number'    => $u->npi_number,
            ]);

        // Static practice config (in a real app this would come from a settings table)
        $practice = [
            'name'             => 'Integrative Healthcare Alliance',
            'address'          => '1234 Wellness Blvd, Suite 200',
            'city'             => 'Los Angeles',
            'state'            => 'CA',
            'zip'              => '90028',
            'npi'              => '1234567890',
            'taxonomy_code'    => '193200000X',
            'medi_cal_id'      => 'MC-CA-78234',
            'phone'            => '(310) 555-0180',
            'email'            => 'admin@teleflow.demo',
        ];

        $webhookUrl = config('app.url') . '/api/webhooks/intake';

        return Inertia::render('Settings/Index', [
            'providers'   => $providers,
            'practice'    => $practice,
            'webhook_url' => $webhookUrl,
        ]);
    }
}