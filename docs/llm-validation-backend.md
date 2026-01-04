# LLM Validation Backend - Specyfikacja

## Problem

Obecna walidacja (string matching) ma poważne ograniczenia:
1. **Google Speech Recognition** często przekręca słowa
2. **Brak tolerancji** dla poprawnych wariantów ("die Straße" vs "diese Straße")
3. **Fałszywe błędy** zanieczyszczają dane Weak Vocabulary
4. **Nie wykrywa** prawdziwych błędów gramatycznych (der/die/das)

## Rozwiązanie

LLM (Amazon Nova) ocenia odpowiedź użytkownika zamiast prostego porównania stringów.

```
User mówi → Google SR → transcript → Lambda → Nova → strukturalna ocena
                                                          ↓
                                              {correct, grammar_ok, feedback}
```

---

## Architektura

```
┌─────────────┐     HTTPS      ┌─────────────┐     ┌─────────────┐
│  Frontend   │ ───────────→  │ API Gateway │ ──→ │   Lambda    │
│  (browser)  │ ←───────────  │             │ ←── │  (Python)   │
└─────────────┘               └─────────────┘     └──────┬──────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │   Bedrock   │
                                                  │ (Nova Lite) │
                                                  └─────────────┘
```

---

## Komponenty AWS

### 1. Lambda Function

**Runtime:** Python 3.12
**Memory:** 256 MB
**Timeout:** 10s
**Region:** eu-central-1 (lub gdzie masz Bedrock)

**Kod (zarys):**
```python
import json
import boto3

bedrock = boto3.client('bedrock-runtime')

def handler(event, context):
    body = json.loads(event['body'])
    
    user_answer = body['user_answer']      # transcript z Google SR
    expected_answer = body['expected']      # oczekiwana odpowiedź
    source_prompt = body['prompt']          # prompt w języku źródłowym
    target_language = body['language']      # np. "de"
    vocabulary = body.get('vocabulary', []) # kluczowe słowa
    
    prompt = f"""Oceń odpowiedź ucznia w języku {target_language}.

Pytanie: {source_prompt}
Oczekiwana odpowiedź: {expected_answer}
Odpowiedź ucznia: {user_answer}
Kluczowe słownictwo: {vocabulary}

Odpowiedz w JSON:
{{
  "correct": true/false,
  "grammar_ok": true/false,
  "meaning_preserved": true/false,
  "key_vocabulary_present": ["słowo1", "słowo2"],
  "key_vocabulary_missing": ["słowo3"],
  "errors": ["opis błędu jeśli są"],
  "minor_issues": ["drobne uwagi"],
  "confidence": 0.0-1.0
}}

Uwzględnij że transcript może zawierać błędy rozpoznawania mowy.
Bądź tolerancyjny dla drobnych różnic, ale łap błędy gramatyczne."""

    response = bedrock.invoke_model(
        modelId='amazon.nova-lite-v1:0',
        body=json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 300,
                "temperature": 0.1
            }
        })
    )
    
    result = json.loads(response['body'].read())
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': result['results'][0]['outputText']
    }
```

### 2. API Gateway

**Typ:** HTTP API (tańsze niż REST API)
**Endpoint:** `POST /validate`
**CORS:** Enabled dla domeny aplikacji

### 3. Bedrock Model

**Model:** `amazon.nova-lite-v1:0`
**Koszt:** ~$0.06/1M input tokens, ~$0.24/1M output tokens
**Alternatywy:**
- `amazon.nova-micro-v1:0` - tańszy, może wystarczyć
- `anthropic.claude-3-haiku` - droższy ale lepszy

---

## Request/Response Format

### Request (Frontend → Lambda)

```json
{
  "user_answer": "wo ist die Straße",
  "expected": "Wo ist diese Straße?",
  "prompt": "Gdzie jest ta ulica?",
  "language": "de",
  "vocabulary": [
    {"word": "Straße", "type": "noun"},
    {"word": "diese", "type": "pronoun"}
  ]
}
```

### Response (Lambda → Frontend)

```json
{
  "correct": true,
  "grammar_ok": true,
  "meaning_preserved": true,
  "key_vocabulary_present": ["Straße", "wo", "ist"],
  "key_vocabulary_missing": ["diese"],
  "errors": [],
  "minor_issues": ["'die' zamiast 'diese' - inna określoność"],
  "confidence": 0.85
}
```

