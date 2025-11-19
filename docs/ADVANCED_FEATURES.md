# Advanced Features - PluginAE v2.0

## Overview

Version 2.0 introduces advanced preset management features:
- **Category System** - Organize presets into categories
- **Search & Filter** - Find presets quickly
- **Preview Mode** - See effects before applying
- **Favorites** - Mark frequently used presets
- **Python Tools** - Manage presets externally

---

## 1. Preset Manager V2

### Features

#### Categories

Organize presets into logical groups:

**Built-in Categories:**
- Transitions
- Effects
- Color Grading
- Custom

**Create Custom Categories:**
```cpp
PresetManagerV2 manager;
manager.CreateCategory("My Category", "Custom effects collection");
```

#### Search & Filtering

**Search by:**
- Name
- Description
- Tags
- Category
- Type

**Example:**
```cpp
SearchFilter filter;
strcpy(filter.search_text, "cinematic");
filter.use_category_filter = true;
strcpy(filter.category_filter, "Color Grading");

std::vector<A_long> results;
manager.SearchPresets(filter, results);
```

#### Favorites

Mark frequently used presets:

```cpp
// Toggle favorite
manager.ToggleFavorite(preset_id);

// Get all favorites
std::vector<A_long> favorites;
manager.GetFavorites(favorites);

// Filter favorites only
filter.favorites_only = true;
manager.SearchPresets(filter, results);
```

---

## 2. User Interface

### Opening the Preset Manager

In After Effects:
1. Apply PluginAE to a layer
2. In Effect Controls panel, click **"Open Preset Manager"**
3. Preset Manager UI opens

### UI Components

#### Category List

- Browse presets by category
- Shows preset count per category
- Click to filter presets

#### Preset List

- Displays presets in current category
- Shows:
  - Preset name
  - Type (transition/effect/color)
  - Favorite indicator
- Click to select and preview

#### Search Bar

- Real-time search as you type
- Searches name, description, tags
- Highlights matching results

#### Preset Details

When a preset is selected:
- **Name** - Preset name
- **Description** - What it does
- **Tags** - Searchable tags
- **Author** - Creator
- **Version** - Version number
- **Type** - Category type
- **Default Intensity** - Recommended strength

#### Controls

- **Preview** - Toggle preview mode
- **Apply** - Apply preset to layer
- **Add to Favorites** - Bookmark preset
- **Close** - Close UI

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` | Navigate presets |
| `Enter` | Apply selected preset |
| `Space` | Toggle preview |
| `F` | Toggle favorite |
| `Esc` | Close manager |
| `Ctrl+F` | Focus search |

---

## 3. Preview Mode

### What is Preview Mode?

Preview mode lets you see the effect **before applying** it to your composition. This allows you to:
- Test multiple presets quickly
- Adjust intensity in real-time
- Compare different looks
- Avoid undos

### Enabling Preview

**Method 1: Via UI**
1. Open Preset Manager
2. Select a preset
3. Click "Preview" button
4. Preview appears in composition window

**Method 2: Via Parameters**
1. In Effect Controls
2. Enable "Preview Mode" checkbox
3. Select preset from dropdown
4. Preview renders automatically

### Preview vs. Apply

| Feature | Preview Mode | Apply Mode |
|---------|-------------|------------|
| Renders | Yes (temporary) | Yes (permanent) |
| Keyframeable | No | Yes |
| Performance | Faster | Normal |
| Undo needed | No | Yes |

### Preview Tips

**Best Practices:**
- Use preview for testing multiple presets
- Preview is non-destructive
- Preview updates in real-time
- Click "Apply" to make permanent

**Performance:**
- Preview uses lower quality for speed
- Final render uses full quality
- Disable preview when done

---

## 4. Working with Categories

### Default Categories

**Transitions:**
- Fade In/Out
- Zoom Blur
- Slide

**Effects:**
- Blur Effect
- Sharpen
- Film Grain
- Vignette

**Color Grading:**
- Cinematic Blue
- Warm Sunset
- Teal & Orange
- Black & White
- Vintage Film

**Custom:**
- User-created presets

### Creating Categories

**Via Python Tools:**
```bash
# Create category directory
mkdir presets/my_category

