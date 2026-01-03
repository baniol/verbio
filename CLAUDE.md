# CLAUDE.md

## Project Overview

**Language Learning App** - Frontend-only flashcard app with multiple language sets.

- Multiple sets support (different languages, topics)
- Speech recognition (Web Speech API, language from set metadata)
- Progress stored in localStorage (per set)
- No backend required
- Multi-language UI (i18n support)

## Tech Stack

```
Frontend: HTML + Vanilla JS + Tailwind CSS
Data:     JSON files in lang_data/
Deploy:   Cloudflare Pages (static hosting)
```

## Architecture

- **Correct answer** (speech validated) = phrase marked as learned
- **Wrong answer** = phrase stays in pool
- **Non-speech mode** = user self-evaluates with buttons
- **Reset** = all phrases from current set return to learning
- **Set selection** = remembers last selected set

### Exercise Flow

**With speech enabled (default):**
1. Show prompt (source language phrase)
2. User speaks answer (Web Speech API with target language from set)
3. System validates automatically
4. Shows result (correct/wrong) + answer
5. User clicks "Next" (or auto-advances if manual next is off)
6. If wrong + immediate retry enabled: repeat until 2x correct

**With speech disabled:**
1. Show prompt
2. Button "Show answer"
3. Show answer
4. User clicks "Knew" / "Didn't know"

## Project Structure

```
lang_data/
└── *.json                   # Language sets (add more here)

frontend/
├── index.html               # UI
├── sw.js                    # Service Worker (offline support)
├── manifest.json            # PWA manifest
└── js/
    ├── app.js               # Main logic
    ├── i18n.js              # Internationalization system
    ├── router.js            # Simple hash router
    └── sets.js              # Auto-generated from lang_data/

deployment/
├── config.sh                # Build configuration (feature flags, build options)
└── cloudflare_pages/
    ├── build.sh             # Generates sets.js, config.js, version.js, styles.css
    └── deploy.sh            # Deploy via Wrangler CLI

bin/                         # Build tools (auto-downloaded, gitignored)
└── tailwindcss              # Tailwind CLI standalone binary
```

## Quick Commands

```bash
# Local development
cd frontend && python3 -m http.server 3000

# Generate sets.js locally (required before first run)
./deployment/cloudflare_pages/build.sh

# Deploy to production
./deployment/cloudflare_pages/deploy.sh
```

## Set Format

`lang_data/german_basics.json`:
```json
{
  "metadata": {
    "id": "german_basics",
    "name": "German - Basics",
    "language": "de",
    "speechLang": "de-DE",
    "sourceLanguage": "pl",
    "sourceSpeechLang": "pl-PL"
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "Dzien dobry",
      "answer": "Guten Tag",
      "accepted": ["guten tag"]
    }
  ]
}
```

### Metadata fields:
- `id` - unique identifier (matches filename)
- `name` - display name in UI (language-neutral recommended)
- `language` - target language ISO code (what user learns)
- `speechLang` - Web Speech API language code for target (e.g., "de-DE", "es-ES")
- `sourceLanguage` - source language ISO code (prompt language)
- `sourceSpeechLang` - Web Speech API language code for source (e.g., "pl-PL", "en-US")

### Phrase fields:
- `id` - unique within set
- `prompt` - what user sees (question in source language)
- `answer` - correct answer (displayed after, in target language)
- `accepted` - array of accepted answers (lowercase, for validation)

## Dialogue Set Format

Dialogue sets are sequential conversation-based learning sets. Use `/generate-dialogue-set` to create them.

`lang_data/german_dialogue_ordering_coffee.json`:
```json
{
  "metadata": {
    "id": "german_dialogue_ordering_coffee",
    "name": "German - Ordering Coffee",
    "language": "de",
    "speechLang": "de-DE",
    "sourceLanguage": "en",
    "sourceSpeechLang": "en-US",
    "type": "dialogue",
    "situation": "Ordering coffee at a cafe",
    "participants": ["customer", "barista"]
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "Hello, what can I get you?",
      "answer": "Hallo, was darf es sein?",
      "accepted": ["hallo was darf es sein", "hallo was kann ich ihnen bringen"],
      "speaker": "barista",
      "context": "greeting customer at counter"
    },
    {
      "id": 2,
      "prompt": "I'd like a coffee, please",
      "answer": "Ich hätte gerne einen Kaffee, bitte",
      "accepted": ["ich hätte gerne einen kaffee bitte", "ich möchte einen kaffee bitte"],
      "speaker": "customer"
    }
  ]
}
```

