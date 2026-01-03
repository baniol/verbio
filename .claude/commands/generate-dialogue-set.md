Generate a dialogue-based language learning set around a specific situation.

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

## Step 3: Design the dialogue

Create a realistic conversation for the situation. Consider:
- **Who**: Define 2 participants (e.g., customer & waiter, patient & doctor, tourist & local)
- **Where**: Specific location context
- **Flow**: Natural conversation progression with beginning, middle, end
- **Length**: 12-20 exchanges (turns), creating 12-20 phrases

### Dialogue structure:
1. **Opening** - greeting, initiating contact
2. **Core exchange** - main purpose of interaction (2-4 back-and-forth exchanges)
3. **Complications/details** - follow-up questions, clarifications, variations
4. **Closing** - thanks, goodbye, next steps

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
    "participants": ["{role1}", "{role2}"]
  },
  "phrases": [
    {
      "id": 1,
      "prompt": "Source language phrase",
      "answer": "Target language phrase",
      "accepted": ["lowercase variants"],
      "speaker": "{role1|role2}",
      "context": "Optional stage direction or context note"
    }
  ]
}
```

### New metadata fields:
- `type`: "dialogue" (distinguishes from regular phrase sets)
- `situation`: Description of the scenario
- `participants`: Array of two role names

### New phrase fields:
- `speaker`: Which participant says this line
- `context`: (optional) Stage direction like "pointing at menu", "looking confused"

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
- Each line responds to or builds on the previous
- Include realistic hesitations, confirmations, clarifications
- Mix questions and statements
- Vary sentence length (some short responses, some longer explanations)

### Practical learning value:
- Focus on phrases the learner would actually need to say
- Include common responses they'd hear (to understand)
- Cover likely variations and follow-ups
- Build vocabulary progressively within the dialogue

### Realism over textbook:
- Use contractions and informal speech where natives would
- Include filler words appropriately (well, so, actually)
- Avoid overly polite forms unless situation requires
- Match register to context (cafe vs. formal office)

### Speaker balance:
- Learner's role should have substantial speaking parts
- Include both initiating and responding
- Cover asking AND answering questions

### What to AVOID:
- Stilted, unnatural exchanges
- Every line being a complete formal sentence
- Ignoring what the other person just said
- Unrealistic scenarios within the situation

### Accepted alternatives:
Include all valid ways to say the same thing:
- Formal/informal variants
- Synonymous expressions
- Different word orders if grammatically correct
- Common contractions

## Step 6: Summary

Display:
- Created file path
- Situation and participants
- Number of exchanges
- Source → Target language
- Brief dialogue overview (first/last lines)
