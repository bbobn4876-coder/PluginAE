# Creating Custom Presets for PluginAE

## Overview

PluginAE supports custom presets in JSON format. You can create your own transitions, effects, and color grades by adding JSON files to the `presets/` directory.

## Preset Structure

Each preset is defined in a JSON file with the following structure:

```json
{
  "name": "My Custom Preset",
  "type": "effect",
  "id": 500,
  "default_intensity": 0.5,
  "description": "Description of what this preset does",
  "parameters": {
    // Custom parameters here
  }
}
```

## Required Fields

- **name** (string): Display name in After Effects UI
- **type** (string): One of: `transition`, `effect`, `color`, `custom`
- **id** (integer): Unique identifier (use 100+ for custom presets)

## Optional Fields

- **default_intensity** (number 0.0-1.0): Default strength of the effect
- **description** (string): Helpful description
- **parameters** (object): Custom parameters specific to the preset

## Preset Types

### 1. Transitions

Transition presets animate between states. Common parameters:

```json
{
  "type": "transition",
  "parameters": {
    "ease_type": "cubic",
    "direction": "in",
    "blur_radius": 10
  }
}
```

### 2. Effects

Effect presets modify the image. Common parameters:

```json
{
  "type": "effect",
  "parameters": {
    "blur_radius": 5,
    "grain_size": 1.0,
    "inner_radius": 0.4,
    "outer_radius": 1.0
  }
}
```

### 3. Color Grades

Color presets adjust color and tone. Common parameters:

```json
{
  "type": "color",
  "parameters": {
    "color_tint": {
      "r": 1.1,
      "g": 1.0,
      "b": 0.9
    },
    "contrast": 0.15,
    "saturation": 1.2,
    "shadows": { "r": 0.9, "g": 0.9, "b": 1.1 },
    "midtones": { "r": 1.0, "g": 1.0, "b": 1.0 },
    "highlights": { "r": 1.1, "g": 1.0, "b": 0.95 }
  }
}
```

## Common Parameters

### Color Values

RGB values typically range from 0.0 to 2.0:
- `1.0` = no change
- `< 1.0` = decrease that channel
- `> 1.0` = increase that channel

### Intensity/Strength

Most parameters use 0.0 to 1.0 range:
- `0.0` = no effect
- `0.5` = medium effect
- `1.0` = full effect

### Blur Radius

Blur radius typically ranges from 0 to 100 pixels.

## Directory Structure

Organize presets by type:

```
presets/
├── transitions/
│   ├── fade.json
│   ├── zoom_blur.json
│   └── your_transition.json
├── effects/
│   ├── vignette.json
│   ├── film_grain.json
│   └── your_effect.json
└── color/
    ├── cinematic_blue.json
    ├── warm_sunset.json
    └── your_color_grade.json
```

## Example: Creating a Custom Sepia Tone

Create `presets/color/sepia.json`:

```json
{
  "name": "Sepia Tone",
  "type": "color",
  "id": 400,
  "default_intensity": 0.8,
  "description": "Classic sepia photograph effect",
  "parameters": {
    "color_tint": {
      "r": 1.2,
      "g": 1.0,
      "b": 0.8
    },
    "contrast": 0.1,
    "saturation": 0.3
  }
}
```

## Tips

1. **Unique IDs**: Use IDs 100+ to avoid conflicts with built-in presets
2. **Test Values**: Start with subtle values and increase gradually
3. **Naming**: Use descriptive names that indicate the effect
4. **Organization**: Keep similar presets in the same directory
5. **Documentation**: Add clear descriptions for team collaboration

## Validation

Validate your JSON files against the schema:

```bash
# Use a JSON validator with the schema
jsonschema -i your_preset.json presets/preset_schema.json
```

## Loading Custom Presets

1. Create your JSON file following the schema
2. Place it in the appropriate `presets/` subdirectory
3. Restart After Effects
4. Your preset will appear in the plugin's dropdown menu

## Troubleshooting

- **Preset not appearing**: Check JSON syntax and ensure unique ID
- **Effect too strong**: Reduce `default_intensity` value
- **Colors look wrong**: Verify RGB values are in correct range (0.0-2.0)
- **Plugin crashes**: Validate JSON syntax and parameter types
