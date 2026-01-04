Generate German B1 phrase set according to curriculum.

Arguments: $ARGUMENTS

Format: `[topic] [source_language] [extend]`
- topic (optional): specific topic from curriculum (contains " - " separator)
- source_language (optional): prompt language (default: english)
  Options: english, polish, spanish, french
- extend (optional): flag to generate extended sets for already completed topic

Examples:
- `/generate-b1-set` - auto-select next topic, English prompts
- `/generate-b1-set Travel - planning` - specific topic, English prompts  
- `/generate-b1-set Travel - planning polish` - specific topic, Polish prompts
- `/generate-b1-set polish` - auto-select topic, Polish prompts
- `/generate-b1-set english` - auto-select topic, English prompts
- `/generate-b1-set Travel - planning polish extend` - extended sets for completed topic

---

## Step 1: Parse arguments

Parse $ARGUMENTS to determine topic, source_language, and extend mode:

1. **Check for extend flag**: If `extend` appears in $ARGUMENTS → set `extend_mode` = true, remove from args
2. **Check if last word is a language**: If the last word of remaining args is one of: `english`, `polish`, `spanish`, `french` → that's the `source_language`
3. **Check for topic**: If remaining text (after removing language) contains " - " → that's the `topic`
4. **Defaults**: 
   - If no language found → `source_language` = "english"
   - If no topic found → auto-select from progress
   - If no extend flag → `extend_mode` = false

**Parsing examples:**
| Input | Topic | Source Language | Extend |
|-------|-------|-----------------|--------|
| (empty) | auto-select | english | false |
| `polish` | auto-select | polish | false |
| `Travel - planning` | Travel - planning | english | false |
| `Travel - planning polish` | Travel - planning | polish | false |
| `Travel - planning extend` | Travel - planning | english | true |
| `Travel - planning polish extend` | Travel - planning | polish | true |

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

**If extend_mode = true:**
- Topic MUST be provided
- Topic MUST be already marked `[x]` in checklist (completed)
- If topic not completed, error: "Cannot extend - topic not yet completed. Generate base sets first."

**If topic provided (normal mode):**
- Find this topic in checklist
- If already marked `[x]`, ask user: "Topic already completed. Generate anyway for {source_language}? (This will create additional sets with _{lang} suffix)"

**If no topic provided:**
- Automatically select first incomplete topic `[ ]` following suggested progression
- Inform user which topic was selected and continue

## Step 4: Check existing sets

Before generating, read all files in `lang_data/*.json` to:
- Avoid duplicating phrases
- Maintain consistent style
- Build on existing vocabulary

## Step 5: Generate sets

### Normal mode: 2 sets of 30 phrases each (60 phrases total)

Each curriculum topic requires **2 sets** for comprehensive coverage:

1. **Set A** - `german_b1_{topic}_{aspect1}` - one aspect/situation of the topic
2. **Set B** - `german_b1_{topic}_{aspect2}` - another aspect/situation of the topic

### Extend mode: 2 additional sets of 30 phrases each (60 phrases total)

Extended sets deepen already completed topics with:

1. **Set Ext A** - `german_b1_{topic}_{aspect}_ext_a` - advanced scenarios, edge cases
2. **Set Ext B** - `german_b1_{topic}_{aspect}_ext_b` - different perspectives, formal/informal variants

**Extended set requirements:**
- Must NOT duplicate phrases from base sets (read existing sets first!)
- More complex situations (e.g., complaints, negotiations, misunderstandings)
- Different registers (formal business vs casual)
- Less common but useful vocabulary
- More idiomatic expressions

### Topic split examples:

| Topic | Set A | Set B | Ext A | Ext B |
|-------|-------|-------|-------|-------|
| Travel - planning | `_travel_booking` | `_travel_info` | `_travel_booking_ext_a` | `_travel_info_ext_b` |
| At the doctor | `_doctor_symptoms` | `_doctor_treatment` | `_doctor_symptoms_ext_a` | `_doctor_treatment_ext_b` |
| Job interview | `_interview_process` | `_interview_experience` | `_interview_process_ext_a` | `_interview_experience_ext_b` |

### File naming:

`lang_data/german_b1_{topic}_{aspect}.json`

Examples:
- `german_b1_travel_booking.json`
- `german_b1_travel_info.json`
- `german_b1_travel_booking_ext_a.json` (extended)

### File structure:

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
      "accepted": ["variant 1", "variant 2"],
      "vocabulary": [
        {"word": "Zimmer", "base": "Zimmer", "type": "noun"},
        {"word": "reservieren", "base": "reservieren", "type": "verb"}
      ]
    }
  ]
}
```

### Grammar integration

Before generating, check `docs/curriculum/curriculum-german-b1.md` section "Grammar mapping to topics" for constructions assigned to this topic. Use them naturally in phrases.

### Vocabulary Repetition Rule (Multi-Context Exposure)

Key vocabulary must appear in 2-3 different phrases across the 2 sets to create multiple memory routes.

1. Identify 8-10 key vocabulary items for the topic
2. Plan their distribution across sets
3. Vary structures: question/statement, active/passive, different tenses

### Quality guidelines

**B1 level characteristics:**
- Simple and compound sentences (weil, wenn, dass, obwohl)
- Konjunktiv II for polite requests (Könnten Sie..., Ich würde gerne...)
- Tenses: Präsens, Perfekt, Präteritum (modals), Futur I
- Practical, everyday situations

**Naturalness over grammar:**
- Do NOT force grammar constructions - prioritize natural speech
- Bad: "Ich möchte wissen, wo..." → Good: "Wo ist...?"
- Use Konjunktiv II only for actual requests/wishes, not simple questions

**Phrase content:**
- 30 phrases per set × 2 sets = 60 phrases per topic
- Variety: questions, statements, requests, reactions
- Natural, how natives actually speak
- Shorter, direct phrases over formal constructions

**Accepted variants:**
- All grammatically correct variants (möchte/würde gerne/will, kann/könnte/darf)
- Different pronouns, synonyms

**Format:**
- Prompt: SOURCE language (proper characters)
- Answer: German (ä, ö, ü, ß)
- Accepted: lowercase, no keyboard variants (ue/ae/oe)

## Step 6: Update checklist

After saving sets, edit `docs/curriculum/curriculum-german-b1-progress.md`:

### Normal mode:
1. Find the topic row
2. Change `[ ]` to `[x]` in Status column
3. Add names of both sets (comma-separated) in Sets column
4. Add today's date in Date column
5. Leave Extended column as `[ ]`

Example change:
```
| Travel - planning and reservations | [ ] | | | [ ] |
```
to:
```
| Travel - planning and reservations | [x] | german_b1_travel_booking, german_b1_travel_info | 2026-01-04 | [ ] |
```

### Extend mode:
1. Find the topic row (must already have `[x]` in Status)
2. Append extended set names to Sets column
3. Change `[ ]` to `[x]` in Extended column

Example change:
```
| Travel - planning and reservations | [x] | german_b1_travel_booking, german_b1_travel_info | 2026-01-04 | [ ] |
```
to:
```
| Travel - planning and reservations | [x] | german_b1_travel_booking, german_b1_travel_info, german_b1_travel_booking_ext_a, german_b1_travel_info_ext_b | 2026-01-04 | [x] |
```

6. Update "Summary" table - increment completed/extended counter

## Step 7: Summary

Display:
- Created files (2 sets)
- Total phrase count (60)
- Source language used
- Grammar constructions used (from mapping)
- Mode: normal or extend
- Updated progress (X/59 completed, Y extended)
