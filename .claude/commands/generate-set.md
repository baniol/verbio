Generate a new language learning set with phrases.

Arguments: $ARGUMENTS

IMPORTANT: If no arguments provided, or if ANY of the required arguments is missing, ONLY show the help message below and DO NOT generate any file:

```
Usage: /generate-set <count> <target_language> <level> <topic> [source_language]

Arguments:
  count            - number of phrases to generate (e.g., 10, 20, 50)
  target_language  - language to learn (e.g., german, spanish, french, italian)
  level            - difficulty: basic, middle, advanced
  topic            - theme (e.g., "restaurant", "travel", "business", "everyday")
  source_language  - (optional) prompt language, default: english
                     options: english, polish, spanish, french, german

Examples:
  /generate-set 15 german basic restaurant
  /generate-set 20 spanish middle travel english
  /generate-set 10 french advanced business polish
```

ONLY if at least 4 arguments are provided, proceed with generation:

## Step 1: Parse arguments

- `count` = first argument (number)
- `target_language` = second argument  
- `level` = third argument
- `topic` = fourth argument
- `source_language` = fifth argument OR "english" if not provided

## Step 2: Check existing sets

Before generating, read all existing files in `lang_data/*.json` to:
- Avoid duplicating phrases that already exist
- Maintain consistent style and quality
- Build on existing vocabulary (reference learned words naturally)
- Ensure variety across sets

## Step 3: Generate the file

Create filename: `lang_data/{target_language}_{topic}.json` (lowercase, underscores)

Use this structure:
```json
{
  "metadata": {
    "id": "{target_language}_{topic}",
    "name": "{Target Language} - {Topic} ({Level})",
    "language": "{target_iso_code}",
    "speechLang": "{target_speech_lang_code}",
    "sourceLanguage": "{source_iso_code}",
    "sourceSpeechLang": "{source_speech_lang_code}"
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "Source language phrase",
      "answer": "Target language phrase",
      "accepted": ["lowercase accepted answer", "alternative if exists"]
    }
  ]
}
```

Language codes:
| Language | ISO code | Speech code |
|----------|----------|-------------|
| german   | de       | de-DE       |
| spanish  | es       | es-ES       |
| french   | fr       | fr-FR       |
| italian  | it       | it-IT       |
| english  | en       | en-US       |
| polish   | pl       | pl-PL       |

## Quality Guidelines

### Phrase selection criteria:
- **Frequency-based**: Prioritize statistically most common words/phrases in the target language
- **Natural constructions**: Use native speaker patterns, NOT literal translations
- **Contextual variety**: Mix different sentence types (questions, statements, requests, exclamations)
- **Practical usage**: Focus on phrases actually used in real conversations
- **Grammar through context**: Introduce grammar naturally through examples, not isolated drills
- **Natural collocations**: Use correct word combinations natives would use

### What to AVOID:
- Artificial textbook phrases nobody uses in real life
- Overly formal language when casual is more common (and vice versa)
- Direct word-for-word translations that sound unnatural
- Phrases that are grammatically correct but natives wouldn't say
- Duplicating phrases from existing sets

### Level complexity:
- **basic**: Simple words, common phrases, present tense, short sentences
- **middle**: Compound sentences, past/future tense, broader vocabulary, polite forms
- **advanced**: Idioms, subjunctive/conditional, professional vocabulary, complex grammar

### Topic structure - ensure variety within the topic:

For each topic, cover multiple sub-scenarios. Examples:

**restaurant**: ordering, asking for recommendations, dietary restrictions, complaints, paying, reservations
**travel**: directions, tickets, schedules, emergencies, small talk, practical questions
**accommodation**: check-in, requests, problems, check-out, amenities
**shopping**: prices, sizes, returns, preferences, payment
**business**: introductions, meetings, emails, negotiations, deadlines

### Format requirements:
- Prompts are in the SOURCE language (with proper native characters)
- Answers are in the TARGET language (with proper native characters)
- `accepted` array contains lowercase versions of valid answers
- Do NOT include keyboard variants (like ue/ae/oe/ss) - this app uses speech recognition only

### Accepted alternatives - IMPORTANT

The `accepted` array must include ALL grammatically correct variations that a learner might say. Always consider:

**German-specific alternatives:**
- `darf ich` / `kann ich` (permission vs ability - both valid in most contexts)
- `dem` / `meinem` (the/my - e.g., "mit dem Fahrrad" / "mit meinem Fahrrad")
- `möchte` / `will` / `würde gerne` (would like variations)
- `bekommen` / `haben` / `kriegen` (to get/have)
- Formal `Sie` vs informal `du` forms (when context allows both)

**General alternatives (all languages):**
- Synonymous verbs (go/travel, buy/get, etc.)
- Articles vs possessives (the car / my car)
- Demonstratives (the / this / that)
- Polite variations (can I / could I / may I)
- Word order variations if grammatically correct
- Contractions vs full forms

When in doubt, include the alternative - it's better to accept a correct answer than reject it.

## Step 4: Summary

Display:
- Created file path
- Number of phrases generated
- Source language → Target language
- Level and topic