# Add presets to the directory
python python_tools/preset_manager.py create "My Preset" effect "My Category"
```

**Via JSON:**
```json
{
  "name": "Custom Transition",
  "type": "transition",
  "id": 1000,
  "category": "My Category",
  "default_intensity": 0.5
}
```

### Category Management

**Get all categories:**
```cpp
std::vector<CategoryInfo> categories;
manager.GetCategories(categories);

for (const auto& cat : categories) {
    printf("%s (%d presets)\n", cat.name, cat.preset_count);
}
```

**Filter by category:**
```cpp
std::vector<A_long> presets;
manager.FilterByCategory("Color Grading", presets);
```

---

## 5. Search & Filter

### Search Syntax

**Simple search:**
```
cinematic
```
Finds presets with "cinematic" in name, description, or tags.

**Category filter:**
```
warm --category "Color Grading"
```
Finds "warm" presets in Color Grading category.

**Type filter:**
```
blur --type effect
```
Finds blur effects only.

**Favorites only:**
```
--favorites
```
Shows only favorited presets.

### Advanced Filtering

**Combine multiple filters:**
```cpp
SearchFilter filter;
strcpy(filter.search_text, "blue");
filter.use_category_filter = true;
strcpy(filter.category_filter, "Color Grading");
filter.use_type_filter = true;
filter.type_filter = PRESET_COLOR;
filter.favorites_only = false;

manager.SearchPresets(filter, results);
```

### Filter by Tags

Presets can have multiple tags:
```json
{
  "name": "Sunset Glow",
  "tags": ["warm", "sunset", "glow", "orange"]
}
```

Search matches any tag:
```
warm      → Matches
glow      → Matches
blue      → No match
```

---

## 6. Python Tools Integration

### Command-Line Management

**List presets:**
```bash
python python_tools/preset_manager.py list
python python_tools/preset_manager.py list --category "Effects"
```

**Search:**
```bash
python python_tools/preset_manager.py search "cinematic"
python python_tools/preset_manager.py search "blue" --type color
```

**Create preset:**
```bash
python python_tools/preset_manager.py create \
    "My Preset" color "Custom" \
    --intensity 0.7 \
    --description "My custom look" \
    --tags warm sunset glow
```

**Export/Import:**
```bash
# Backup all presets
python python_tools/preset_manager.py export backup.json

# Restore from backup
python python_tools/preset_manager.py import backup.json
```

### Graphical UI

**Launch GUI:**
```bash
python python_tools/preset_gui.py
```

**GUI Features:**
- Visual preset browser
- Drag-and-drop organization
- Visual preset editor
- Import/Export collections
- Batch operations

### Workflow Example

1. **Create presets externally:**
   ```bash
   python preset_gui.py
   ```

2. **Edit in visual editor**

3. **Export to AE:**
   - Save presets to `presets/` folder
   - Restart After Effects
   - Presets appear in plugin

4. **Share with team:**
   ```bash
   # Export collection
   python preset_manager.py export team_presets.json

   # Team imports
   python preset_manager.py import team_presets.json
   ```

---

## 7. Advanced Usage

### Custom Preset Parameters

Add custom parameters to presets:

```json
{
  "name": "Complex Effect",
  "type": "effect",
  "id": 5000,
  "parameters": {
    "blur_radius": 10.0,
    "grain_size": 1.5,
    "vignette_strength": 0.6,
    "color_tint": {
      "r": 1.1,
      "g": 1.0,
      "b": 0.95
    },
    "custom_curves": [0.0, 0.2, 0.8, 1.0]
  }
}
```

Access in code:
```cpp
PresetInfoEx* preset = manager.GetPresetByID(5000);
// Access preset->data for custom parameters
```

### Batch Operations

**Apply preset to multiple layers:**
```cpp
for (int i = 0; i < layer_count; i++) {
    manager.ApplyPreset(
        in_data, out_data,
        input_layers[i],
        output_layers[i],
        preset,
        intensity
    );
}
```

### Dynamic Preset Loading

Load presets at runtime:
```cpp
// Load from custom directory
manager.LoadPresets("/path/to/custom/presets");