### Additional metadata fields (dialogue):
- `type` - "dialogue" (distinguishes from regular sets)
- `situation` - description of the scenario
- `participants` - array of two role names

### Additional phrase fields (dialogue):
- `speaker` - which participant says this line
- `context` - (optional) stage direction or context note

## Internationalization (i18n)

The app UI supports multiple languages:
- English (en) - default
- Polish (pl)
- German (de)
- Spanish (es)
- French (fr)

### How it works:
1. `frontend/js/i18n.js` contains all UI translations
2. HTML elements use `data-i18n` attributes for text content
3. `data-i18n-placeholder` for input placeholders
4. `data-i18n-title` for tooltips
5. Language auto-detected from browser, user can change in Settings

### Adding new UI language:
1. Add translations object in `i18n.js` under `translations`
2. Add language to `languages` object
3. Add option to language select in `index.html`

## localStorage Keys

- `langlearn_last_set` - ID of last selected set
- `langlearn_speech_enabled` - speech mode on/off
- `langlearn_manual_next` - manual next button mode on/off (default: on)
- `langlearn_auto_listen` - auto-start listening on/off
- `langlearn_immediate_retry` - repeat wrong phrases until 2x correct (default: on)
- `langlearn_dev_mode` - developer mode on/off
- `langlearn_theme` - UI theme (light/dark/system)
- `langlearn_required_streak` - number of correct answers to mark as learned (1/2/3)
- `langlearn_ui_language` - UI language preference
- `langlearn_progress_{setId}` - learned phrase IDs per set
- `langlearn_notes` - user notes for phrases
- `langlearn_general_notes` - general notes (not phrase-specific)
- `langlearn_review_set_{language}` - starred phrases for review per language
- `langlearn_expanded_folders` - UI state for set folder expansion

## Build Configuration

Build options in `deployment/config.sh`:

```bash
# Feature flags
FEATURE_AUDIO=true              # Enable audio playback support
FEATURE_SHOW_ALTERNATIVES=false # Show alternative accepted answers

# Build options
BUILD_TAILWIND=true             # Build local Tailwind CSS (false = use CDN)
```

### Tailwind CSS Build

When `BUILD_TAILWIND=true`:
- Downloads Tailwind CLI standalone binary (auto, first build only)
- Generates optimized `frontend/css/styles.css` (~32KB)
- Updates `index.html` to use local CSS instead of CDN
- No npm/node required

When `BUILD_TAILWIND=false`:
- Uses Tailwind CDN (~300KB, shows console warning)
- Good for quick local development

## Deployment

**Production URL:** https://your-app.pages.dev (or your custom domain)

```bash
./deployment/cloudflare_pages/deploy.sh
```

Deploy script:
1. Runs `build.sh` to generate `frontend/js/sets.js` from `lang_data/*.json`
2. Deploys `frontend/` to Cloudflare Pages via Wrangler CLI

Alternative: `git push origin main` triggers automatic deploy via Cloudflare Pages GitHub integration.

## Adding New Sets

1. Create `lang_data/new_set.json` with proper format
2. Include both `sourceLanguage` and `language` in metadata
3. Run deploy script (generates sets.js automatically)
4. Done - new set appears in UI

## Audio Generation

Audio files are generated using AWS Polly (`scripts/generate_audio.py`).

**IMPORTANT:** When modifying `answer` field in existing sets, regenerate audio:
```bash
python scripts/generate_audio.py
```

The script uses hash-based change detection - only modified phrases will be regenerated.

## Branch Strategy

Three branches with different data sets, shared application code:

| Branch | Purpose | Data |
|--------|---------|------|
| `main` | Public/demo version | Demo sets |
| `demo` | Demo deployment | Demo sets |
| `priv` | Private learning | Personal sets |

### Syncing code between branches

`.gitattributes` with `merge=ours` strategy keeps `lang_data/` unchanged during merge:

```bash
# On demo/priv branch - pull code changes from main:
git checkout priv
git merge main
# Code updates, lang_data/ stays unchanged
```

### Setup (required once per machine)

```bash
git config merge.ours.driver true
```

This must be run after cloning the repo on a new machine.

### Protected paths (not merged)

- `lang_data/**` - language learning sets
- `lang_data_arch/**` - archived sets
- `frontend/audio/**` - audio files for sets

## Coding Principles

1. **Maximum simplicity** - No over-engineering
2. **Frontend-only** - No backend, no database
3. **Offline-capable** - All data bundled in sets.js
4. **No auto-commits** - NEVER run git commit without explicit user request
