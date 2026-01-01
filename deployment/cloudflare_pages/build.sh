#!/bin/bash
set -e

# Cloudflare Pages Build Script
# Generates sets.js from lang_data/*.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

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
echo "==> Build complete!"
