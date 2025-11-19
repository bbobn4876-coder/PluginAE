# Projects Folder

This folder is used to store ALL your files that will be automatically loaded by the AEP Preview plugin.

## Supported File Types

**ALL file types are supported!** Place any files you want to manage:

- **`.pack` / `.aep`** - After Effects project files (with visual preview of compositions)
- **`.jsx`** - ExtendScript files (presets, scripts)
- **`.gif` / `.png` / `.jpg`** - Images (with visual preview)
- **`.mp4` / `.mov`** - Video files
- **`.aif` / `.wav` / `.mp3`** - Audio files
- **Any other files** - Will be loaded and available in the plugin

## How to Use

1. Place any files directly in this folder
2. Click "Load Files from Projects Folder" button in the plugin
3. All files will be automatically detected and loaded
4. No file type restrictions!

## File Organization

```
Projects/
├── project1.pack       ← Project files with preview
├── project2.aep
├── preset1.jsx         ← Scripts
├── background1.gif     ← Images with preview
├── audio.wav
├── video.mp4
└── ... any other files
```

## Special Features

### For .pack and .aep files:
- **Visual Preview** - See all compositions inside the project
- **Composition Details** - View width, height, fps, duration, layers
- **Statistics** - Number of comps, footage items, total items
- **Quick Open** - Click to open the project in After Effects

### For .gif, .png, .jpg files:
- **Visual Preview** - See the image in the preview panel

### For .jsx files:
- **Execute** - Run the script directly in After Effects

## Notes

- Hidden files (starting with .) are automatically skipped
- README.md file is skipped
- All other files are loaded without restrictions
- Large project files may take a moment to load preview data
