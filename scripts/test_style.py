#!/usr/bin/env python3
"""
Quick style testing script for DALL-E 3.
Edit image_style.txt and run this to generate a test image.
"""

import os
from io import BytesIO
from pathlib import Path

import requests
from dotenv import load_dotenv
from openai import OpenAI
from PIL import Image

load_dotenv()

PROJECT_ROOT = Path(__file__).parent.parent
STYLE_FILE = Path(__file__).parent / "image_style.txt"
OUTPUT_FILE = PROJECT_ROOT / "frontend" / "images" / "test_style.webp"


def main():
    prompt = STYLE_FILE.read_text().strip()
    print(f"Prompt:\n{prompt}\n")
    print("Generating...")

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url
    image_response = requests.get(image_url)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    img = Image.open(BytesIO(image_response.content))
    img.save(OUTPUT_FILE, "WEBP", quality=85)

    print(f"Saved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
