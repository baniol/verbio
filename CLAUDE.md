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
Frontend: HTML + Vanilla JS + Tailwind CDN
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
5. Auto-advances after 2 seconds

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
└── cloudflare_pages/
    ├── build.sh             # Generates sets.js from lang_data/
    └── deploy.sh            # Deploy via Wrangler CLI
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
- `langlearn_manual_next` - manual next button mode on/off
- `langlearn_auto_listen` - auto-start listening on/off
- `langlearn_dev_mode` - developer mode on/off
- `langlearn_theme` - UI theme (light/dark/system)
- `langlearn_required_streak` - number of correct answers to mark as learned (1/2/3)
- `langlearn_ui_language` - UI language preference
- `langlearn_progress_{setId}` - learned phrase IDs per set
- `langlearn_notes` - user notes for phrases

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
