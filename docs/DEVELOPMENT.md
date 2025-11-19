# Development Guide for PluginAE

## Project Architecture

### Core Components

1. **PluginAE.cpp** - Main plugin entry point
   - Handles AE plugin lifecycle
   - Parameter setup and management
   - Rendering pipeline

2. **PresetManager** - Preset system
   - Loads and manages presets
   - Applies effects to image data
   - Extensible architecture for new effects

3. **Build System** - CMake configuration
   - Cross-platform compilation
   - SDK integration
   - Installation targets

## Code Structure

### Plugin Lifecycle

```cpp
PF_Cmd_GLOBAL_SETUP     → Initialize plugin, create preset manager
PF_Cmd_PARAMS_SETUP     → Setup UI parameters
PF_Cmd_RENDER           → Process frame
PF_Cmd_SMART_RENDER     → Smart render (optimized)
PF_Cmd_GLOBAL_SETDOWN   → Cleanup
```

### Adding New Preset Types

1. **Define preset in PresetManager.cpp**:

```cpp
memset(&preset, 0, sizeof(PresetInfo));
strcpy(preset.name, "My New Effect");
preset.type = PRESET_EFFECT;
preset.id = 1000; // Unique ID
preset.default_intensity = 0.5;
presets_.push_back(preset);
```

2. **Implement processing logic**:

```cpp
case 1000: // My New Effect
{
    // Process pixels
    for (int y = 0; y < input->height; ++y) {
        PF_Pixel8* in_pix = /* ... */;
        PF_Pixel8* out_pix = /* ... */;

        for (int x = 0; x < input->width; ++x) {
            // Apply effect
            out_pix->red = /* ... */;
            // ...
        }
    }
    break;
}
```

3. **Create JSON preset**:

```json
{
  "name": "My New Effect",
  "type": "effect",
  "id": 1000,
  "default_intensity": 0.5,
  "parameters": {
    "custom_param": 1.0
  }
}
```

## Performance Optimization

### Image Processing Tips

1. **Use row-based iteration** for better cache performance
2. **Minimize memory allocations** in render loop
3. **Consider SIMD** for heavy computations
4. **Use lookup tables** for complex math operations

### Example Optimized Loop

```cpp
for (int y = 0; y < height; ++y) {
    PF_Pixel8* src = (PF_Pixel8*)((char*)input->data + y * input->rowbytes);
    PF_Pixel8* dst = (PF_Pixel8*)((char*)output->data + y * output->rowbytes);

    for (int x = 0; x < width; ++x) {
        // Process pixel
        *dst++ = ProcessPixel(*src++);
    }
}
```

## Debugging

### Visual Studio (Windows)

1. Build in Debug configuration
2. Set After Effects as debugging executable
3. Set breakpoints in code
4. Launch debugging (F5)

### Xcode (macOS)

1. Build Debug scheme
2. Edit scheme → Run → Executable → Select After Effects
3. Set breakpoints
4. Run (Cmd+R)

### Logging

Add debug output:

```cpp
#ifdef DEBUG
    #define DEBUG_LOG(msg) OutputDebugString(msg)
#else
    #define DEBUG_LOG(msg)
#endif
```

## Testing

### Manual Testing Checklist

- [ ] Plugin loads without errors
- [ ] All presets appear in dropdown
- [ ] Intensity slider works (0-100%)
- [ ] Effects apply correctly
- [ ] No memory leaks
- [ ] Performance is acceptable
- [ ] Works with different bit depths
- [ ] Smart rendering works

### Test Cases

1. **Basic functionality**
   - Apply each preset
   - Vary intensity
   - Test blend modes

2. **Edge cases**
   - Very small images (1x1)
   - Very large images (4K+)
   - Extreme intensity values
   - Rapid preset switching

3. **Compatibility**
   - Different AE versions
   - Different color spaces
   - Different project settings

## Code Style

### C++ Guidelines

```cpp
// Use clear naming
void ApplyEffect() { }  // Good
void ae() { }           // Bad

// Initialize variables
int value = 0;          // Good
int value;              // Bad

// Use const where possible
const float PI = 3.14159f;

// Check for errors
if (!err) {
    // Process
}

// Use RAII for resources
class ResourceHolder {
    ResourceHolder() { allocate(); }
    ~ResourceHolder() { release(); }
};
```

### Formatting

- Indent: 4 spaces
- Braces: Opening on same line
- Max line length: 100 characters
- Use // for single-line comments
- Use /* */ for multi-line

## Memory Management

### Important Rules

1. **No memory leaks** - check all allocations
2. **No buffer overruns** - validate array access
3. **Handle NULL pointers** - always check
4. **Clean up resources** in GLOBAL_SETDOWN

### Example

```cpp
// Good practice
GlobalData* data = new GlobalData();
if (data) {
    // Use data
    delete data;
    data = nullptr;
}

// Check parameters
if (!in_data || !out_data || !params) {
    return PF_Err_BAD_CALLBACK_PARAM;
}
```

## Extending the Plugin

### Adding GPU Support

Consider using Adobe's GPU suite for hardware acceleration:

```cpp
// Check for GPU support
if (in_data->appl_id == 'PrMr') {
    // Use Premiere's GPU features
}
```

### Adding UI Elements

Add custom parameters in ParamsSetup:

```cpp
// Color picker
PF_ADD_COLOR(
    "Effect Color",
    128, 128, 128,  // RGB default
    PLUGIN_COLOR_PARAM);

// Checkbox
PF_ADD_CHECKBOXX(
    "Enable Effect",
    FALSE,
    0,
    PLUGIN_ENABLE_PARAM);
```

### Multi-threading

For complex effects, consider parallel processing:

```cpp
// Divide work into chunks
int num_threads = std::thread::hardware_concurrency();
int rows_per_thread = height / num_threads;

// Process in parallel
// (Use AE's iteration suite for proper integration)
```

## Build Variants

### Debug Build

```bash
cmake -DCMAKE_BUILD_TYPE=Debug ..
```
- Full symbols
- No optimization
- Assertions enabled

### Release Build

```bash
cmake -DCMAKE_BUILD_TYPE=Release ..
```
- Optimized
- No debug info
- Smaller binary

### RelWithDebInfo

```bash
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo ..
```
- Optimized
- Debug symbols included
- Best for profiling

## Resources

- [AE SDK Guide](https://www.adobe.io/apis/creativecloud/aftereffects.html)
- [PiPL Resources](https://www.adobe.io/apis/creativecloud/aftereffects/docs.html)
- [Effect Performance](https://helpx.adobe.com/after-effects/using/effect-performance.html)

## Common Issues

### Issue: Plugin won't load

**Solution**: Check PiPL resource compilation, verify SDK version

### Issue: Crashes on render

**Solution**: Check buffer access, validate dimensions, use debug build

### Issue: Slow performance

**Solution**: Profile code, optimize inner loops, consider GPU

## Contributing

When contributing code:

1. Follow existing code style
2. Add comments for complex logic
3. Test thoroughly
4. Update documentation
5. Create preset examples
