#!/usr/bin/env python3
"""
Local test script for the validation Lambda.

Usage:
    python test_local.py

Requires:
    - AWS credentials configured (same as generate_audio.py)
    - .env file with AWS_PROFILE
"""

import json
import os
import sys
from pathlib import Path

# Add project root to path for .env loading
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv(project_root / ".env")

# Set AWS profile for boto3
os.environ["AWS_PROFILE"] = os.getenv("AWS_PROFILE", "")
os.environ["AWS_DEFAULT_REGION"] = "eu-central-1"

# Now import the handler
from validate_answer import handler


def test_case(name: str, event: dict) -> None:
    """Run a single test case."""
    print(f"\n{'=' * 60}")
    print(f"Test: {name}")
    print(f"{'=' * 60}")
    print(f"Input: {json.dumps(event, ensure_ascii=False)}")

    try:
        result = handler(event, None)
        body = (
            json.loads(result["body"])
            if isinstance(result.get("body"), str)
            else result
        )
        print(f"Status: {result.get('statusCode', 'N/A')}")
        print(f"Output: {json.dumps(body, indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"Error: {e}")


def main():
    print("LLM Validation Lambda - Local Test")
    print("=" * 60)

    # Test 1: Exact match
    test_case(
        "Exact match (should be correct)",
        {
            "user_answer": "guten tag",
            "expected": "Guten Tag",
            "prompt": "Dzień dobry",
            "language": "de",
        },
    )

    # Test 2: Minor speech recognition difference
    test_case(
        "Minor SR difference (should be correct)",
        {
            "user_answer": "wo ist die straße",
            "expected": "Wo ist diese Straße?",
            "prompt": "Gdzie jest ta ulica?",
            "language": "de",
            "vocabulary": [
                {"word": "Straße", "type": "noun"},
                {"word": "diese", "type": "pronoun"},
            ],
        },
    )

    # Test 3: Grammar error
    test_case(
        "Grammar error - wrong article (should catch error)",
        {
            "user_answer": "ich möchte eine kaffee",
            "expected": "Ich möchte einen Kaffee",
            "prompt": "Chciałbym kawę",
            "language": "de",
            "vocabulary": [
                {"word": "möchte", "base": "mögen", "type": "verb"},
                {"word": "Kaffee", "type": "noun"},
            ],
        },
    )

    # Test 4: Completely wrong
    test_case(
        "Wrong answer (should be incorrect)",
        {
            "user_answer": "ich habe hunger",
            "expected": "Guten Morgen",
            "prompt": "Dzień dobry (rano)",
            "language": "de",
        },
    )

    # Test 5: Warmup request
    test_case(
        "Warmup request",
        {
            "user_answer": "warmup",
            "expected": "warmup",
            "prompt": "warmup",
            "language": "de",
        },
    )

    # Test 6: Spanish
    test_case(
        "Spanish - minor difference",
        {
            "user_answer": "buenos dias",
            "expected": "Buenos días",
            "prompt": "Dzień dobry",
            "language": "es",
        },
    )
    })

    print("\n" + "=" * 60)
    print("Tests complete!")


if __name__ == "__main__":
    main()
