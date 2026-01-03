Generate a roleplay dialogue set - independent micro-dialogues (question-answer pairs) from a given situation.

Arguments: $ARGUMENTS

IMPORTANT: If no arguments provided or required arguments missing, show help and stop:

```
Usage: /generate-dialogue-set <target_language> <situation> [source_language]

Arguments:
  target_language  - language to learn (german, spanish, french, italian)
  situation        - dialogue scenario in quotes (e.g., "ordering coffee", "at the doctor", "checking into hotel")
  source_language  - (optional) prompt language, default: english
                     options: english, polish, spanish, french, german

Examples:
  /generate-dialogue-set german "ordering at a cafe"
  /generate-dialogue-set spanish "asking for directions" polish
  /generate-dialogue-set french "job interview"
  /generate-dialogue-set italian "at the pharmacy" english
```

ONLY proceed if target_language AND situation are provided.

---

## Step 1: Parse arguments

- `target_language` = first argument
- `situation` = text in quotes (or second argument if no quotes)
- `source_language` = last argument if it's a language name, else "english"

## Step 2: Check existing sets

Read all `lang_data/*.json` to:
- Avoid duplicating dialogues
- Maintain consistent style

## Step 3: Design INDEPENDENT micro-dialogues

**CRITICAL: Each phrase is a STANDALONE exchange. Not a sequential conversation!**

Each phrase is an independent mini-dialogue where:
- Someone says something (contextLine)
- User responds appropriately (answer)

The user can practice these in ANY ORDER - they must make sense independently.

### Participants:
- Define 2 participants (e.g., customer & waiter, patient & doctor, guest & receptionist)
- First participant is `defaultRole` (the learner's typical role)

### Phrase structure:
Each phrase is ONE independent exchange:
- `contextLine` - what the other person says (in target language) - displayed as context
- `contextSpeaker` - who says the context line
- `prompt` - user's response in SOURCE language - what user must TRANSLATE
- `answer` - user's response in TARGET language - the correct translation
- `speaker` - who is responding (for role filtering)

**IMPORTANT:** `prompt` is NOT a translation of contextLine! It's the response text in source language that user needs to translate.

### CRITICAL: Independent exchanges
Each phrase must make complete sense on its own. Examples of GOOD independent exchanges:

**Good (hotel check-in):**
- Context: "How can I help you?" → Answer: "I have a reservation for Kowalski"
- Context: "Would you like a room with a view?" → Answer: "Yes, please, with a city view"
- Context: "Breakfast is included" → Answer: "Great, what time is it served?"
- Context: "How would you like to pay?" → Answer: "By card, please"

Each one is a complete, independent mini-conversation!

**BAD (don't do this):**
- Context: "Breakfast is from 7 to 10" → Answer: "Can I have a room with a view?" (UNRELATED!)

### Coverage:
- 10-15 pairs per role (20-30 total phrases)
- Cover various aspects of the situation
- Each exchange is self-contained

## Step 4: Generate the file

Filename: `lang_data/{target_language}_dialogue_{situation_snake_case}.json`

```json
{
  "metadata": {
    "id": "{target_language}_dialogue_{situation_snake_case}",
    "name": "{Target Language} - {Situation Title}",
    "language": "{target_iso_code}",
    "speechLang": "{target_speech_lang_code}",
    "sourceLanguage": "{source_iso_code}",
    "sourceSpeechLang": "{source_speech_lang_code}",
    "type": "dialogue",
    "situation": "{situation description}",
    "participants": ["{role1}", "{role2}"],
    "defaultRole": "{role1}"
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "I'd like a coffee, please",
      "answer": "Ich hätte gerne einen Kaffee, bitte",
      "accepted": ["ich hätte gerne einen kaffee bitte", "ich möchte einen kaffee bitte"],
      "speaker": "customer",
      "contextLine": "Hallo, was darf es sein?",
      "contextSpeaker": "waiter"
    }
  ]
}
```

### Metadata fields:
- `type`: "dialogue" (enables roleplay mode)
- `situation`: Description of the scenario
- `participants`: Array of two role names
- `defaultRole`: Which role the learner practices by default

### Phrase fields:
- `prompt` - translation of contextLine (source language) - what user sees
- `answer` - user's response (target language) - what user must say
- `accepted` - lowercase variants for validation
- `speaker` - who is responding (for role filtering)
- `contextLine` - what the other person said (target language)
- `contextSpeaker` - who says the context line

Language codes:
| Language | ISO | Speech |
|----------|-----|--------|
| german   | de  | de-DE  |
| spanish  | es  | es-ES  |
| french   | fr  | fr-FR  |
| italian  | it  | it-IT  |
| english  | en  | en-US  |
| polish   | pl  | pl-PL  |

## Step 5: Quality guidelines

### Independent exchanges:
- EVERY phrase must make sense on its own
- Context and answer must be logically connected
- User can practice in random order

### Practical learning value:
- Focus on phrases the learner would actually need
- Cover common scenarios within the situation
- Include polite forms where appropriate

### Role balance:
- Each role should have 10-15 meaningful phrases
- Cover both initiating and responding situations

### Accepted alternatives:
Include all valid ways to say the same thing:
- `möchte` / `hätte gerne` / `würde gerne`
- `kann ich` / `könnte ich` / `darf ich`
- Formal/informal variants
- Common synonyms

## Step 6: Summary

Display:
- Created file path
- Situation and participants (with default role)
- Number of phrases per role
- Source → Target language
- Example phrase (first one)
