# Development Guide

## Quick Start

```bash
# Setup (required once after cloning)
git config merge.ours.driver true

# Generate sets.js (required before first run)
./deployment/cloudflare_pages/build.sh

# Local development
cd frontend && python3 -m http.server 3000
```

## Generating sets.js

The app requires `frontend/js/sets.js` which is auto-generated from `lang_data/*.json` files.

```bash
./deployment/cloudflare_pages/build.sh
```

Run this:
- Before first local development
- After adding/modifying language sets
- Automatically on deploy (deploy.sh runs build.sh)

## Adding New Sets

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
      "prompt": "Source language phrase",
      "answer": "Target language answer",
      "accepted": ["lowercase", "variations"]
    }
  ]
}
```

2. Generate sets.js: `./deployment/cloudflare_pages/build.sh`
3. Test locally: `cd frontend && python3 -m http.server 3000`

## Claude Code Commands

### `/generate-set` - Generic set generator

```bash
/generate-set <count> <target_language> <level> <topic> [source_language]
```

Examples:
```bash
/generate-set 15 german basic restaurant
/generate-set 20 spanish middle travel english
```

### `/generate-b1-set` - German B1 curriculum

```bash
/generate-b1-set [topic] [source_language]
```

Creates 2 sets × 30 phrases per topic. Updates progress in `docs/curriculum/curriculum-german-b1-progress.md`.

### `/generate-b2-set` - German B2 curriculum

```bash
/generate-b2-set [topic] [source_language]
```

Creates 3 sets × 20 phrases per topic.

### `/commit` - Smart commit

Creates git commit with auto-generated message and optional version tag.

### `/deploy` - Deploy to production

Runs build and deploys to Cloudflare Pages.

### `/sync-from-main` - Sync branches

Merges main into demo and priv branches, preserving branch-specific data.

### `/push-to-main` - Push code to main

Merges code changes to main, excluding data files.

## Audio Generation

Generate native pronunciation using AWS Polly.

### Setup

1. Create AWS IAM user with `AmazonPollyReadOnlyAccess`
2. Configure AWS CLI: `aws configure --profile verbio`
3. Create `.env`: `AWS_PROFILE=verbio`
4. Install: `pip install -r scripts/requirements.txt`

### Generate

```bash
python scripts/generate_audio.py
```

### Enable in app

Set `FEATURE_AUDIO=true` in `deployment/config.sh`, then rebuild.

### Supported voices

| Language | Voice |
|----------|-------|
| de-DE | Vicki |
| en-US | Joanna |
| es-ES | Lucia |
| fr-FR | Lea |
| it-IT | Bianca |
| pl-PL | Ola |
| pt-BR | Camila |
| nl-NL | Laura |
| ja-JP | Kazuha |
| ko-KR | Seoyeon |
| zh-CN | Zhiyu |

## Deployment

See [deployment/cloudflare_pages/README.md](../deployment/cloudflare_pages/README.md) for full details.

Quick deploy:
```bash
./deployment/cloudflare_pages/deploy.sh
```

Or push to main for automatic deploy via Cloudflare Pages GitHub integration.

## Tech Stack

- HTML + Vanilla JS + Tailwind CSS
- Web Speech API
- localStorage
- Cloudflare Pages
