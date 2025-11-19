# Changelog

All notable changes to PluginAE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- GPU acceleration support
- LUT file import
- Preset animations with keyframes
- Cloud sync for preset collections
- Collaborative preset sharing

## [2.0.0] - 2025-11-19

### Added - Major Update
#### Preset Manager V2
- **Category System**: Organize presets into custom categories
- **Advanced Search**: Search by name, description, tags, and category
- **Favorites System**: Mark and filter favorite presets
- **Tag-based Classification**: Multiple tags per preset
- **Dynamic Filtering**: Filter by type, category, favorites
- **Preset Statistics**: Track usage and preset counts
- **Extended Preset Info**: Author, version, detailed descriptions

#### User Interface
- **Custom Preset Manager UI**: Visual preset browser
- **Real-time Search**: Live search results
- **Category Navigation**: Browse by category
- **Preset Details Panel**: Show full preset information
- **Keyboard Shortcuts**: Navigate with keyboard
- **Visual Feedback**: Clear selection and state indicators

#### Preview System
- **Preview Mode**: See effects before applying
- **Non-destructive Testing**: Test without undo
- **Real-time Updates**: Instant preview rendering
- **Performance Optimization**: Fast preview rendering
- **Preview Controls**: Start/stop/update preview
- **Intensity Preview**: Adjust intensity in preview mode

#### Python Tools
- **CLI Tool (preset_manager.py)**: Command-line preset management
  - List, search, create, delete presets
  - Import/export preset collections
  - Category management
  - Batch operations
- **GUI Tool (preset_gui.py)**: Graphical preset manager
  - Visual preset editor
  - Drag-and-drop organization
  - Import/export UI
  - Category management
- **API Documentation**: Complete Python API reference

### Enhanced
- **Preset Structure**: Extended with tags, author, version
- **Search Algorithm**: Fuzzy matching and multi-field search
- **Performance**: Optimized preset loading and caching
- **Memory Management**: Better resource handling
- **Error Handling**: Improved error messages and validation

### Technical Improvements
- **PresetManagerV2 Class**: Complete rewrite with advanced features
- **PresetUI Class**: Custom UI implementation
- **Search Filter System**: Flexible filtering architecture
- **JSON Schema**: Extended schema for new fields
- **Index Caching**: Fast preset lookup by ID/name
- **Category Management**: Dynamic category creation/deletion

### Documentation
- **ADVANCED_FEATURES.md**: Complete guide to v2.0 features
- **README_V2.md**: Updated README for version 2.0
- **python_tools/README.md**: Python tools documentation
- **API Reference**: Full API documentation
- **Updated Examples**: New examples using v2.0 features

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
