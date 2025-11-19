# Installation Guide - AEP Preview Plugin

This guide provides detailed step-by-step instructions for installing the AEP Preview plugin in Adobe After Effects.

## Prerequisites

- Adobe After Effects CC 2018 or later
- Administrator/sudo access (for some installation methods)
- Basic computer skills

## Installation Methods

### Method 1: Manual Installation (Recommended for Development)

#### Windows Installation

1. **Locate the Extensions Folder**

   Open File Explorer and navigate to:
   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
   ```

   If the `extensions` folder doesn't exist, create it manually.

2. **Copy Plugin Files**

   - Copy the entire `PluginAE` folder to the extensions directory
   - The final path should be:
     ```
     C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PluginAE\
     ```

3. **Enable Debug Mode**

   Open Registry Editor (regedit.exe) and create/modify these keys:

   - Navigate to: `HKEY_CURRENT_USER\Software\Adobe`
   - Create keys if they don't exist:
     - `CSXS.9`
     - `CSXS.10`
     - `CSXS.11`
   - In each key, create a String Value named `PlayerDebugMode` with value `1`

   **Or use this .reg file** (save as `enable-cep-debug.reg` and run):
   ```reg
   Windows Registry Editor Version 5.00

   [HKEY_CURRENT_USER\Software\Adobe\CSXS.9]
   "PlayerDebugMode"="1"

   [HKEY_CURRENT_USER\Software\Adobe\CSXS.10]
   "PlayerDebugMode"="1"

   [HKEY_CURRENT_USER\Software\Adobe\CSXS.11]
   "PlayerDebugMode"="1"
   ```

4. **Restart After Effects**

   Completely close and reopen After Effects.

5. **Open the Extension**

   In After Effects:
   - Go to `Window` → `Extensions` → `AEP Preview`

#### macOS Installation

1. **Locate the Extensions Folder**

   Open Finder and use `Cmd + Shift + G` to go to:
   ```
   /Library/Application Support/Adobe/CEP/extensions/
   ```

   If the folder doesn't exist, create it:
   ```bash
   sudo mkdir -p "/Library/Application Support/Adobe/CEP/extensions/"
   ```

2. **Copy Plugin Files**

   Copy the `PluginAE` folder to the extensions directory:
   ```bash
   sudo cp -R /path/to/PluginAE "/Library/Application Support/Adobe/CEP/extensions/"
   ```

3. **Enable Debug Mode**

   Open Terminal and run:
   ```bash
   defaults write com.adobe.CSXS.9 PlayerDebugMode 1
   defaults write com.adobe.CSXS.10 PlayerDebugMode 1
   defaults write com.adobe.CSXS.11 PlayerDebugMode 1
   ```

4. **Set Permissions** (if needed)

   ```bash
   sudo chmod -R 755 "/Library/Application Support/Adobe/CEP/extensions/PluginAE"
   ```

5. **Restart After Effects**

   Completely close and reopen After Effects.

6. **Open the Extension**

   In After Effects:
   - Go to `Window` → `Extensions` → `AEP Preview`

### Method 2: User-Level Installation

If you don't have administrator access, you can install to your user directory:

#### Windows User Installation
```
%APPDATA%\Adobe\CEP\extensions\
```

#### macOS User Installation
```
~/Library/Application Support/Adobe/CEP/extensions/
```

Follow the same steps as Method 1, but use these directories instead.

### Method 3: ZXP Package Installation

1. **Package the Extension** (requires ZXP signing tools)

   Use Adobe's signing tools or third-party tools to create a .zxp file.

2. **Install with ZXP Installer**

   - Download [ZXP Installer](https://aescripts.com/learn/zxp-installer/)
   - Drag the .zxp file onto ZXP Installer
   - Follow the prompts

3. **Restart After Effects**

## Verification

### Check if Extension is Installed

1. Open After Effects
2. Go to `Window` → `Extensions`
3. You should see "AEP Preview" in the list

### Check if Extension Loads

1. Click on "AEP Preview" from the Extensions menu
2. A panel should open showing the plugin interface
3. You should see the title "AEP Preview" and an upload button

## Troubleshooting

### Extension doesn't appear in the menu

**Problem**: "AEP Preview" is not listed under Window → Extensions

**Solutions**:

1. **Verify installation path**
   - Ensure the folder is in the correct location
   - The folder name should be exactly `PluginAE` or `com.aep.preview.panel`
   - Check that `manifest.xml` exists in `PluginAE/CSXS/`

2. **Check manifest.xml**
   - Open `CSXS/manifest.xml` in a text editor
   - Verify it's valid XML (no syntax errors)
   - Ensure the ExtensionBundleId matches

3. **Restart After Effects**
   - Completely quit After Effects (not just close the project)
   - Reopen After Effects

4. **Check CEP version compatibility**
   - Verify your After Effects version supports CEP 9+
   - Update the manifest.xml if needed for your AE version

### Extension appears but won't open

**Problem**: Clicking the extension menu item does nothing

**Solutions**:

1. **Enable Debug Mode**
   - Follow the debug mode steps above
   - Restart After Effects

2. **Check file permissions**
   - On macOS, run:
     ```bash
     sudo chmod -R 755 "/Library/Application Support/Adobe/CEP/extensions/PluginAE"
     ```
   - On Windows, ensure the folder is not read-only

3. **Check for port conflicts**
   - The debug port (8088) might be in use
   - Change the port in `.debug` file

### Extension opens but shows errors

**Problem**: Panel opens but displays JavaScript errors

**Solutions**:

1. **Open Chrome DevTools**
   - Right-click in the panel → "Inspect"
   - Or navigate to `http://localhost:8088` in Chrome
   - Check the Console tab for errors

