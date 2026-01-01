#!/bin/bash
set -e

# Cloudflare Pages Deploy Script
# Requires: npm install -g wrangler && wrangler login

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Run build first
echo "==> Running build..."
"$SCRIPT_DIR/build.sh"

# Deploy to Cloudflare Pages
echo "==> Deploying to Cloudflare Pages..."
cd "$PROJECT_ROOT"
npx wrangler pages deploy frontend --project-name=verbio

echo "==> Deploy complete!"