---

## Integracja z Frontend

### Nowy flow w app.js

```javascript
async function validateWithLLM(transcript, phrase) {
  // Fallback jeśli offline lub błąd
  if (!navigator.onLine) {
    return validateLocally(transcript, phrase);
  }
  
  try {
    const response = await fetch(CONFIG.VALIDATION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_answer: transcript,
        expected: phrase.answer,
        prompt: phrase.prompt,
        language: currentSet.metadata.language,
        vocabulary: phrase.vocabulary || []
      })
    });
    
    if (!response.ok) throw new Error('API error');
    
    return await response.json();
  } catch (error) {
    console.warn('LLM validation failed, falling back to local:', error);
    return validateLocally(transcript, phrase);
  }
}

// Użycie w showSpeechResult
async function processSpeechResult(transcript) {
  const validation = await validateWithLLM(transcript, currentPhrase);
  
  // Aktualizuj vocabulary mastery na podstawie validation.key_vocabulary_*
  if (validation.key_vocabulary_present) {
    updateVocabMasteryFromLLM(currentPhrase, validation);
  }
  
  showResult(validation.correct, transcript, validation);
}
```

### Config

```javascript
// config.js
const CONFIG = {
  VALIDATION_API_URL: 'https://xxx.execute-api.eu-central-1.amazonaws.com/validate',
  USE_LLM_VALIDATION: true,  // feature flag
  LLM_VALIDATION_TIMEOUT: 5000
};
```

---

## Warmup Strategy

Aby uniknąć cold start przy rozpoczęciu sesji:

```javascript
// Przy ładowaniu aplikacji
async function warmupValidationAPI() {
  if (!CONFIG.USE_LLM_VALIDATION) return;
  
  try {
    await fetch(CONFIG.VALIDATION_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_answer: 'warmup',
        expected: 'warmup',
        prompt: 'warmup',
        language: 'de',
        vocabulary: []
      })
    });
  } catch (e) {
    // Ignore warmup errors
  }
}

// Wywołaj przy starcie
document.addEventListener('DOMContentLoaded', warmupValidationAPI);
```

---

## Koszty (szacunkowe)

| Intensywność | Frazy/dzień | Tokeny/dzień | Koszt/mies |
|--------------|-------------|--------------|------------|
| Lekka        | 50          | ~10K         | ~$0.01     |
| Średnia      | 200         | ~40K         | ~$0.05     |
| Intensywna   | 500         | ~100K        | ~$0.10     |

Praktycznie darmowe.

---

## Deployment

### Terraform/CDK (do zrobienia)

```
infrastructure/
├── lambda/
│   └── validate_answer.py
├── terraform/
│   ├── main.tf
│   ├── lambda.tf
│   ├── api_gateway.tf
│   └── variables.tf
└── README.md
```

### Ręczny deployment (na szybko)

1. Stwórz Lambda w konsoli AWS
2. Dodaj warstwę boto3 (jeśli potrzebna)
3. Skonfiguruj rolę IAM z `bedrock:InvokeModel`
4. Stwórz HTTP API w API Gateway
5. Podłącz Lambda jako integrację
6. Dodaj URL do config.js

---

## Fallback (offline/error)

Gdy LLM niedostępny, używamy obecnej walidacji:

```javascript
function validateLocally(transcript, phrase) {
  const normalized = transcript.toLowerCase().trim();
  const accepted = phrase.accepted || [phrase.answer.toLowerCase()];
  const isCorrect = accepted.some(a => normalized.includes(a) || a.includes(normalized));
  
  return {
    correct: isCorrect,
    grammar_ok: null,  // nie wiemy
    meaning_preserved: null,
    key_vocabulary_present: [],
    key_vocabulary_missing: [],
    errors: [],
    minor_issues: [],
    confidence: 0.5,
    fallback: true
  };
}
```

---

## TODO

- [ ] Stworzenie Lambda function
- [ ] Konfiguracja API Gateway
- [ ] IAM role dla Bedrock
- [ ] Integracja w frontend (validateWithLLM)
- [ ] Warmup przy starcie aplikacji
- [ ] Aktualizacja vocabulary mastery z danych LLM
- [ ] Feature flag w config
- [ ] Testy z różnymi językami (DE, ES, FR)
