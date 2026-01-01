# Testing Recommendations

## Overview

Current codebase: ~500 lines of JS logic. Testing is optional but could provide value for critical business logic.

## Priority 1: Speech Validation (High ROI)

Function: `validateSpeech(transcript)` in `app.js`

**Test cases:**
- Exact match with `phrase.answer`
- Match with `accepted` variants
- Case-insensitive comparison
- Whitespace trimming
- German umlauts (ü → ue, ö → oe, ä → ae)
- Empty input handling
- Partial matches (currently not supported - verify behavior)

**Example test scenarios:**
```
Input: "Guten Tag"    → Expected: true (matches answer)
Input: "guten tag"    → Expected: true (case insensitive)
Input: " guten tag "  → Expected: true (trimmed)
Input: "guten morgen" → Expected: false (wrong answer)
Input: ""             → Expected: false (empty)
```

## Priority 2: Progress Tracking (Medium ROI)

Functions: `getStats()`, `getUnlearnedPhrases()`, `getProgress()` in `app.js`

**Test cases:**
- Empty progress (new user)
- Partial progress (some phrases learned)
- Full progress (all phrases learned)
- Corrupted localStorage JSON (error handling)
- Progress isolation between sets

**Example scenarios:**
```
Set with 10 phrases, 0 learned  → remaining: 10
Set with 10 phrases, 5 learned  → remaining: 5
Set with 10 phrases, 10 learned → remaining: 0, show completion
```

## Priority 3: Phrase Selection (Low ROI)

Function: `loadNextPhrase()` in `app.js`

**Test cases:**
- Random selection from unlearned pool
- Edge case: all phrases learned (should show completion)
- Edge case: empty set (should handle gracefully)

## Not Recommended for Testing

- DOM manipulation (use manual testing)
- Web Speech API integration (browser-dependent)
- localStorage read/write (simple operations)
- UI toggle functions (trivial logic)

## Suggested Framework

If implementing tests:
- **Vitest** - modern, zero-config, fast
- **Jest** - heavier but well-established

Both require extracting testable functions from `app.js` into separate modules.

## Effort Estimate

| Scope | Time | Files |
|-------|------|-------|
| Priority 1 only | 1-2h | 1 test file |
| Priority 1+2 | 2-3h | 1-2 test files |
| All priorities | 4-6h | 2-3 test files |

## Conclusion

For a project of this size and simplicity, testing is optional. Consider adding tests only if:
- Planning significant feature expansion
- Multiple contributors will work on the code
- Speech validation edge cases cause user issues
