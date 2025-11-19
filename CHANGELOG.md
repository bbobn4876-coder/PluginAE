# Changelog

All notable changes to PluginAE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- GPU acceleration support
- Real-time preview optimization
- Preset animation keyframing
- Batch preset application
- Preset import/export functionality
- Custom UI for preset editing

## [1.0.0] - 2025-11-19

### Added
- Initial release of PluginAE
- Core plugin architecture for Adobe After Effects
- Preset management system with JSON configuration
- 12 built-in presets:
  - 3 Transition presets (Fade, Zoom Blur, Slide)
  - 4 Effect presets (Blur, Sharpen, Film Grain, Vignette)
  - 5 Color grading presets (Cinematic Blue, Warm Sunset, Teal & Orange, Black & White, Vintage Film)
- Intensity control (0-100%)
- Blend mode options
- Cross-platform support (Windows & macOS)
- CMake build system
- Comprehensive documentation:
  - Build instructions
  - Preset creation guide
  - Development guide
- JSON schema for preset validation
- Sample presets for each category

### Technical Features
- Support for 8-bit color depth
- Deep color aware (16-bit, 32-bit)
- Float color support
- Smart rendering optimization
- PiPL resource integration
- Extensible preset architecture

### Documentation
- README with quick start guide
- BUILD_INSTRUCTIONS.md for compilation
- PRESET_CREATION.md for custom presets
- DEVELOPMENT.md for contributors
- Inline code documentation

### Project Structure
- Organized source code layout
- Separate preset directories by type
- Example presets with documentation
- .gitignore for clean repository
- MIT License
- EditorConfig for code style consistency

## Version History

### Version Numbering
- **Major version**: Incompatible API changes
- **Minor version**: New functionality (backwards compatible)
- **Patch version**: Bug fixes (backwards compatible)

---

[Unreleased]: https://github.com/yourusername/PluginAE/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/PluginAE/releases/tag/v1.0.0
