<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\IntakeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;

/* ─── Root redirect ───────────────────────────────────────────────────────── */
Route::get('/', fn () => redirect()->route('dashboard'));

/* ─── Public intake (no auth — patient self-service) ─────────────────────── */
Route::get('/intake/{token}',  [IntakeController::class, 'show'])->name('intake.show');
Route::post('/intake/{token}', [IntakeController::class, 'submit'])->name('intake.submit');

/* ─── Guest only ──────────────────────────────────────────────────────────── */
Route::middleware('guest')->group(function () {
    Route::get('/login',  [AuthController::class, 'show'])->name('login');
    Route::post('/login', [AuthController::class, 'authenticate']);
});

/* ─── Authenticated ───────────────────────────────────────────────────────── */
Route::middleware('auth')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ── Dashboard — all roles ──────────────────────────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Patients — admin + clinician ───────────────────────────────────────
    Route::middleware('role:admin,clinician')->group(function () {
        Route::get('/patients/new',           [IntakeController::class,  'create'])->name('patients.create');
        Route::post('/api/patients/intake',   [IntakeController::class,  'store'])->name('patients.intake.store');
        Route::post('/patients/intake-token', [PatientController::class, 'generateIntakeToken'])->name('patients.intake-token');

        Route::resource('patients', PatientController::class)->except(['create', 'store']);
    });

    // ── Clinical Notes — admin + clinician ────────────────────────────────
    Route::middleware('role:admin,clinician')->group(function () {
        Route::get('/notes/assistant',     [NoteController::class, 'assistant'])->name('notes.assistant');
        Route::post('/api/notes/generate', [NoteController::class, 'generate'])->name('notes.generate');
        Route::resource('notes', NoteController::class)->except(['create', 'edit']);
    });

    // ── Appointments — admin + clinician ──────────────────────────────────
    Route::middleware('role:admin,clinician')->group(function () {
        Route::resource('appointments', AppointmentController::class);
    });

    // ── Messages — admin + clinician ──────────────────────────────────────
    Route::middleware('role:admin,clinician')->group(function () {
        Route::get('/messages',           [MessageController::class, 'index'])->name('messages.index');
        Route::get('/messages/{patient}', [MessageController::class, 'thread'])->name('messages.thread');
        Route::post('/messages',          [MessageController::class, 'send'])->name('messages.send');
    });

    // ── Billing — admin + biller (+ clinician read-only via validator) ────
    Route::middleware('role:admin,biller,clinician')->group(function () {
        Route::get('/billing/validator',   [BillingController::class, 'validator'])->name('billing.validator');
        Route::post('/billing/validate',   [BillingController::class, 'validate'])->name('billing.validate');
        Route::get('/billing/claims',      [BillingController::class, 'claims'])->name('billing.claims');
        Route::post('/billing/claims',     [BillingController::class, 'saveClaim'])->name('billing.claims.save');
    });

    // ── Settings — admin only ─────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    });

});