// Reload after changes
manager.ReloadPresets();
```

---

## 8. Performance Optimization

### Preview Optimization

**Fast Preview Settings:**
- Lower resolution rendering
- Skip anti-aliasing
- Simplified calculations

**Implementation:**
```cpp
if (preview_mode) {
    // Use fast path
    ApplyPresetFast(preset, intensity);
} else {
    // Use full quality
    ApplyPresetFull(preset, intensity);
}
```

### Caching

**Preset Cache:**
- Presets loaded once at startup
- Cached in memory
- Reload only when changed

**Preview Cache:**
- Cache preview results
- Reuse if parameters unchanged
- Clear on preset change

### Memory Management

**Best Practices:**
- Load presets on demand
- Unload unused categories
- Free preview buffers when done
- Use shared resources

---

## 9. Troubleshooting

### Presets Not Appearing

**Check:**
1. JSON syntax valid?
2. Preset IDs unique?
3. Files in correct category folders?
4. After Effects restarted?

**Debug:**
```bash
# Validate JSON
python preset_manager.py list

# Check for errors
cat presets/category/preset.json | python -m json.tool
```

### Search Not Finding Presets

**Verify:**
- Search text spelling
- Category filter set correctly
- Type filter matches preset type
- Tags include search term

### Preview Not Working

**Solutions:**
- Check "Preview Mode" enabled
- Verify preset is selected
- Ensure input layer has content
- Check GPU acceleration settings

### UI Not Opening

**Fixes:**
- Reinstall plugin
- Check AE version compatibility
- Verify plugin loaded (Effects menu)
- Review AE error log

---

## 10. API Reference

### PresetManagerV2 Class

**Methods:**

```cpp
// Preset management
bool LoadPresets(const char* path);
bool ReloadPresets();
PresetInfoEx* GetPreset(A_long index);
PresetInfoEx* GetPresetByID(A_long id);
PresetInfoEx* GetPresetByName(const char* name);

// Categories
bool CreateCategory(const char* name, const char* desc);
bool DeleteCategory(const char* name);
void GetCategories(std::vector<CategoryInfo>& cats);

// Search & Filter
void SearchPresets(const SearchFilter& filter,
                   std::vector<A_long>& results);
void FilterByCategory(const char* category,
                      std::vector<A_long>& results);
void FilterByType(PresetType type,
                  std::vector<A_long>& results);

// Favorites
bool ToggleFavorite(A_long preset_id);
void GetFavorites(std::vector<A_long>& favorites);

// Preview
PF_Err GeneratePreview(PF_InData* in_data,
                       PF_OutData* out_data,
                       PF_LayerDef* input,
                       PF_LayerDef* output,
                       A_long preset_id,
                       PF_FpLong intensity);

// Apply
PF_Err ApplyPreset(PF_InData* in_data,
                   PF_OutData* out_data,
                   PF_LayerDef* input,
                   PF_LayerDef* output,
                   PresetInfoEx* preset,
                   PF_FpLong intensity);
```

### PresetUI Class

```cpp
// Initialization
PF_Err Initialize(PF_InData* in_data);
PF_Err Shutdown();
void SetPresetManager(PresetManagerV2* manager);

// UI
PF_Err DrawUI(...);
PF_Err HandleEvent(...);

// Preview
PF_Err StartPreview(A_long preset_id, PF_FpLong intensity);
PF_Err StopPreview();
bool IsPreviewActive();

// Selection
void SelectPreset(A_long preset_id);
void SelectCategory(A_long category_index);

// Filtering
void SetSearchText(const char* text);
void SetCategoryFilter(A_long category_index);
void SetTypeFilter(PresetType type, bool enabled);
void ToggleFavoritesOnly();
```

---

## 11. Examples

See `EXAMPLES.md` for practical usage examples combining these advanced features.

---

## License

MIT License - See LICENSE file
