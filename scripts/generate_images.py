#!/usr/bin/env python3
"""
Generate images for language learning phrases using OpenAI DALL-E 3.

Reads all lang_data/*.json files and generates images for phrases that have
an imageDescription field. Uses a manifest to track generated files and skip
unchanged phrases on subsequent runs.

Usage:
    python scripts/generate_images.py

Requires:
    - .env file with OPENAI_API_KEY=your-api-key
    - pip install openai python-dotenv pillow
"""

import hashlib
import json
import os
from io import BytesIO
from pathlib import Path

import requests
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image

# Load environment variables
load_dotenv()

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
LANG_DATA_DIR = PROJECT_ROOT / "lang_data"
IMAGE_DIR = PROJECT_ROOT / "frontend" / "images"
MANIFEST_PATH = IMAGE_DIR / "manifest.json"


def get_content_hash(style: str, description: str) -> str:
    """Compute MD5 hash of style + description for change detection."""
    combined = f"{style}|{description}"
    return hashlib.md5(combined.encode("utf-8")).hexdigest()


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


def get_openai_client() -> OpenAI:
    """Create OpenAI client using API key from .env."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set in .env file")
    return OpenAI(api_key=api_key)


def generate_image(client: OpenAI, prompt: str, output_path: Path) -> None:
    """Generate image using DALL-E 3 and save as WebP."""
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    # Download the image from URL
    image_url = response.data[0].url
    image_response = requests.get(image_url)
    image_response.raise_for_status()

    # Convert to WebP and save
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(BytesIO(image_response.content))
    img.save(output_path, "WEBP", quality=85)


def process_language_set(
    client: OpenAI, json_path: Path, manifest: dict
) -> tuple[int, int]:
    """
    Process a single language set JSON file.

    Returns:
        Tuple of (generated_count, skipped_count)
    """
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    set_id = data["metadata"]["id"]
    image_style = data["metadata"].get("imageStyle")

    # Skip sets without imageStyle
    if not image_style:
        return 0, 0

    # Ensure set exists in manifest
    if set_id not in manifest:
        manifest[set_id] = {}

    generated = 0
    skipped = 0

    for phrase in data["phrases"]:
        phrase_id = str(phrase["id"])
        image_description = phrase.get("imageDescription")

        # Skip phrases without imageDescription
        if not image_description:
            continue

        content_hash = get_content_hash(image_style, image_description)

        # Check if already generated with same hash
        existing = manifest[set_id].get(phrase_id)
        if existing and existing.get("hash") == content_hash:
            skipped += 1
            continue

        # Build the full prompt
        full_prompt = f"{image_style}\n\nScene: {image_description}"

        # Generate image
        output_path = IMAGE_DIR / set_id / f"{phrase_id}.webp"
        print(f"  Generating: {set_id}/{phrase_id}.webp")
        print(f"    Description: {image_description[:60]}...")

        try:
            generate_image(client, full_prompt, output_path)
            manifest[set_id][phrase_id] = {
                "hash": content_hash,
                "file": f"{phrase_id}.webp",
            }
            generated += 1
        except Exception as e:
            print(f"    Error: {e}")

    return generated, skipped


def main():
    print("DALL-E 3 Image Generator")
    print("=" * 40)

    # Initialize OpenAI client
    try:
        client = get_openai_client()
        print("OpenAI client initialized")
    except Exception as e:
        print(f"Error initializing OpenAI: {e}")
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
        generated, skipped = process_language_set(client, json_path, manifest)
        if generated > 0 or skipped > 0:
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
