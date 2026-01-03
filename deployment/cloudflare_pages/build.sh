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
FEATURE_SHOW_ALTERNATIVES="${FEATURE_SHOW_ALTERNATIVES:-true}"
BUILD_TAILWIND="${BUILD_TAILWIND:-false}"

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
echo "  audio: $FEATURE_AUDIO," >> "$CONFIG_JS"
echo "  showAlternatives: $FEATURE_SHOW_ALTERNATIVES" >> "$CONFIG_JS"
echo "};" >> "$CONFIG_JS"
echo "==> Features: audio=$FEATURE_AUDIO, showAlternatives=$FEATURE_SHOW_ALTERNATIVES"

# Build Tailwind CSS if enabled
if [ "$BUILD_TAILWIND" = "true" ]; then
    echo "==> Building Tailwind CSS..."

    TAILWIND_BIN="$PROJECT_ROOT/bin/tailwindcss"
    INPUT_CSS="$PROJECT_ROOT/frontend/css/input.css"
    OUTPUT_CSS="$PROJECT_ROOT/frontend/css/styles.css"

    if [ ! -f "$TAILWIND_BIN" ]; then
        echo "    Downloading Tailwind CLI..."
        mkdir -p "$PROJECT_ROOT/bin"

        # Detect platform
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if [[ $(uname -m) == "arm64" ]]; then
                TAILWIND_URL="https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64"
            else
                TAILWIND_URL="https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64"
            fi
        else
            TAILWIND_URL="https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64"
        fi

        curl -sL "$TAILWIND_URL" -o "$TAILWIND_BIN"
        chmod +x "$TAILWIND_BIN"
    fi

    "$TAILWIND_BIN" -i "$INPUT_CSS" -o "$OUTPUT_CSS" --minify 2>/dev/null
    CSS_SIZE=$(wc -c < "$OUTPUT_CSS" | tr -d ' ')
    echo "==> Generated styles.css (${CSS_SIZE} bytes)"

    # Update index.html to use local CSS instead of CDN
    INDEX_HTML="$PROJECT_ROOT/frontend/index.html"
    if grep -q "cdn.tailwindcss.com" "$INDEX_HTML"; then
        # Remove CDN script and tailwind.config block, add local CSS link
        sed -i.bak '/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/,/<\/script>/d' "$INDEX_HTML"
        # Add CSS link after <title>
        sed -i.bak 's|</title>|</title>\n        <link rel="stylesheet" href="/css/styles.css">|' "$INDEX_HTML"
        rm -f "$INDEX_HTML.bak"
        echo "==> Updated index.html to use local CSS"
    fi
else
    echo "==> Skipping Tailwind build (BUILD_TAILWIND=false)"
fi

echo "==> Build complete!"
