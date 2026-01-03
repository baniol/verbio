# Development Plan - Vocabulary Retention Optimization

## Executive Summary

This document outlines strategies to maximize vocabulary retention in verbio, a speech-focused language learning flashcard app. The plan is based on evidence-based learning theories and prioritized by impact-to-effort ratio.

**Current state:** The app has basic streak-based learning with pseudo-spaced repetition (priority based on success rate + time since last seen). Each vocabulary item appears in only one context.

**Goal:** Implement multi-context exposure, true spaced repetition, and interleaved practice to maximize long-term retention.

---

## Learning Theories Applied

| Theory | Description | Current State | Gap |
|--------|-------------|---------------|-----|
| **Spaced Repetition** | Optimal review intervals based on forgetting curve | Pseudo-SR (weighted priority) | No exponential intervals, no ease factor |
| **Encoding Variability** | Same word in different contexts = more memory routes | Each word in 1 phrase only | Major gap - biggest retention issue |
| **Interleaving** | Mixing topics during practice | Sets studied in isolation | No cross-set practice mode |
| **Retrieval Practice** | Active recall > passive review | Speech mode forces production | Good - already implemented |
| **Desirable Difficulties** | Harder practice = better retention | Immediate retry only | Missing reverse mode, cloze deletion |

---

## Implementation Priorities

### Phase 1: Multi-Context Vocabulary (Highest Impact, Low Effort)

**Problem:** A word learned in one sentence doesn't transfer to new contexts. "Reservieren" learned for hotel may not be recognized in restaurant context.

**Solution:** Update `/generate-b1-set` command to ensure key vocabulary appears in 2-3 different phrases with varied contexts.

#### 1.1 Update Generation Command

**File:** `.claude/commands/generate-b1-set.md`

Add requirement:
```markdown
## Vocabulary Repetition Rule

For each key vocabulary item (verbs, nouns, adjectives):
- Must appear in at least 2-3 different phrases within the set
- Vary sentence structure: question, statement, request, passive
- Vary situation: formal/informal, different speakers, different scenarios

Example for "reservieren":
1. "Ich möchte ein Zimmer reservieren" (polite request, hotel)
2. "Haben Sie den Tisch reserviert?" (question, Perfekt, restaurant)
3. "Die Reservierung wurde bestätigt" (passive, confirmation)
```

#### 1.2 Add Vocabulary Tagging to Phrases (Optional Enhancement)

**Note:** This is a NEW field proposal. The current phrase structure only has: `id`, `prompt`, `answer`, `accepted`. No other fields like `speaker`, `context`, `participants` exist - those were experimental and removed.

Add `vocabulary` field to phrase structure for future tracking:

```json
{
  "id": 1,
  "prompt": "Chciałbym zarezerwować pokój",
  "answer": "Ich möchte ein Zimmer reservieren",
  "accepted": ["ich möchte ein zimmer reservieren"],
  "vocabulary": [
    {"word": "möchte", "base": "mögen", "type": "modal"},
    {"word": "Zimmer", "type": "noun", "article": "das"},
    {"word": "reservieren", "type": "verb"}
  ]
}
```

**Benefits:**
- Enables vocabulary-level progress tracking (not just phrase-level)
- Allows "related phrases" feature showing same word in different contexts
- Foundation for auto-generated weak vocabulary sets

---

### Phase 2: True Spaced Repetition (High Impact, Medium Effort)

**Problem:** Current priority algorithm doesn't use optimal review intervals.

**Solution:** Implement simplified SM-2 algorithm.

#### 2.1 Extend Progress Structure

**File:** `frontend/js/app.js`

Current:
```javascript
{
  correctStreak: 0,
  totalAttempts: 0,
  successCount: 0,
  lastSeen: Date.now()
}
```

Extended:
```javascript
{
  correctStreak: 0,
  totalAttempts: 0,
  successCount: 0,
  lastSeen: Date.now(),
  // NEW: Spaced repetition fields
  interval: 1,           // days until next review (starts at 1)
  easeFactor: 2.5,       // SM-2 ease factor (2.5 default)
  nextReviewDate: null   // timestamp when due for review
}
```

#### 2.2 Implement SM-2 Algorithm

**Location:** `frontend/js/app.js` - modify `calculatePriority()` and `submitAnswer()`

```javascript
function updateSRS(phraseId, quality) {
  // quality: 0-2 (wrong), 3 (hard), 4 (good), 5 (easy)
  const prog = progress[phraseId];
  
  if (quality < 3) {
    // Failed - reset interval
    prog.interval = 1;
  } else {
    // Success - increase interval
    if (prog.interval === 1) {
      prog.interval = 6;
    } else {
      prog.interval = Math.round(prog.interval * prog.easeFactor);
    }
  }
  
  // Update ease factor (min 1.3)
  prog.easeFactor = Math.max(1.3, 
    prog.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  prog.nextReviewDate = Date.now() + (prog.interval * 24 * 60 * 60 * 1000);
}

function calculatePriority(phrase, progress) {
  const prog = progress[phrase.id];
  if (!prog?.nextReviewDate) {
    return 1000; // New phrase - highest priority
  }
  
  const now = Date.now();
  if (now >= prog.nextReviewDate) {
    // Overdue - priority based on how overdue
    const overdueDays = (now - prog.nextReviewDate) / (24 * 60 * 60 * 1000);
    return 500 + Math.min(overdueDays * 10, 500);
  }
  
  // Not yet due - low priority
  return 0;
}
```

