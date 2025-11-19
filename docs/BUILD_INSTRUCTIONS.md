# Build Instructions for PluginAE

## Prerequisites

### Required Software

1. **CMake** (version 3.15 or higher)
   - Download from: https://cmake.org/download/

2. **Adobe After Effects SDK**
   - Download from: https://www.adobe.io/apis/creativecloud/aftereffects.html
   - Extract to a known location

3. **C++ Compiler**
   - **Windows**: Visual Studio 2019 or later
   - **macOS**: Xcode 12 or later with Command Line Tools

### Optional Tools

- **Git** for version control
- **Visual Studio Code** or preferred IDE

## Setup

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd PluginAE
```

### 2. Download After Effects SDK

1. Visit Adobe's developer site
2. Download the After Effects SDK
3. Extract to a location like:
   - Windows: `C:\AE_SDK\`
   - macOS: `~/Development/AE_SDK/`

### 3. Configure CMake

#### Windows (Visual Studio)

```cmd
mkdir build
cd build
cmake -G "Visual Studio 16 2019" -A x64 -DAE_SDK_PATH="C:\AE_SDK" ..
```

#### macOS (Xcode)

```bash
mkdir build
cd build
cmake -G Xcode -DAE_SDK_PATH="~/Development/AE_SDK" ..
```

#### Linux (Make)

```bash
mkdir build
cd build
cmake -DAE_SDK_PATH="/path/to/AE_SDK" ..
```

## Building

### Windows

```cmd
# Open in Visual Studio
start PluginAE.sln

# Or build from command line
cmake --build . --config Release
```

### macOS

```bash
# Open in Xcode
open PluginAE.xcodeproj

# Or build from command line
cmake --build . --config Release
```

### Linux

```bash
make
```

## Output

The compiled plugin will be located in:
- Windows: `build/Release/PluginAE.aex`
- macOS: `build/Release/PluginAE.plugin`

## Installation

### Windows

1. Locate your After Effects plugins folder:
   ```
   C:\Program Files\Adobe\Adobe After Effects [VERSION]\Support Files\Plug-ins\
   ```

2. Copy `PluginAE.aex` to the plugins folder

3. Copy the `presets/` folder to:
   ```
   C:\Program Files\Adobe\Adobe After Effects [VERSION]\Support Files\Plug-ins\PluginAE\presets\
   ```

### macOS

1. Locate your After Effects plugins folder:
   ```
   /Applications/Adobe After Effects [VERSION]/Plug-ins/
   ```

2. Copy `PluginAE.plugin` to the plugins folder

3. Copy the `presets/` folder to:
   ```
   /Applications/Adobe After Effects [VERSION]/Plug-ins/PluginAE/presets/
   ```

## Verification

1. Launch After Effects
2. Create a new composition
3. Add the PluginAE effect from: **Effect > Custom > PluginAE Presets**
4. Verify that presets appear in the dropdown menu

## Troubleshooting

### Build Errors

**"Cannot find AE SDK"**
- Verify `AE_SDK_PATH` points to correct location
- Check that SDK contains `Headers/` directory

**Linker errors**
- Ensure you're building for correct architecture (x64)
- Check that SDK version matches your compiler

### Runtime Errors

**Plugin doesn't appear in After Effects**
- Verify plugin is in correct plugins folder
- Check file extension (.aex for Windows, .plugin for macOS)
- Restart After Effects

**Plugin crashes on load**
- Rebuild in Debug mode for error messages
- Check compatibility with AE version
- Verify all dependencies are included

## Development

### Debug Build

```bash
cd build
cmake -DCMAKE_BUILD_TYPE=Debug -DAE_SDK_PATH="/path/to/SDK" ..
cmake --build .
```

### Debugging in Visual Studio

1. Set PluginAE as startup project
2. Set debugging command to After Effects executable
3. Set breakpoints and run

### Debugging in Xcode

1. Select PluginAE scheme
2. Edit scheme > Run > Executable > Choose After Effects
3. Set breakpoints and run

## Advanced Configuration

### Custom Install Path

```bash
cmake -DCMAKE_INSTALL_PREFIX="/custom/path" ..
cmake --build . --target install
```

### Multi-configuration Build

```bash
cmake --build . --config Debug
cmake --build . --config Release
```

## Clean Build

```bash
cd build
cmake --build . --target clean
# or
rm -rf build/
mkdir build
```

## Additional Resources

- [Adobe After Effects SDK Documentation](https://www.adobe.io/apis/creativecloud/aftereffects/docs.html)
- [CMake Documentation](https://cmake.org/documentation/)
- [Plugin Development Guide](./DEVELOPMENT.md)
