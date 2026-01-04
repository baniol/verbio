"""
Lambda function for LLM-based answer validation.

Validates user speech recognition transcripts against expected answers
using Amazon Bedrock (Nova Lite) for intelligent, context-aware matching.
"""

import json

import boto3

bedrock = boto3.client("bedrock-runtime", region_name="eu-central-1")

# Language names for prompt context
LANGUAGE_NAMES = {
    "de": "German",
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "it": "Italian",
    "pl": "Polish",
    "pt": "Portuguese",
    "nl": "Dutch",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
}


def create_validation_prompt(
    user_answer: str, expected: str, prompt: str, language: str, vocabulary: list
) -> str:
    """Create the prompt for Nova to evaluate the answer."""
    lang_name = LANGUAGE_NAMES.get(language, language)

    vocab_str = ""
    if vocabulary:
        vocab_items = [
            f"{v.get('word', '')} ({v.get('type', 'word')})" for v in vocabulary
        ]
        vocab_str = f"\nKey vocabulary to check: {', '.join(vocab_items)}"

    return f"""You are evaluating a language learner's spoken answer in {lang_name}.

The learner was asked to translate:
"{prompt}"

Expected answer: "{expected}"
Learner's answer (from speech recognition): "{user_answer}"
{vocab_str}

IMPORTANT: The learner's answer comes from speech recognition which may contain:
- Minor transcription errors (homophones, unclear endings)
- Missing punctuation or capitalization
- Slightly different word boundaries

Your task: Determine if the learner demonstrated knowledge of the correct answer.

Respond with ONLY a valid JSON object (no markdown, no explanation):
{{
  "correct": <true if the answer demonstrates correct knowledge, false otherwise>,
  "grammar_ok": <true if grammar is correct or acceptably close, false if clear grammar error>,
  "meaning_preserved": <true if the meaning matches the expected answer>,
  "key_vocabulary_present": [<list of key vocabulary words that were correctly used>],
  "key_vocabulary_missing": [<list of key vocabulary words that were missing or wrong>],
  "errors": [<list of significant errors if any, empty array if none>],
  "minor_issues": [<list of minor issues that don't affect correctness>],
  "confidence": <0.0 to 1.0 confidence score>
}}

Be lenient with speech recognition artifacts but strict with actual language errors (wrong articles, wrong verb forms, wrong word order)."""


def invoke_nova(prompt: str) -> dict:
    """Call Amazon Nova Lite via Bedrock."""
    response = bedrock.invoke_model(
        modelId="eu.amazon.nova-lite-v1:0",
        contentType="application/json",
        accept="application/json",
        body=json.dumps(
            {
                "messages": [{"role": "user", "content": [{"text": prompt}]}],
                "inferenceConfig": {"maxTokens": 500, "temperature": 0.1, "topP": 0.9},
            }
        ),
    )

    result = json.loads(response["body"].read())
    output_text = result["output"]["message"]["content"][0]["text"]

    # Parse the JSON response from Nova
    # Handle potential markdown code blocks
    text = output_text.strip()
    if text.startswith("```"):
        # Remove markdown code block
        lines = text.split("\n")
        text = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    return json.loads(text)


def handler(event, context):
    """Lambda handler for answer validation."""
    # Handle both direct invocation and API Gateway
    if isinstance(event.get("body"), str):
        body = json.loads(event["body"])
    else:
        body = event.get("body") or event

    # Extract request parameters
    user_answer = body.get("user_answer", "")
    expected = body.get("expected", "")
    prompt = body.get("prompt", "")
    language = body.get("language", "de")
    vocabulary = body.get("vocabulary", [])

    # Handle warmup requests
    if user_answer == "warmup" and expected == "warmup":
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            "body": json.dumps({"warmup": True}),
        }

    # Validate required fields
    if not user_answer or not expected:
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps(
                {"error": "Missing required fields: user_answer, expected"}
            ),
        }

    try:
        # Create prompt and invoke Nova
        validation_prompt = create_validation_prompt(
            user_answer=user_answer,
            expected=expected,
            prompt=prompt,
            language=language,
            vocabulary=vocabulary,
        )

        result = invoke_nova(validation_prompt)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            "body": json.dumps(result),
        }

    except json.JSONDecodeError as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": f"Failed to parse LLM response: {str(e)}"}),
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