2. **Verify all files are present**
   - Check that all folders and files are copied correctly
   - Verify `lib/CSInterface.js` exists

3. **Clear cache**
   - In DevTools: Console → Clear console
   - Reload the extension

### "File not found" errors when opening projects

**Problem**: Cannot open .aep files from the plugin

**Solutions**:

1. **Check file paths**
   - Verify the .aep file actually exists at the specified path
   - Try moving the .aep file to a simpler path (no special characters)

2. **Check permissions**
   - Ensure After Effects has permission to read the file
   - On macOS, check System Preferences → Security & Privacy

3. **Test with ExtendScript**
   - Try opening the file directly in After Effects first
   - Verify the file is not corrupted

## Uninstallation

### To Remove the Extension

1. **Close After Effects**

2. **Delete the extension folder**

   - **Windows**: Delete `C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\PluginAE\`
   - **macOS**: Delete `/Library/Application Support/Adobe/CEP/extensions/PluginAE/`

3. **Optional: Disable Debug Mode**

   - **Windows**: Delete the registry keys created earlier
   - **macOS**: Run in Terminal:
     ```bash
     defaults delete com.adobe.CSXS.9 PlayerDebugMode
     defaults delete com.adobe.CSXS.10 PlayerDebugMode
     defaults delete com.adobe.CSXS.11 PlayerDebugMode
     ```

4. **Restart After Effects**

## After Effects Version Compatibility

| After Effects Version | CEP Version | Supported |
|----------------------|-------------|-----------|
| CC 2018 (15.x)       | CEP 8-9     | ✅ Yes    |
| CC 2019 (16.x)       | CEP 9       | ✅ Yes    |
| CC 2020 (17.x)       | CEP 9-10    | ✅ Yes    |
| 2021 (18.x)          | CEP 10      | ✅ Yes    |
| 2022 (22.x)          | CEP 11      | ✅ Yes    |
| 2023 (23.x)          | CEP 11      | ✅ Yes    |
| 2024 (24.x)          | CEP 11      | ✅ Yes    |

## Getting Help

If you continue to experience issues:

1. Check the main README.md for additional troubleshooting
2. Enable debug mode and check browser console for errors
3. Verify all installation steps were followed correctly
4. Make sure After Effects is up to date
5. Try installing in user directory instead of system directory

## Additional Resources

- [Adobe CEP Resources](https://github.com/Adobe-CEP/CEP-Resources)
- [CEP Cookbook](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_9.x/Documentation/CEP%209.0%20HTML%20Extension%20Cookbook.md)
- [ExtendScript Documentation](https://extendscript.docsforadobe.dev/)
