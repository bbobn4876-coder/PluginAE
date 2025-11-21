# Quick Fix: "Page failed to load" Error

## Problem
You're seeing this error:
```
Page failed to load.
ERR_FILE_NOT_FOUND
```

## Root Cause
The plugin folder has an incorrect name. CEP extensions require **short, simple folder names**.

## Solution

### Windows
1. Close After Effects completely
2. Navigate to:
   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
   ```
3. **Delete** or rename the folder with the long name like:
   - `PluginAE-claude-ae-plugin-aep-preview-015QZVTK55uxUExkVxRXuPD` ❌
4. Copy the plugin folder and name it exactly:
   - `FluxMotion` ✅
5. Final path should be:
   ```
   C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\FluxMotion\
   ```
6. Make sure the folder contains:
   - `index.html`
   - `CSXS` folder with `manifest.xml`
   - `js`, `css`, `img` folders
7. Restart After Effects
8. Go to `Window` → `Extensions` → `FluxMotion`

### macOS
1. Close After Effects completely
2. Navigate to:
   ```
   /Library/Application Support/Adobe/CEP/extensions/
   ```
3. Delete or rename the incorrectly named folder
4. Copy the plugin folder and name it exactly:
   - `FluxMotion` ✅
5. Run in Terminal:
   ```bash
   sudo cp -R /path/to/PluginAE "/Library/Application Support/Adobe/CEP/extensions/FluxMotion"
   sudo chmod -R 755 "/Library/Application Support/Adobe/CEP/extensions/FluxMotion"
   ```
6. Restart After Effects
7. Go to `Window` → `Extensions` → `FluxMotion`

## Important Notes

⚠️ **Folder Name Rules:**
- ✅ Good names: `FluxMotion`, `PluginAE`
- ❌ Bad names: `PluginAE-claude-ae-plugin-aep-preview-015QZVTK55uxUExkVxRXuPD`
- ❌ Bad names: Any name with random characters or hyphens

The folder name **MUST** be short and simple!

## Still Not Working?

If the extension still doesn't load:

1. **Enable Debug Mode** (required for CEP extensions to work):

   **Windows** - Run this .reg file:
   ```reg
   Windows Registry Editor Version 5.00

   [HKEY_CURRENT_USER\Software\Adobe\CSXS.9]
   "PlayerDebugMode"="1"

   [HKEY_CURRENT_USER\Software\Adobe\CSXS.10]
   "PlayerDebugMode"="1"

   [HKEY_CURRENT_USER\Software\Adobe\CSXS.11]
   "PlayerDebugMode"="1"
   ```

   **macOS** - Run in Terminal:
   ```bash
   defaults write com.adobe.CSXS.9 PlayerDebugMode 1
   defaults write com.adobe.CSXS.10 PlayerDebugMode 1
   defaults write com.adobe.CSXS.11 PlayerDebugMode 1
   ```

2. **Check File Structure** - Make sure all files are in the right place:
   ```
   FluxMotion/
   ├── index.html          ← Must exist!
   ├── .debug              ← Should exist
   ├── CSXS/
   │   └── manifest.xml    ← Must exist!
   ├── js/
   │   ├── main.js
   │   ├── browser.js
   │   ├── ui.js
   │   └── host.jsx        ← Important!
   ├── css/
   ├── img/
   └── lib/
       └── CSInterface.js  ← Required!
   ```

3. **Restart After Effects** - Completely quit and reopen

4. See full installation guide in `INSTALL.md`
