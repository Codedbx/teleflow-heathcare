<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClaudeNoteService
{
    private string $apiKey;
    private string $model;
    private const ANTHROPIC_VERSION = '2023-06-01';
    private const API_URL           = 'https://api.anthropic.com/v1/messages';

    public function __construct()
    {
        $this->apiKey = config('services.claude.api_key');
        $this->model  = config('services.claude.model', 'claude-sonnet-4-20250514');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Primary entry point — takes session data, hits Claude, returns structured array.
     *
     * @throws \RuntimeException on API failure or JSON parse failure
     */
    public function generateSoapNote(array $data): array
    {
        $prompt = $this->buildPrompt($data);

        $response = Http::withHeaders([
            'x-api-key'         => $this->apiKey,
            'anthropic-version' => self::ANTHROPIC_VERSION,
            'Content-Type'      => 'application/json',
        ])
        ->timeout(60) // Claude can take 5-15s for this prompt size
        ->post(self::API_URL, [
            'model'      => $this->model,
            'max_tokens' => 1500,
            'messages'   => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);

        if ($response->failed()) {
            Log::error('ClaudeNoteService: API request failed', [
                'status'     => $response->status(),
                'body'       => $response->body(),
                'patient'    => $data['patient_name'] ?? 'unknown',
            ]);
            throw new \RuntimeException(
                'Claude API returned an error (' . $response->status() . '). '
                . 'Check CLAUDE_API_KEY and service status.'
            );
        }

        $rawText = $response->json('content.0.text');

        if (empty($rawText)) {
            throw new \RuntimeException('Claude returned an empty response. Please try again.');
        }

        // Capture token usage for the DB record
        $usage = $response->json('usage', []);

        return $this->parseResponse($rawText, $data, $usage);
    }

    /**
     * Deterministic CPT code suggestion based on session duration and modality.
     * Used both internally and exposed to the controller for the initial page load.
     */
    public function suggestCptCode(int $durationMinutes, string $modality): array
    {
        $cpt = match (true) {
            $durationMinutes >= 53 => [
                'code'        => '90837',
                'description' => 'Psychotherapy, 53+ min',
            ],
            $durationMinutes >= 38 => [
                'code'        => '90834',
                'description' => 'Psychotherapy, 38–52 min',
            ],
            $durationMinutes >= 16 => [
                'code'        => '90832',
                'description' => 'Psychotherapy, 16–37 min',
            ],
            default => [
                'code'        => '90832',
                'description' => 'Psychotherapy, 16–37 min',
            ],
        };

        $modifier = match ($modality) {
            'video'     => '95', // Synchronous telehealth — CA AB 72 / CMS 1500
            'audio'     => '93', // Audio-only telehealth — CA AB 32
            'in_person' => '',   // No modifier for office visits
            default     => '95',
        };

        // POS 10 = Patient's home (telehealth) | POS 11 = Office | POS 02 = Other telehealth
        $posCode = match ($modality) {
            'video', 'audio' => '10',
            'in_person'      => '11',
            default          => '10',
        };

        return array_merge($cpt, [
            'modifier' => $modifier,
            'pos_code' => $posCode,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Build the exact prompt from the build spec.
     * Interpolates all session variables into the hardcoded template.
     */
    private function buildPrompt(array $data): string
    {
        $presenting = is_array($data['presenting_concerns'] ?? null)
            ? implode(', ', $data['presenting_concerns'])
            : ($data['presenting_concerns'] ?? 'not specified');

        $modalityLabel = match ($data['modality'] ?? 'video') {
            'video'     => 'Live Video Telehealth',
            'audio'     => 'Audio-Only Telehealth (modifier 93)',
            'in_person' => 'In-Person Office Visit',
            default     => 'Telehealth',
        };

        $name         = $data['patient_name']  ?? 'Unknown Patient';
        $age          = $data['patient_age']   ?? 'Unknown';
        $duration     = $data['duration']      ?? 'Unknown';
        $sessionDate  = $data['session_date']  ?? now()->toFormattedDateString();
        $providerType = $data['provider_type'] ?? 'LCSW';
        $rawNotes     = $data['raw_notes']     ?? '';

        // Exact prompt from the build document — do not modify
        return <<<PROMPT
You are a licensed clinical documentation assistant for a California telehealth mental health practice.

Convert the following raw session notes into a professional SOAP note.

Patient: {$name}, {$age}yo, {$presenting}
Session: {$duration} minutes, {$modalityLabel}, {$sessionDate}
Provider type: {$providerType}

RAW NOTES:
{$rawNotes}

Return ONLY valid JSON with this exact structure:
{
  "soap": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  },
  "billing": {
    "cpt_code": "...",
    "cpt_description": "...",
    "modifier": "...",
    "pos_code": "...",
    "icd10_suggestions": ["...", "..."],
    "session_duration_note": "..."
  },
  "clinical_flags": ["..."]
}

Do not include markdown, backticks, or any text outside the JSON.
PROMPT;
    }

    /**
     * Parse Claude's text response into a structured array.
     * Strips accidental markdown fences, validates structure,
     * and enriches the billing block with our own CPT validation.
     */
    private function parseResponse(string $rawText, array $data, array $usage): array
    {
        // Strip any markdown Claude accidentally adds despite being told not to
        $clean = preg_replace('/^```json\s*/m', '', $rawText);
        $clean = preg_replace('/\s*```$/m', '', $clean);
        $clean = trim($clean);

        $parsed = json_decode($clean, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Log::warning('ClaudeNoteService: JSON parse failed', [
                'error' => json_last_error_msg(),
                'raw'   => substr($rawText, 0, 500),
            ]);
            throw new \RuntimeException(
                'The AI returned a response that could not be parsed. Please try again.'
            );
        }

        if (!isset($parsed['soap']['subjective'])) {
            throw new \RuntimeException(
                'The AI response was missing expected SOAP fields. Please try again.'
            );
        }

        // Cross-validate the AI's CPT suggestion against our deterministic logic
        $duration    = (int) ($data['duration'] ?? 0);
        $modality    = $data['modality'] ?? 'video';
        $suggested   = $this->suggestCptCode($duration, $modality);
        $aiCpt       = $parsed['billing']['cpt_code'] ?? '';

        $parsed['billing']['cpt_validation'] = $this->validateCptSuggestion(
            $aiCpt,
            $duration,
            $suggested
        );

        // Override modifier and POS with our deterministic values
        // (AI may get these wrong — keep the authoritative values)
        $parsed['billing']['modifier_validated'] = $suggested['modifier'];
        $parsed['billing']['pos_code_validated']  = $suggested['pos_code'];

        // Attach token usage for DB auditing
        $parsed['usage'] = [
            'input_tokens'  => $usage['input_tokens']  ?? null,
            'output_tokens' => $usage['output_tokens'] ?? null,
        ];

        // Timestamp
        $parsed['generated_at'] = now()->toIso8601String();

        return $parsed;
    }

    /**
     * Compare AI-suggested CPT to our rule-based suggestion.
     * Returns a validation status block for the UI.
     */
    private function validateCptSuggestion(string $aiCpt, int $duration, array $suggested): array
    {
        $isMatch = $aiCpt === $suggested['code'];

        return [
            'status'          => $isMatch ? 'clean' : 'warning',
            'ai_suggested'    => $aiCpt,
            'rule_suggested'  => $suggested['code'],
            'message'         => $isMatch
                ? "CPT {$aiCpt} is correct for a {$duration}-min session."
                : "AI suggested {$aiCpt}, but a {$duration}-min session typically uses {$suggested['code']} ({$suggested['description']}). Review before submitting.",
        ];
    }
}