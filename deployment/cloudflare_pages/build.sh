#!/bin/bash
set -e

# Cloudflare Pages Build Script
# Generates sets.js from lang_data/*.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Load configuration (can be overridden by environment variables)
if [ -f "$PROJECT_ROOT/deployment/config.sh" ]; then
    source "$PROJECT_ROOT/deployment/config.sh"
fi

# Allow environment variable overrides
FEATURE_AUDIO="${FEATURE_AUDIO:-false}"

echo "==> Building sets.js from lang_data..."

SETS_JS="$PROJECT_ROOT/frontend/js/sets.js"

echo "// Auto-generated from lang_data/*.json - do not edit manually" > "$SETS_JS"
echo "const SETS = {" >> "$SETS_JS"

first=true
for jsonfile in "$PROJECT_ROOT"/lang_data/*.json; do
    if [ -f "$jsonfile" ]; then
        filename=$(basename "$jsonfile" .json)
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$SETS_JS"
        fi
        echo -n "  \"$filename\": " >> "$SETS_JS"
        cat "$jsonfile" >> "$SETS_JS"
    fi
done

echo "" >> "$SETS_JS"
echo "};" >> "$SETS_JS"

SET_COUNT=$(ls -1 "$PROJECT_ROOT"/lang_data/*.json 2>/dev/null | wc -l | tr -d ' ')
echo "==> Generated sets.js with $SET_COUNT set(s)"

# Generate version.js from latest git tag
echo "==> Generating version.js from git tag..."

# Fetch tags (Cloudflare Pages does shallow clone without tags)
git fetch --tags --unshallow 2>/dev/null || git fetch --tags 2>/dev/null || true

VERSION_JS="$PROJECT_ROOT/frontend/js/version.js"
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo "// Auto-generated from git tag - do not edit manually" > "$VERSION_JS"
echo "const APP_VERSION = \"$VERSION\";" >> "$VERSION_JS"
echo "==> Version set to $VERSION"

# Generate config.js with feature flags
echo "==> Generating config.js with feature flags..."
CONFIG_JS="$PROJECT_ROOT/frontend/js/config.js"
echo "// Auto-generated from deployment/config.sh - do not edit manually" > "$CONFIG_JS"
echo "const FEATURES = {" >> "$CONFIG_JS"
echo "  audio: $FEATURE_AUDIO" >> "$CONFIG_JS"
echo "};" >> "$CONFIG_JS"
echo "==> Features: audio=$FEATURE_AUDIO"

echo "==> Build complete!"
