#!/usr/bin/env python3
"""
Generate audio files for language learning phrases using AWS Polly.

Reads all lang_data/*.json files and generates MP3 audio for each phrase's
target language answer. Uses a manifest to track generated files and skip
unchanged phrases on subsequent runs.

Usage:
    python scripts/generate_audio.py

Requires:
    - AWS CLI configured with named profile
    - .env file with AWS_PROFILE=your-profile-name
    - pip install boto3 python-dotenv
"""

import json
import hashlib
import os
from pathlib import Path

import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
LANG_DATA_DIR = PROJECT_ROOT / "lang_data"
AUDIO_DIR = PROJECT_ROOT / "frontend" / "audio"
MANIFEST_PATH = AUDIO_DIR / "manifest.json"

# AWS Polly neural voice mapping (female voices)
VOICE_MAP = {
    "de-DE": "Vicki",
    "en-US": "Joanna",
    "en-GB": "Amy",
    "es-ES": "Lucia",
    "es-MX": "Mia",
    "fr-FR": "Lea",
    "it-IT": "Bianca",
    "pl-PL": "Ola",
    "pt-BR": "Camila",
    "nl-NL": "Laura",
    "ja-JP": "Kazuha",
    "ko-KR": "Seoyeon",
    "zh-CN": "Zhiyu",
}


def get_text_hash(text: str) -> str:
    """Compute MD5 hash of text for change detection."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def load_manifest() -> dict:
    """Load existing manifest or return empty dict."""
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_manifest(manifest: dict) -> None:
    """Save manifest to disk."""
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)


def get_polly_client() -> boto3.client:
    """Create Polly client using AWS profile from .env."""
    profile_name = os.getenv("AWS_PROFILE")
    if not profile_name:
        raise ValueError("AWS_PROFILE not set in .env file")

    session = boto3.Session(profile_name=profile_name)
    return session.client("polly")


def generate_audio(polly_client, text: str, voice_id: str, output_path: Path) -> None:
    """Generate MP3 audio using AWS Polly neural engine."""
    response = polly_client.synthesize_speech(
        Text=text,
        OutputFormat="mp3",
        VoiceId=voice_id,
        Engine="neural",
        SampleRate="24000",
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(response["AudioStream"].read())


def process_language_set(polly_client, json_path: Path, manifest: dict) -> tuple[int, int]:
    """
    Process a single language set JSON file.

    Returns:
        Tuple of (generated_count, skipped_count)
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    set_id = data["metadata"]["id"]
    speech_lang = data["metadata"]["speechLang"]

    # Get voice for this language
    voice_id = VOICE_MAP.get(speech_lang)
    if not voice_id:
        print(f"  Warning: No voice mapping for {speech_lang}, skipping set {set_id}")
        return 0, 0

    # Ensure set exists in manifest
    if set_id not in manifest:
        manifest[set_id] = {}

    generated = 0
    skipped = 0

    for phrase in data["phrases"]:
        phrase_id = str(phrase["id"])
        answer_text = phrase["answer"]
        text_hash = get_text_hash(answer_text)

        # Check if already generated with same hash
        existing = manifest[set_id].get(phrase_id)
        if existing and existing.get("hash") == text_hash:
            skipped += 1
            continue

        # Generate audio
        output_path = AUDIO_DIR / set_id / f"{phrase_id}.mp3"
        print(f"  Generating: {set_id}/{phrase_id}.mp3 - '{answer_text[:30]}...'")

        try:
            generate_audio(polly_client, answer_text, voice_id, output_path)
            manifest[set_id][phrase_id] = {
                "hash": text_hash,
                "file": f"{phrase_id}.mp3"
            }
            generated += 1
        except Exception as e:
            print(f"    Error: {e}")

    return generated, skipped


def main():
    print("AWS Polly Audio Generator")
    print("=" * 40)

    # Initialize Polly client
    try:
        polly_client = get_polly_client()
        print(f"Using AWS profile: {os.getenv('AWS_PROFILE')}")
    except Exception as e:
        print(f"Error initializing AWS Polly: {e}")
        return 1

    # Load manifest
    manifest = load_manifest()

    # Find all language set JSON files
    json_files = sorted(LANG_DATA_DIR.glob("*.json"))
    if not json_files:
        print(f"No JSON files found in {LANG_DATA_DIR}")
        return 1

    print(f"Found {len(json_files)} language set(s)")
    print()

    total_generated = 0
    total_skipped = 0

    for json_path in json_files:
        print(f"Processing: {json_path.name}")
        generated, skipped = process_language_set(polly_client, json_path, manifest)
        total_generated += generated
        total_skipped += skipped
        print(f"  Generated: {generated}, Skipped: {skipped}")
        print()

    # Save updated manifest
    save_manifest(manifest)

    print("=" * 40)
    print(f"Total generated: {total_generated}")
    print(f"Total skipped (unchanged): {total_skipped}")
    print(f"Manifest saved to: {MANIFEST_PATH}")

    return 0


if __name__ == "__main__":
    exit(main())
