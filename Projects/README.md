# Projects Folder

This folder is the heart of the AEP Preview plugin. Organize your files into subfolders for automatic categorization!

## How It Works

**The plugin automatically scans ALL subfolders** and creates groups based on folder names!

### Automatic Grouping

Place files in subfolders - the plugin will automatically:
1. Scan all subfolders recursively
2. Create groups with folder names
3. Assign files to their respective groups
4. Color-code groups based on folder names

## Supported File Types

**ALL file types are supported!** No restrictions.

- **`.pack` / `.aep`** - After Effects projects (with composition preview)
- **`.jsx`** - ExtendScript files (executable in AE)
- **`.gif` / `.png` / `.jpg`** - Images (with visual preview)
- **`.mp4` / `.mov`** - Video files
- **`.wav` / `.mp3`** - Audio files
- **Any other files** - Will be loaded and managed

## Recommended Folder Structure

Organize files into themed folders:

```
Projects/
├── Backgrounds 2D/
│   ├── bg_abstract.gif
│   ├── bg_gradient.pack
│   └── bg_particles.aep
├── Icons Game/
│   ├── icon_health.jsx
│   ├── icon_power.gif
│   └── icon_menu.pack
├── Presets 2D/
│   ├── glow_preset.jsx
│   ├── blur_preset.pack
│   └── color_grade.aep
├── Transitions Simple/
│   ├── fade.pack
│   ├── slide.jsx
│   └── zoom.aep
├── Titles/
│   ├── title_intro.pack
│   ├── title_credits.aep
│   └── title_lower_third.jsx
└── Shape 1 Lines/
    ├── line_anim.jsx
    └── stroke_preset.pack
```

## Auto-Color Assignment

Folders are automatically colored based on keywords:

- **Backgrounds** → Blue
- **Icons** → Purple
- **Presets** → Green
- **Transitions** → Orange
- **Titles** → Red
- **Shapes** → Yellow
- **Gradients** → Purple
- **Templates** → Blue

Other folders get colors automatically assigned.

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

## How to Use

1. Create folders in this directory (e.g., "Backgrounds 2D", "Icons Game")
2. Place your files in the appropriate folders
3. Open the plugin in After Effects
4. Click "Load Files from Projects Folder"
5. All files will be loaded and grouped automatically!

## Notes

- Hidden files (starting with .) are automatically skipped
- README.md file is skipped
- Subfolders can be nested (e.g., `Icons/Game/Health/icon.pack`)
- The first-level folder name becomes the group name
- All other files are loaded without restrictions
- Large project files may take a moment to load preview data
