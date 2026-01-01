# Verbio

Learn languages by speaking. Verbio is a phrase learning app that checks your answers using speech recognition.

## How it works

1. **See a phrase** in your native language
2. **Speak the answer** in the language you're learning
3. **Get instant feedback** - the app checks if you said it correctly
4. **Repeat until mastered** - phrases you know disappear from the pool

## Why Verbio?

- **Speak, don't type** - practice pronunciation and natural communication
- **Works offline** - all data stays in your browser, no internet needed
- **No account required** - just open and start learning, progress saves automatically
- **Smart repetition** - difficult phrases appear more often

## Review Set

Struggling to remember a phrase? Click the star icon next to it, and it goes to your review set. All starred phrases for a language can be practiced separately - find them in the set dropdown as "Review: [language]".

---

## Features

- **Multiple language sets** - different languages and topics
- **Speech recognition** - speak answers using Web Speech API
- **Progress tracking** - stored in browser localStorage
- **Offline-capable** - all data bundled, no backend needed

---

## Quick Start

```bash
# Setup (required once after cloning)
git config merge.ours.driver true

# Local development
cd frontend && python3 -m http.server 3000

# Generate sets.js (required before first run)
./deployment/cloudflare_pages/build.sh

# Deploy to production (auto-generates sets.js)
./deployment/cloudflare_pages/deploy.sh
```

---

## Generating sets.js

The app requires `frontend/js/sets.js` which is auto-generated from `lang_data/*.json` files.

### Build command

```bash
./deployment/cloudflare_pages/build.sh
```

This script:
1. Reads all JSON files from `lang_data/`
2. Combines them into `frontend/js/sets.js`
3. The generated file is used by the app at runtime

### When to run

- **Before first local development** - sets.js must exist
- **After adding/modifying language sets** - to see changes locally
- **Automatically on deploy** - deploy.sh runs build.sh first

### Manual generation (alternative)

If you prefer not to use the script, you can manually create `frontend/js/sets.js`:

```javascript
const SETS = {
  "set_id": { /* contents of lang_data/set_id.json */ },
  "another_set": { /* contents of lang_data/another_set.json */ }
};
```

---

## Claude Commands for Generating Sets

Use these slash commands in Claude Code to generate phrase sets automatically:

### `/generate-set` - Generic set generator

```bash
/generate-set <count> <target_language> <level> <topic> [source_language]
```

**Arguments:**
- `count` - number of phrases (e.g., 10, 20, 50)
- `target_language` - german, spanish, french, italian
- `level` - basic, middle, advanced
- `topic` - restaurant, travel, business, everyday, etc.
- `source_language` - (optional) english, polish, spanish, french (default: english)

**Examples:**
```bash
/generate-set 15 german basic restaurant
/generate-set 20 spanish middle travel english
/generate-set 10 french advanced business polish
```

### `/generate-b1-set` - German B1 curriculum

Generates sets following the B1 curriculum in `docs/curriculum-german-b1.md`.

```bash
/generate-b1-set [topic] [source_language]
```

**Examples:**
```bash
/generate-b1-set                           # auto-select next topic
/generate-b1-set Travel - planning         # specific topic
/generate-b1-set Travel - planning polish  # with Polish prompts
/generate-b1-set polish                    # auto-select, Polish prompts
```

Creates 3 sets × 20 phrases = 60 phrases per topic. Automatically updates progress in `docs/curriculum-german-b1-progress.md`.

### `/generate-b2-set` - German B2 curriculum

Same as B1 but for B2 level curriculum.

```bash
/generate-b2-set [topic] [source_language]
```

**Examples:**
```bash
/generate-b2-set                              # auto-select next topic
/generate-b2-set Health - specialist          # specific topic
/generate-b2-set Health - specialist polish   # with Polish prompts
```

Creates 3 sets × 20 phrases = 60 phrases per topic. Automatically updates progress in `docs/curriculum-german-b2-progress.md`.

---

## Adding New Sets Manually

1. Create `lang_data/new_set.json`:

```json
{
  "metadata": {
    "id": "new_set",
    "name": "Display Name",
    "language": "de",
    "speechLang": "de-DE"
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "Polish phrase",
      "answer": "Target language answer",
      "accepted": ["lowercase", "variations"]
    }
  ]
}
```

2. Generate sets.js: `./deployment/cloudflare_pages/build.sh`

3. Test locally: `cd frontend && python3 -m http.server 3000`

4. Deploy: `./deployment/cloudflare_pages/deploy.sh` or `git push origin main`

---

## Deployment

### Option 1: Git push (automatic)

```bash
git push origin main
```

Cloudflare Pages automatically detects the push and deploys.

### Option 2: Wrangler CLI (manual)

```bash
# One-time setup
npm install -g wrangler
wrangler login

# Deploy
./deployment/cloudflare_pages/deploy.sh
```

For detailed deployment setup (Cloudflare Pages, custom domains, troubleshooting), see [deployment/cloudflare_pages/README.md](deployment/cloudflare_pages/README.md).

---

## Tech Stack

- HTML + Vanilla JS + Tailwind CDN
- Web Speech API
- localStorage
- Cloudflare Pages (static hosting)
