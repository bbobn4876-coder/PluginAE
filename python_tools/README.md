# Python Tools for PluginAE

Python utilities for managing After Effects presets outside of After Effects.

## Installation

```bash
cd python_tools
pip install -r requirements.txt
```

## Tools

### 1. Preset Manager (CLI)

Command-line tool for managing presets.

**Usage:**

```bash
# List all presets
python preset_manager.py list

# List presets in a category
python preset_manager.py list --category "Color Grading"

# Search presets
python preset_manager.py search "cinematic"
python preset_manager.py search "blue" --category "Color Grading"

# Create new preset
python preset_manager.py create "My Preset" color "Custom" --intensity 0.7 \
    --description "My custom color grade" --tags cool blue cinematic

# Export all presets
python preset_manager.py export presets_backup.json

# Import presets
python preset_manager.py import presets_backup.json

# List categories
python preset_manager.py categories
```

### 2. Preset Manager (GUI)

Graphical interface for managing presets.

**Usage:**

```bash
python preset_gui.py
```

**Features:**
- Browse presets by category
- Search presets by name, description, or tags
- Create and edit presets
- Delete presets
- Import/Export preset collections
- Visual preset editor

## Preset Structure

Presets are stored as JSON files:

```json
{
  "name": "My Preset",
  "type": "color",
  "id": 100,
  "default_intensity": 0.7,
  "description": "Custom color grade",
  "category": "Custom",
  "author": "Your Name",
  "version": "1.0",
  "tags": ["custom", "cool", "blue"],
  "parameters": {
    "color_tint": {
      "r": 0.9,
      "g": 1.0,
      "b": 1.1
    },
    "contrast": 0.15,
    "saturation": 1.1
  }
}
```

## Workflow

### Creating Custom Presets

1. **Using GUI:**
   - Launch `preset_gui.py`
   - Click "New Preset"
   - Fill in preset details
   - Click "Save Preset"

2. **Using CLI:**
   ```bash
   python preset_manager.py create "Sunset Glow" color "Custom" \
       --intensity 0.65 \
       --description "Warm sunset with glow" \
       --tags warm sunset glow
   ```

3. **Manual JSON:**
   - Create `.json` file in appropriate category folder
   - Follow schema from `presets/preset_schema.json`

### Organizing Presets

**Categories** are represented as directories:
```
presets/
├── transitions/
├── effects/
├── color/
└── custom/
```

Each category can contain multiple preset JSON files.

### Backing Up Presets

```bash
# Export all presets to single file
python preset_manager.py export my_presets_backup.json

# Later, restore from backup
python preset_manager.py import my_presets_backup.json
```

### Searching Presets

The search function looks in:
- Preset name
- Description
- Tags
- Category (if filter specified)

```bash
# Find all cinematic presets
python preset_manager.py search "cinematic"

# Find blue color grades
python preset_manager.py search "blue" --type color

# Find warm presets in color grading
python preset_manager.py search "warm" --category "Color Grading"
```

## Integration with After Effects

1. Create/edit presets using Python tools
2. Presets are saved to `presets/` directory
3. Copy preset files to After Effects plugins folder
4. Restart After Effects
5. Presets appear in PluginAE dropdown

## Advanced Usage

### Batch Creating Presets

```python
from preset_manager import PresetManager, Preset

manager = PresetManager()

# Create multiple presets
presets = [
    Preset("Preset 1", "color", 200, category="Custom"),
    Preset("Preset 2", "effect", 201, category="Custom"),
    Preset("Preset 3", "color", 202, category="Custom"),
]

for preset in presets:
    manager.save_preset(preset)
```

### Preset Validation

```python
from preset_manager import PresetManager
import jsonschema

manager = PresetManager()

# Load schema
with open('../presets/preset_schema.json') as f:
    schema = json.load(f)

# Validate preset
preset_data = {...}
jsonschema.validate(preset_data, schema)
```

### Custom Parameters

You can add custom parameters to presets:

```json
{
  "name": "Complex Effect",
  "type": "effect",
  "id": 500,
  "parameters": {
    "blur_radius": 10,
    "grain_size": 1.5,
    "vignette_strength": 0.6,
    "custom_value": 123.45
  }
}
```

## Troubleshooting

### GUI doesn't start

```bash
# Install PyQt5
pip install PyQt5

# If still fails, try
pip install --upgrade PyQt5
```

### Presets not loading

- Check JSON syntax (use online JSON validator)
- Ensure preset IDs are unique
- Verify files are in correct category folders
- Check file permissions

### Import/Export errors

- Ensure valid JSON format
- Check file paths are accessible
- Verify write permissions for export directory

## Examples

See `examples/` directory for:
- Sample preset collections
- Batch creation scripts
- Custom preset templates

## API Reference

### PresetManager Class

**Methods:**
- `load_presets()` - Load all presets from directory
- `save_preset(preset, path)` - Save preset to file
- `create_preset(name, type, category, **kwargs)` - Create new preset
- `search_presets(query, category, type)` - Search presets
- `get_categories()` - Get list of categories
- `delete_preset(id)` - Delete preset by ID
- `export_all_presets(file)` - Export to single JSON
- `import_presets(file)` - Import from JSON

### Preset Class

**Attributes:**
- `name` - Preset name
- `type` - Type (transition/effect/color/custom)
- `id` - Unique identifier
- `default_intensity` - Default intensity (0.0-1.0)
- `description` - Description text
- `category` - Category name
- `author` - Author name
- `version` - Version string
- `tags` - List of tags
- `parameters` - Custom parameters dict

## License

MIT License - see LICENSE file
