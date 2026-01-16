Generate German B2 phrase set according to curriculum.

Arguments: $ARGUMENTS

Format: `[topic] [source_language]`
- topic (optional): specific topic from curriculum (contains " - " separator)
- source_language (optional): prompt language (default: english)
  Options: english, polish, spanish, french

Examples:
- `/generate-b2-set` - auto-select next topic, English prompts
- `/generate-b2-set Health - specialist` - specific topic, English prompts  
- `/generate-b2-set Health - specialist polish` - specific topic, Polish prompts
- `/generate-b2-set polish` - auto-select topic, Polish prompts
- `/generate-b2-set english` - auto-select topic, English prompts

---

## Step 1: Parse arguments

Parse $ARGUMENTS to determine topic and source_language:

1. **Check if last word is a language**: If the last word of $ARGUMENTS is one of: `english`, `polish`, `spanish`, `french` → that's the `source_language`
2. **Check for topic**: If remaining text (after removing language) contains " - " → that's the `topic`
3. **Defaults**: 
   - If no language found → `source_language` = "english"
   - If no topic found → auto-select from progress

**Parsing examples:**
| Input | Topic | Source Language |
|-------|-------|-----------------|
| (empty) | auto-select | english |
| `polish` | auto-select | polish |
| `english` | auto-select | english |
| `Health - specialist` | Health - specialist | english |
| `Health - specialist polish` | Health - specialist | polish |
| `Job interview english` | Job interview | english |

Source language codes:
| Language | ISO | Speech |
|----------|-----|--------|
| english  | en  | en-US  |
| polish   | pl  | pl-PL  |
| spanish  | es  | es-ES  |
| french   | fr  | fr-FR  |

## Step 2: Read curriculum and progress

Read files:
- `docs/curriculum/curriculum-german-b2.md` - learning program (topics, grammar, situations)
- `docs/curriculum/curriculum-german-b2-progress.md` - progress checklist

## Step 3: Select topic

**If topic provided** (e.g., `/generate-b2-set Health - specialist`):
- Find this topic in checklist
- If already marked `[x]`, ask user: "Topic already completed. Generate anyway for {source_language}? (This will create additional sets with _{lang} suffix)"

**If no topic provided**:
- Automatically select first incomplete topic `[ ]` following suggested progression
- Inform user which topic was selected and continue

## Step 4: Check existing sets

Before generating, read all files in `lang_data/*.json` to:
- Avoid duplicating phrases
- Maintain consistent style
- Build on existing vocabulary

## Step 5: Generate 3 sets of 20 phrases each (60 phrases total)

Each curriculum topic requires **3 sets** for comprehensive coverage:

1. **Main set** - `german_b2_{topic}` - core phrases and situations
2. **Detail set A** - `german_b2_{topic}_{aspect1}` - deeper coverage of one aspect
3. **Detail set B** - `german_b2_{topic}_{aspect2}` - deeper coverage of another aspect

### Topic split examples:

| Topic | Main set | Set A | Set B |
|-------|----------|-------|-------|
| Health - specialist | `_health_specialist` (visit, diagnosis) | `_health_symptoms` (describing ailments) | `_health_tests` (tests, medication) |
| Complaints | `_complaints` (filing complaints) | `_complaints_negotiation` (negotiating) | `_complaints_written` (written form) |
| Job interview | `_job_interview` (process) | `_job_qualifications` (describing experience) | `_job_negotiation` (terms) |

### File naming:

**For first/default language (english):**
- `lang_data/german_b2_{topic_snake_case}.json`

**For additional source languages (when topic already has english sets):**
- `lang_data/german_b2_{topic_snake_case}_{lang_code}.json`
- Example: `german_b2_health_specialist_pl.json` for Polish prompts

This allows having the same topic with different prompt languages:
- `german_b2_health_specialist.json` - English prompts
- `german_b2_health_specialist_pl.json` - Polish prompts
- `german_b2_health_specialist_es.json` - Spanish prompts

### File structure:

Filename: `lang_data/german_b2_{topic_snake_case}[_{lang_code}].json`

```json
{
  "metadata": {
    "id": "german_b2_{topic_snake_case}",
    "name": "German B2 - {Topic}: {subtitle}",
    "language": "de",
    "speechLang": "de-DE",
    "sourceLanguage": "{source_iso}",
    "sourceSpeechLang": "{source_speech}"
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "Source language text",
      "answer": "German answer",
      "accepted": ["variant 1", "variant 2"]
    }
  ]
}
```

### Grammar integration with topic

**IMPORTANT:** Before generating, check `docs/curriculum/curriculum-german-b2.md` section "Grammar mapping to topics" and find constructions assigned to this topic.

Each set MUST contain phrases using assigned grammar constructions. Example:

| Topic | Constructions to use |
|-------|---------------------|
| Health - specialist | Konjunktiv II, Passiv (tests), seit/seitdem, Relativsätze |
| Shopping - complaints | Konjunktiv II, Passiv, weil/da, Indirekte Rede |
| Office - correspondence | Konjunktiv II (formal), Passiv, Nominalization, Genitiv |

Phrases should naturally contain these constructions, e.g.:
- "I would like to get a second opinion" → "Ich würde gerne eine zweite Meinung einholen" (Konjunktiv II)
- "The test has already been ordered" → "Die Untersuchung wurde bereits angeordnet" (Passiv)
- "I've had these symptoms for two weeks" → "Ich habe diese Symptome seit zwei Wochen" (seit)
- "He said the results would be ready tomorrow" → "Er sagte, die Ergebnisse seien morgen da" (Indirekte Rede, Konjunktiv I)

### Quality guidelines for B2:

**B2 language level:**
- Complex sentence structures (subordinate clauses, conjunctions)
- Konjunktiv II for politeness and hypothetical situations
- Konjunktiv I in reported speech (formal style)
- Passive voice where natural
- Rich vocabulary, synonyms, collocations
- Idioms and colloquial expressions (but natural)
- Formal and informal registers
- **Grammar constructions according to curriculum mapping**

**Phrase content:**
- **20 phrases per set × 3 sets = 60 phrases per topic**
- Variety of scenarios within topic
- Practical, used in real situations
- Natural native speaker constructions
- Questions, statements, requests, reactions
- Each set should be standalone

**Accepted - answer variants:**
- All grammatically correct variants
- `darf ich` / `kann ich` / `könnte ich`
- `möchte` / `würde gerne` / `will`
- Formal `Sie` and informal `du` (if context allows)
- Verb synonyms
- Variants with different pronouns
- **Numbers: ALWAYS include both word and digit forms** (e.g., "zwanzig" AND "20", "drei" AND "3") - speech recognition often returns digits

**Format:**
- Prompt in SOURCE language (with proper characters)
- Answer in German (ä, ö, ü, ß)
- Accepted: lowercase, no keyboard variants (ue/ae/oe)

## Step 6: Update checklist

After saving all 3 sets, edit `docs/curriculum/curriculum-german-b2-progress.md`:

1. Find the topic row
2. Change `[ ]` to `[x]`
3. Add names of all 3 sets (comma-separated)
4. Add today's date

Example change:
```
| Health - specialist | [ ] | | |
```
to:
```
| Health - specialist | [x] | german_b2_health_specialist, german_b2_health_symptoms, german_b2_health_tests | 2025-12-31 |
```

5. Update "Summary" table - increment completed counter

## Step 7: Summary

Display:
- Created files (3 sets)
- Total phrase count (60)
- Source language used
- Grammar constructions used (from mapping)
- Updated progress (X/63 completed)
