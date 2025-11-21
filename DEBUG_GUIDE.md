# Debugging Guide - FluxMotion Plugin

## How to Debug the Plugin

### 1. Open Chrome DevTools

The plugin runs in a Chromium browser embedded in After Effects. You can debug it like a web page:

1. **Enable Remote Debugging** (if not already enabled):
   - Close After Effects
   - Edit the `.debug` file in the plugin folder
   - Make sure it contains the correct extension ID

2. **Open DevTools**:
   - **Method 1**: Right-click inside the plugin panel → "Inspect Element" or "Debug"
   - **Method 2**: Open Chrome browser and navigate to:
     ```
     http://localhost:8088
     ```
   - You should see a list of available CEP extensions
   - Click on "FluxMotion" to open DevTools

3. **View Console Logs**:
   - Click the "Console" tab
   - You will see all `console.log()` messages here
   - Errors will be shown in red

### 2. Check What's Happening

After opening the plugin, look at the Console tab. You should see:

```
AEP Preview Plugin starting...
CEP Interface initialized
PresetManager initialized
FileBrowser initialized
UIManager.loadFiles() called
Scanning files from E:/af/Adobe After Effects 2025/Projects...
Calling FileBrowser.loadProjectsFolder...
AEInterface.scanProjectsFolder() called
Executing ExtendScript: scanProjectsFolder()
ExtendScript result: {"files":[...], "folders":[...], ...}
FileBrowser.loadProjectsFolder callback received: {success: true, items: [...], ...}
Successfully loaded X files from Y folders
AEP Preview Plugin ready
```

### 3. Common Issues and Solutions

#### Issue: "AEInterface not available"

**Problem**: The ExtendScript bridge is not initialized.

**Solution**:
1. Check that `lib/CSInterface.js` exists in the plugin folder
2. Make sure `js/host.jsx` is specified in `CSXS/manifest.xml`
3. Restart After Effects

#### Issue: "Projects folder not found"

**Problem**: The folder path in `host.jsx` doesn't exist or is incorrect.

**Solution**:
1. Open `js/host.jsx`
2. Find line 456:
   ```javascript
   var projectsFolder = new Folder("E:/af/Adobe After Effects 2025/Projects");
   ```
3. Verify the path exists in Windows Explorer
4. Make sure to use forward slashes `/` even on Windows
5. Change to your actual path if different

#### Issue: "No files found" or empty folder tree

**Problem**: The folder exists but no files are being scanned.

**Possible causes**:

1. **Folder is actually empty**:
   - Add some files (`.aep`, `.jsx`, images, etc.) to the Projects folder
   - Create subfolders with files

2. **Files are hidden**:
   - In Windows Explorer, enable "Show hidden files"
   - Make sure files don't start with `.` (dot)

3. **Permission issues**:
   - Run After Effects as Administrator
   - Check folder permissions in Windows

4. **Wrong file types**:
   - The plugin should scan ALL file types
   - Check the Console for "Found X files and Y folders" message
   - If it says "Found 0 files", add some files to the folder

#### Issue: "ExtendScript returned empty result"

**Problem**: The ExtendScript is not executing or not returning data.

**Solution**:
1. Check Console for error messages
2. Verify `host.jsx` is loaded by checking the manifest
3. Open `CSXS/manifest.xml` and verify:
   ```xml
   <ScriptPath>./js/host.jsx</ScriptPath>
   ```
4. Restart After Effects

### 4. Manual Testing

You can manually test the ExtendScript function:

1. Open **Window** → **ExtendScript Toolkit** (if available)
2. Or use the **After Effects Console** (available in some versions)
3. Run this command:
   ```javascript
   $.evalFile("path/to/FluxMotion/js/host.jsx");
   var result = scanProjectsFolder();
   alert(result);
   ```

This will show you the raw JSON result from the scan.

### 5. Verify File Structure

Make sure your plugin folder structure looks like this:

```
FluxMotion/
├── index.html          ✓ Main HTML file
├── .debug              ✓ Debug configuration
├── CSXS/
│   └── manifest.xml    ✓ CEP manifest
├── js/
│   ├── main.js         ✓ Main JavaScript
│   ├── browser.js      ✓ File browser logic
│   ├── ui.js           ✓ UI management
│   └── host.jsx        ✓ ExtendScript (IMPORTANT!)
├── lib/
│   └── CSInterface.js  ✓ Required library
├── css/
├── img/
└── Projects/           ✗ NOT HERE! Should be external!
```

**Important**: The Projects folder should be at:
```
E:\af\Adobe After Effects 2025\Projects
```

NOT inside the plugin folder!

### 6. Enable Verbose Logging

All logging is now enabled by default. Check the Console for:

- `UIManager.loadFiles() called` - UI started the scan
- `FileBrowser.loadProjectsFolder() called` - Browser module called
- `AEInterface.scanProjectsFolder() called` - Bridge to ExtendScript
- `Executing ExtendScript: scanProjectsFolder()` - Running the script
- `ExtendScript result: {...}` - Raw result from After Effects
- `Parsed data: {...}` - Parsed JSON data
- `Found X files and Y folders` - Scan results
- `Organized items: [...]` - Final organized structure

### 7. Test the Projects Folder

Create a test structure:

```
E:\af\Adobe After Effects 2025\Projects\
├── TestFolder1/
│   ├── test.aep
│   └── preview.gif
├── TestFolder2/
│   ├── script.jsx
│   └── image.png
└── test-root-file.aep
```

Then click the Refresh button (🔄) and check the Console.

### 8. Common Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| `CSInterface not initialized` | CEP not loaded | Restart After Effects |
| `After Effects integration not available` | ExtendScript bridge failed | Check manifest.xml |
| `Projects folder not found at: ...` | Path doesn't exist | Fix path in host.jsx |
| `No files found in: ...` | Folder is empty | Add files to Projects folder |
| `Failed to parse folder data` | JSON parsing error | Check Console for details |

### 9. Get Help

If problems persist:

1. Copy all Console messages
2. Take a screenshot of the error
3. Verify your folder structure
4. Check that the Projects folder path is correct
5. Report the issue with all details

### 10. Quick Checklist

- [ ] Plugin installed in correct extensions folder
- [ ] Folder named exactly `FluxMotion` or `PluginAE`
- [ ] Debug mode enabled (PlayerDebugMode = 1)
- [ ] After Effects restarted after installation
- [ ] Projects folder exists at `E:/af/Adobe After Effects 2025/Projects`
- [ ] Projects folder contains files
- [ ] DevTools Console is open
- [ ] No errors in Console
- [ ] "Successfully loaded X files" message appears
