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

## Step 5: Generate 2 sets of 30 phrases each (60 phrases total)

Each curriculum topic requires **2 sets** for comprehensive coverage:

1. **Set A** - `german_b1_{topic}_{aspect1}` - one aspect/situation of the topic
2. **Set B** - `german_b1_{topic}_{aspect2}` - another aspect/situation of the topic

### Topic split examples:

| Topic | Set A | Set B |
|-------|-------|-------|
| Travel - planning | `_travel_booking` (reservations, tickets) | `_travel_info` (directions, schedules, problems) |
| At the doctor | `_doctor_symptoms` (describing problems) | `_doctor_treatment` (advice, prescriptions, follow-up) |
| Job interview | `_interview_process` (questions, answers) | `_interview_experience` (CV, qualifications, expectations) |

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
      "accepted": ["variant 1", "variant 2"],
      "vocabulary": [
        {"word": "Zimmer", "base": "Zimmer", "type": "noun"},
        {"word": "reservieren", "base": "reservieren", "type": "verb"}
      ]
    }
  ]
}
```

### Vocabulary field (required for vocabulary mastery tracking):

Each phrase MUST include a `vocabulary` array with key words:

```json
"vocabulary": [
  {"word": "möchte", "base": "mögen", "type": "modal"},
  {"word": "Zimmer", "base": "Zimmer", "type": "noun"},
  {"word": "reservieren", "base": "reservieren", "type": "verb"}
]
```

Fields:
- `word` - the exact word form as it appears in the answer
- `base` - the base/infinitive form (for verbs: infinitive, for nouns: nominative singular)
- `type` - word type: `verb`, `noun`, `adjective`, `adverb`, `modal`, `preposition`

Include 2-4 key vocabulary items per phrase (focus on content words, skip articles/pronouns).

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

### Vocabulary Repetition Rule (Multi-Context Exposure)

**CRITICAL for retention:** Key vocabulary must appear in 2-3 different phrases within the 60-phrase topic to create multiple memory routes.

For each important vocabulary item (verbs, nouns, adjectives):
- Must appear in at least 2-3 different phrases across the 3 sets
- Vary sentence structure: question, statement, request, passive, Perfekt
- Vary situation: formal/informal, different speakers, different scenarios

**Example for "reservieren" in Travel topic:**
1. Set A: "Ich möchte ein Zimmer reservieren" (polite request, hotel)
2. Set A: "Haben Sie den Tisch reserviert?" (question, Perfekt, restaurant)
3. Set B: "Die Reservierung wurde bestätigt" (passive, confirmation email)

**Example for "empfehlen" in Restaurant topic:**
1. Set A: "Können Sie mir etwas empfehlen?" (question to waiter)
2. Set A: "Ich kann den Fisch empfehlen" (waiter's statement)
3. Set B: "Das Restaurant wurde mir empfohlen" (passive, explaining choice)

**How to apply:**
1. Before generating phrases, identify 8-10 key vocabulary items for the topic
2. Plan their distribution across the 2 sets
3. Ensure each key word appears in at least 2 different contexts
4. Vary grammatical structures (active/passive, tenses, sentence types)

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

### Naturalness over grammar showcase

**CRITICAL:** Do NOT force grammar constructions into every phrase. Prioritize how natives actually speak.

**Bad examples - forced, unnatural:**
- "Könnte ich Sie um den Weg zur nächsten Apotheke bitten?" (nobody talks like this)
- "Ich möchte wissen, wo die nächste Bushaltestelle ist" (overly formal)
- "Ich möchte mich über verfügbare Ausflüge informieren" (textbook German)

**Good examples - natural, direct:**
- "Können Sie mir sagen, wo die nächste Apotheke ist?" or simply "Wo ist hier eine Apotheke?"
- "Wo ist die nächste Bushaltestelle?"
- "Welche Ausflüge gibt es?"

**When to use Konjunktiv II (möchte, könnte, würde):**
- Actual requests for help: "Könnten Sie mir helfen?"
- Wishes/wants: "Ich möchte ein Zimmer reservieren"
- Hypotheticals: "Wenn ich Zeit hätte..."
- Softening demands: "Ich würde gerne bezahlen"

**When NOT to use Konjunktiv II:**
- Simple questions: "Wo ist...?" NOT "Ich möchte wissen, wo..."
- Asking for information: "Gibt es...?" NOT "Könnte ich erfahren, ob..."
- Direct inquiries: "Was kostet...?" NOT "Ich würde gerne wissen, was..."

**Rule of thumb:** If you can ask directly in the source language, use direct form in German too.

**Phrase content:**
- **30 phrases per set × 2 sets = 60 phrases per topic**
- Variety of scenarios within topic
- Practical, used in real situations
- Natural constructions that natives actually use
- Questions, statements, requests, reactions
- Each set should be standalone
- Prefer shorter, direct phrases over long formal constructions

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

After saving both sets, edit `docs/curriculum/curriculum-german-b1-progress.md`:

1. Find the topic row
2. Change `[ ]` to `[x]`
3. Add names of both sets (comma-separated)
4. Add today's date

Example change:
```
| Travel - planning and reservations | [ ] | | |
```
to:
```
| Travel - planning and reservations | [x] | german_b1_travel_booking, german_b1_travel_info | 2025-12-31 |
```

5. Update "Summary" table - increment completed counter

## Step 7: Summary

Display:
- Created files (2 sets)
- Total phrase count (60)
- Source language used
- Grammar constructions used (from mapping)
- Updated progress (X/57 completed)
