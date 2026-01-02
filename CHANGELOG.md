# Changelog

All notable changes to Verbio will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-01-02

### Added
- Configurable feature flag to show/hide alternative accepted answers

## [0.6.1] - 2026-01-02

### Fixed
- Speech recognition now matches compound words split by API (e.g., "entlanggehen" recognized as "entlang gehen")

## [0.6.0] - 2026-01-02

### Added
- Immediate retry mode for speech errors (repeat phrase until 2x correct)
- Toggle in Settings to enable/disable immediate retry (default: on)
- Translations for immediate retry feature (EN, PL, DE, ES, FR)

## [0.5.0] - 2026-01-01

### Added
- Build-time feature flags system via deployment/config.sh
- FEATURES.audio flag to conditionally enable audio playback in frontend

### Changed
- Build script now generates config.js with feature flags

## [0.4.0] - 2026-01-01

### Added
- Audio playback for phrases using AWS Polly neural voices
- Speaker button next to answers to play pronunciation
- Python script to generate audio files from phrase sets
- Pre-generated audio for German B1 travel sets

## [0.3.0] - 2026-01-01

### Added
- Per-language review sets for marking difficult phrases
- Star button in exercise view to add/remove phrases from review
- Review sets appear in set dropdown with phrase count

## [0.2.0] - 2026-01-01

### Added
- Improve speech feedback display with clearer visual indicators
- Default UI language to English

### Fixed
- Fetch git tags in build for Cloudflare Pages version display

## [0.1.0] - 2026-01-01

### Added
- Initial release
