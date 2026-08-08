# TeleFlow

**A telehealth practice-management platform for California mental-health clinics — from patient intake through AI-assisted clinical documentation to Medi-Cal / CalAIM billing validation.**

TeleFlow models the real operational workflow of an outpatient behavioral-health practice: onboarding a patient, capturing insurance and consent, scheduling telehealth visits, drafting SOAP notes with an AI assistant, and running claims through a rules engine that encodes California payer requirements before they're ever submitted.

Built with **Laravel 12**, **Inertia.js + React**, and the **Anthropic Claude API**.

---

## Table of Contents

- [Why this project](#why-this-project)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Domain highlights](#domain-highlights)
- [Getting started](#getting-started)
- [Demo accounts](#demo-accounts)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Why this project

Healthcare software fails in the details — a wrong modifier, a missing prior authorization, a note that doesn't match the CPT code's time threshold. TeleFlow is an end-to-end demonstration of building software that takes those details seriously:

- **Real regulatory logic**, not placeholder CRUD. The billing validator encodes CPT duration bands, telehealth modifiers (`95` video / `93` audio-only), place-of-service codes, ICD-10 constraints, prior-auth rules, coordination-of-benefits order, and CalAIM-approved code sets.
- **AI used responsibly** — Claude drafts structured SOAP notes from raw session input, but the codes it suggests are re-checked against deterministic business rules rather than trusted blindly.
- **Role-based access control** enforced at the route layer for `admin`, `clinician`, and `biller`.
- **Patient self-service intake** via signed, token-based links — no account required for the patient.

## Features

| Module | What it does |
| --- | --- |
| **Patient intake** | Five-step onboarding wizard (personal, insurance, clinical history, consents, review). Staff can complete it directly or send a tokenized self-service link the patient fills out. |
| **Appointments** | Scheduling with modality tracking (video, audio, in-person) that feeds downstream billing logic. |
| **AI clinical notes** | An assistant that turns raw session notes into structured SOAP documentation via the Claude API, with suggested CPT coding. |
| **Billing** | A claim validator that runs each claim through eight compliance checks and a claims workspace to save and review results. |
| **Messaging** | Threaded provider-to-patient messaging. |
| **Dashboard** | Practice-wide overview — stats, upcoming appointments, and activity at a glance. |
| **Settings** | Admin-only practice configuration. |
| **Audit trail** | Activity logging across key actions. |

## Tech stack

**Backend**
- PHP 8.2+ / Laravel 12
- Inertia.js (server-driven SPA — no separate API layer to maintain)
- SQLite for local dev, MySQL-ready for production
- Queue-backed background jobs
- Anthropic Claude API (Messages API) for note generation

**Frontend**
- React 18 (JSX) via `@inertiajs/react`
- Vite 6
- Tailwind CSS 4
- Lucide icons
- A small hand-built UI kit (`Button`, `Card`, `Modal`, `SlideOver`, `Table`, `Tabs`, `Toast`, …)

## Architecture

TeleFlow uses **Inertia.js**, so Laravel controllers return React page components with props instead of JSON — one codebase, no duplicated API contract, server-side routing and auth throughout.

```
Browser (React pages)
        │  Inertia visits
        ▼
Laravel routes  ──►  role middleware  ──►  Controllers
                                              │
                          ┌───────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                 ClaudeNoteService   BillingValidatorService  PatientOnboardingService
                 (Anthropic API)     (deterministic rules)    (multi-step intake)
                          │
                          ▼
                     Eloquent models ──► SQLite / MySQL
```

Business logic is deliberately pushed **out of controllers and into service classes**, keeping controllers thin and the rules independently testable.

## Domain highlights

A few pieces worth reading if you're evaluating the code:

- **[`app/Services/BillingValidatorService.php`](app/Services/BillingValidatorService.php)** — the heart of the compliance engine. CPT-to-duration matching, modifier-vs-modality checks, POS validation, prior-auth detection, COB ordering, telehealth parity, ICD-10 prefix rules, and CalAIM approval — each as its own check that returns a structured result plus suggested corrections.
- **[`app/Services/ClaudeNoteService.php`](app/Services/ClaudeNoteService.php)** — prompt construction, Claude API integration with timeouts and error handling, and JSON parsing of the model's structured output.
- **[`routes/web.php`](routes/web.php)** — a clean map of the whole app and its role-based access boundaries.

## Getting started

### Prerequisites

- PHP 8.2+ with the standard Laravel extensions
- Composer
- Node.js 20+ and npm

### Setup

```bash
# 1. Clone and install
git clone <your-repo-url> teleflow
cd teleflow
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate

# 3. Database (SQLite by default)
touch database/database.sqlite
php artisan migrate --seed

# 4. Add your Claude API key to .env (see Configuration below)

# 5. Run everything (server + queue + logs + Vite) in one command
composer run dev
```

Then open **http://localhost:8000** and sign in with a demo account below.

> `composer run dev` runs the PHP server, the queue worker, log tailing, and the Vite dev server concurrently. Prefer separate terminals? Run `php artisan serve` and `npm run dev`.

## Demo accounts

The seeder creates one account per role (password is `password` for all):

| Role | Email | Sees |
| --- | --- | --- |
| Admin | `admin@teleflow.demo` | Everything, including Settings |
| Clinician | `dr.chen@teleflow.demo` | Patients, notes, appointments, messaging, billing (read) |
| Clinician | `dr.patel@teleflow.demo` | Same as above |
| Biller | `billing@teleflow.demo` | Dashboard and billing |

It also seeds a set of realistic demo patients so the app isn't empty on first run.

## Configuration

The only credential you need to supply is your Anthropic API key. Add to `.env`:

```dotenv
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6   # optional; overrides the default
```

Without a key, the app runs fine — only the AI note-generation feature is unavailable.

## Project structure

```
app/
├── Http/Controllers/     # Thin controllers, one per module
├── Models/               # Patient, Appointment, ClinicalNote, BillingClaim, ...
└── Services/             # BillingValidatorService, ClaudeNoteService, PatientOnboardingService
database/
├── migrations/           # Full schema
└── seeders/              # Demo users + patients
resources/js/
├── pages/                # Inertia page components (Dashboard, Patients, Notes, Billing, ...)
├── components/           # Shared UI + a small design-system kit under ui/
├── layouts/              # App + auth shells
└── hooks/
routes/web.php            # All routes + role middleware
```

## Deployment

The repo is deployment-ready for container / PaaS hosts:

- **[`nixpacks.toml`](nixpacks.toml)** — build config (PHP 8.3, Node 20, Composer + npm install, Vite build).
- **[`Procfile`](Procfile)** — `web` process (migrate + optimize + serve) and a `worker` process for the Redis queue.
- **[`docker-compose.yml`](docker-compose.yml)** — local containerized stack.

Production notes: set `APP_ENV=production`, `APP_DEBUG=false`, point `DB_CONNECTION` at MySQL, and configure `QUEUE_CONNECTION` (Redis recommended) so the note-generation jobs and worker line up.

## Roadmap

Ideas that would extend the platform:

- Automated test coverage for the billing rules engine (the checks are pure functions — ideal for unit testing)
- Real-time messaging via broadcasting
- Exportable 837P claim files
- Patient portal
- Two-factor authentication for staff accounts

---

<p align="center"><em>Built to demonstrate full-stack product engineering — domain modeling, regulatory logic, AI integration, and a polished React UI — in a single cohesive application.</em></p>
