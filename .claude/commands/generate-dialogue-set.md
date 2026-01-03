Generate a roleplay dialogue set - user picks a role and practices their lines.

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
- Reference learned vocabulary naturally

## Step 3: Design the dialogue as Q&A pairs

Create pairs where user hears what the other person says and must respond.

**Key concept:** Each phrase is a response to something the other person said.

### Participants:
- Define 2 participants (e.g., customer & waiter, patient & doctor, guest & receptionist)
- First participant is `defaultRole` (the learner's typical role)

### Phrase structure:
Each phrase represents ONE exchange:
- `contextLine` - what the other person says (in target language) - displayed as context
- `prompt` - what the other person says (in source language) - what user sees to understand
- `answer` - user's response (in source language) - shown after answering
- `targetAnswer` - user's response (in target language) - what user must say
- `speaker` - who is responding (for role filtering)

### Dialogue coverage:
- 10-15 pairs per role (20-30 total phrases)
- Cover the full conversation flow
- Each role should have meaningful responses

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
      "prompt": "I'd like a coffee please",
      "answer": "Ich hätte gerne einen Kaffee bitte",
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
- `prompt` - what user needs to translate (source language)
- `answer` - correct translation (target language)
- `accepted` - lowercase variants of answer for validation
- `speaker` - who is giving this response (for role filtering)
- `contextLine` - what the other person said (target language) - shown as context
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

## Step 5: Dialogue quality guidelines

### Natural conversation flow:
- Each response logically follows the context
- Include realistic reactions, confirmations, follow-up questions
- Mix questions and statements
- Vary sentence length

### Practical learning value:
- Focus on phrases the learner would actually need to say
- Cover common scenarios within the situation
- Include polite forms where appropriate
- Build vocabulary progressively

### Role balance:
- Each role should have 10-15 meaningful phrases
- Cover both initiating and responding
- Include asking AND answering questions for each role

### What to AVOID:
- One-word responses (unless natural)
- Overly complex sentences
- Phrases that don't make sense without visual context
- Redundant/similar phrases

### Accepted alternatives:
Include all valid ways to say the same thing:
- `möchte` / `hätte gerne` / `würde gerne`
- `kann ich` / `könnte ich` / `darf ich`
- Formal/informal variants where both are acceptable
- Common synonyms

## Step 6: Summary

Display:
- Created file path
- Situation and participants (with default role)
- Number of phrases per role
- Source → Target language
- Example phrase (first one)
