Generate German B1 phrase set according to curriculum.

Arguments: $ARGUMENTS

Format: `[topic] [source_language]`
- topic (optional): specific topic from curriculum (contains " - " separator)
- source_language (optional): prompt language (default: english)
  Options: english, polish, spanish, french

Examples:
- `/generate-b1-set` - auto-select next topic, English prompts
- `/generate-b1-set Travel - planning` - specific topic, English prompts  
- `/generate-b1-set Travel - planning polish` - specific topic, Polish prompts
- `/generate-b1-set polish` - auto-select topic, Polish prompts
- `/generate-b1-set english` - auto-select topic, English prompts

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
| `Travel - planning` | Travel - planning | english |
| `Travel - planning polish` | Travel - planning | polish |
| `At the doctor english` | At the doctor | english |

Source language codes:
| Language | ISO | Speech |
|----------|-----|--------|
| english  | en  | en-US  |
| polish   | pl  | pl-PL  |
| spanish  | es  | es-ES  |
| french   | fr  | fr-FR  |

## Step 2: Read curriculum and progress

Read files:
- `docs/curriculum/curriculum-german-b1.md` - learning program (topics, grammar, situations)
- `docs/curriculum/curriculum-german-b1-progress.md` - progress checklist

## Step 3: Select topic

**If topic provided** (e.g., `/generate-b1-set Travel - planning`):
- Find this topic in checklist
- If already marked `[x]}`, ask user: "Topic already completed. Generate anyway for {source_language}? (This will create additional sets with _{lang} suffix)"

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

1. **Main set** - `german_b1_{topic}` - core phrases and situations
2. **Detail set A** - `german_b1_{topic}_{aspect1}` - deeper coverage of one aspect
3. **Detail set B** - `german_b1_{topic}_{aspect2}` - deeper coverage of another aspect

### Topic split examples:

| Topic | Main set | Set A | Set B |
|-------|----------|-------|-------|
| Travel - planning | `_travel_planning` (reservations) | `_travel_directions` (asking directions) | `_travel_problems` (travel issues) |
| At the doctor | `_doctor` (visit) | `_doctor_symptoms` (describing symptoms) | `_doctor_instructions` (understanding advice) |
| Job interview | `_interview` (process) | `_interview_experience` (describing CV) | `_interview_questions` (questions for employer) |

### File naming:

**For first/default language (english):**
- `lang_data/german_b1_{topic_snake_case}.json`

**For additional source languages (when topic already has english sets):**
- `lang_data/german_b1_{topic_snake_case}_{lang_code}.json`
- Example: `german_b1_travel_planning_pl.json` for Polish prompts

This allows having the same topic with different prompt languages:
- `german_b1_travel_planning.json` - English prompts
- `german_b1_travel_planning_pl.json` - Polish prompts
- `german_b1_travel_planning_es.json` - Spanish prompts

### File structure:

Filename: `lang_data/german_b1_{topic_snake_case}[_{lang_code}].json`

```json
{
  "metadata": {
    "id": "german_b1_{topic_snake_case}",
    "name": "German B1 - {Topic}: {subtitle}",
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

**IMPORTANT:** Before generating, check `docs/curriculum/curriculum-german-b1.md` section "Grammar mapping to topics" and find constructions assigned to this topic.

Each set MUST contain phrases using assigned grammar constructions. Example:

| Topic | Constructions to use |
|-------|---------------------|
| Travel - planning | Konjunktiv II (Ich möchte, Könnten Sie), Futur I, wenn |
| At the doctor | Konjunktiv II, seit/seitdem, wenn |
| Complaints | weil, Konjunktiv II, Passiv |

Phrases should naturally contain these constructions, e.g.:
- "I would like to book a room" → "Ich möchte ein Zimmer reservieren" (Konjunktiv II)
- "I've had headaches for three days" → "Ich habe seit drei Tagen Kopfschmerzen" (seit)
- "The product was damaged" → "Das Produkt wurde beschädigt" (Passiv)

### Quality guidelines for B1:

**B1 language level:**
- Simple and compound sentences (conjunctions: weil, wenn, dass, obwohl)
- Konjunktiv II for polite requests (Könnten Sie..., Ich würde gerne...)
- Tenses: Präsens, Perfekt, Präteritum (modal verbs), Futur I
- Basic thematic vocabulary (~2500 words total)
- Practical, everyday situations
- **Grammar constructions according to curriculum mapping**

**Differences from B2:**
- Simpler sentence structures
- Fewer idioms and collocations
- Less abstract topics
- More predictable situations
- Shorter utterances

**Phrase content:**
- **20 phrases per set × 3 sets = 60 phrases per topic**
- Variety of scenarios within topic
- Practical, used in real situations
- Natural constructions for B1 level
- Questions, statements, requests, reactions
- Each set should be standalone

**Accepted - answer variants:**
- All grammatically correct variants
- `möchte` / `würde gerne` / `will`
- `kann ich` / `könnte ich` / `darf ich`
- Variants with different personal pronouns
- Synonyms of basic verbs

**Format:**
- Prompt in SOURCE language (with proper characters)
- Answer in German (ä, ö, ü, ß)
- Accepted: lowercase, no keyboard variants (ue/ae/oe)

## Step 6: Update checklist

After saving all 3 sets, edit `docs/curriculum/curriculum-german-b1-progress.md`:

1. Find the topic row
2. Change `[ ]` to `[x]`
3. Add names of all 3 sets (comma-separated)
4. Add today's date

Example change:
```
| Travel - planning and reservations | [ ] | | |
```
to:
```
| Travel - planning and reservations | [x] | german_b1_travel_planning, german_b1_travel_directions, german_b1_travel_problems | 2025-12-31 |
```

5. Update "Summary" table - increment completed counter

## Step 7: Summary

Display:
- Created files (3 sets)
- Total phrase count (60)
- Source language used
- Grammar constructions used (from mapping)
- Updated progress (X/47 completed)
