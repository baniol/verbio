Generate audio files for language learning phrases using AWS Polly.

```bash
python scripts/generate_audio.py
```

This script:
- Reads all lang_data/*.json files
- Generates MP3 audio for each phrase's target language answer
- Uses hash-based change detection - only modified phrases are regenerated
- Saves audio to frontend/audio/{set_id}/{phrase_id}.mp3

Requires AWS credentials configured (AWS_PROFILE in .env).