#### 2.3 Migration

Add migration in `loadProgress()` to initialize new fields for existing data.

---

### Phase 3: Interleaved Practice Mode (High Impact, Medium Effort)

**Problem:** Sets are studied in isolation, missing interleaving benefits.

**Solution:** Add "Mixed Practice" mode that pulls phrases from multiple sets.

#### 3.1 UI Changes

**File:** `frontend/index.html`

Add toggle or button in set selection:
```html
<button id="mixed-practice-btn" data-i18n="mixedPractice">Mixed Practice</button>
```

#### 3.2 Logic Changes

**File:** `frontend/js/app.js`

```javascript
function loadInterleavedPhrases() {
  const targetLanguage = currentSet?.metadata?.language || 'de';
  const allSets = Object.values(SETS).filter(s => 
    s.metadata.language === targetLanguage && 
    !s.metadata.isReviewSet
  );
  
  const candidates = [];
  for (const set of allSets) {
    const progress = loadProgress(set.metadata.id);
    const unlearned = set.phrases.filter(p => !isLearned(p, progress));
    candidates.push(...unlearned.map(p => ({
      ...p, 
      _setId: set.metadata.id,
      _setName: set.metadata.name
    })));
  }
  
  return candidates;
}
```

#### 3.3 i18n

**File:** `frontend/js/i18n.js`

Add translations for "Mixed Practice" / "Tryb mieszany" / "Gemischtes Training".

---

### Phase 4: Exercise Variations (Medium Impact, Low-Medium Effort)

#### 4.1 Reverse Translation Mode

**Problem:** Currently only source→target. Adding target→source doubles practice value.

**Implementation:**
- Add toggle in settings: `langlearn_reverse_mode`
- Swap display of `prompt` and `answer`
- Validate against original `prompt` field

**File:** `frontend/js/app.js` - modify `displayPhrase()` and answer validation

#### 4.2 Cloze Deletion (Future)

Hide one word from answer, user fills in blank:
- "Ich ___ ein Zimmer reservieren" (answer: möchte)

Requires:
- `clozeWord` field in phrases, or
- Auto-detection based on `vocabulary` tags
- New UI for fill-in-the-blank exercise

---

### Phase 5: Vocabulary Mastery Tracking (Medium Impact, Higher Effort)

Track mastery at vocabulary level, not just phrase level.

#### 5.1 New Storage

```javascript
// langlearn_vocab_mastery
{
  "reservieren": {
    "contexts": [
      {"setId": "german_b1_travel", "phraseId": 5, "mastered": true},
      {"setId": "german_b1_restaurant", "phraseId": 12, "mastered": false}
    ],
    "overallMastery": 0.5  // 1 of 2 contexts mastered
  }
}
```

#### 5.2 Features Enabled

- Show vocabulary mastery % alongside set progress
- Auto-generate "weak vocabulary" review sets
- "Related phrases" showing same word in different contexts after correct answer

---

## File Reference

| File | Purpose | Phases |
|------|---------|--------|
| `.claude/commands/generate-b1-set.md` | Set generation command | 1.1, 1.2 |
| `frontend/js/app.js` | Core learning logic | 2, 3, 4, 5 |
| `frontend/index.html` | UI elements | 3, 4 |
| `frontend/js/i18n.js` | Translations | 3, 4 |
| `lang_data/*.json` | Phrase data | 1.2 (new field) |

---

## Quick Start for Next Session

**To implement Phase 1 (recommended first):**

1. Read `.claude/commands/generate-b1-set.md`
2. Add vocabulary repetition requirements to the generation guidelines
3. Optionally add `vocabulary` field to phrase structure
4. Regenerate one B1 set to test the new format

**Command:** `/generate-b1-set` with updated guidelines

**To implement Phase 2:**

1. Read `frontend/js/app.js` lines 760-800 (`calculatePriority`) and 1143-1161 (`submitAnswer`)
2. Add SRS fields to progress structure
3. Implement SM-2 algorithm
4. Add migration for existing data

---

## Success Metrics

- **Retention rate:** % of phrases still known after 7/30 days (manual testing)
- **Vocabulary coverage:** Same word mastered in 2+ contexts
- **Session engagement:** Average session length, completion rate

---

## References

- SM-2 Algorithm: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
- Encoding Variability: Bjork, R.A. (1994) - Memory and Metamemory Considerations
- Interleaving: Rohrer, D. (2012) - Interleaving Helps Students Distinguish Among Similar Concepts
