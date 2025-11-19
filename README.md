# AEP Preview - Adobe After Effects Plugin

A powerful CEP (Common Extensibility Platform) extension for Adobe After Effects that allows you to manage, organize, and preview your After Effects project files (.aep) with an intuitive interface.

## Features

- **File Upload**: Upload and manage multiple .aep files
- **Preview**: View detailed information about your project files
- **Preset Grouping**: Organize presets into custom groups with color coding
- **Tagging System**: Add multiple tags to presets for better organization
- **Search Functionality**: Quickly find presets by name or tag
- **Drag & Drop**: Drag .aep files directly into the panel
- **Dark Theme**: Seamlessly integrates with After Effects' dark interface
- **Local Storage**: All data persists between sessions

## Project Structure

```
PluginAE/
├── .idea/              # IDE configuration
├── css/                # Stylesheets
│   ├── styles.css
│   └── theme.css
├── CSXS/               # CEP manifest
│   └── manifest.xml
├── img/                # Icons and images
│   ├── icon-dark.png
│   └── icon-light.png
├── js/                 # JavaScript files
│   ├── host.jsx        # ExtendScript for AE
│   ├── main.js         # Main application
│   ├── presets.js      # Preset management
│   ├── storage.js      # Local storage
│   └── ui.js           # UI management
├── lib/                # External libraries
│   └── CSInterface.js  # Adobe CEP library
├── META-INF/           # Metadata
├── res/                # Resources
├── .debug              # Debug configuration
├── index.html          # Main HTML file
├── mimetype            # MIME type definition
└── README.md           # This file
```

## Installation

### Method 1: Manual Installation

1. **Locate the CEP Extensions folder**:

   - **Windows**:
     ```
     C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\
     ```

   - **macOS**:
     ```
     /Library/Application Support/Adobe/CEP/extensions/
     ```

2. **Copy the plugin folder**:
   - Copy the entire `PluginAE` folder to the extensions directory
   - Rename it to `com.aep.preview.panel` if desired

3. **Enable debugging mode** (for development):

   - **Windows**: Create/edit the registry key:
     ```
     HKEY_CURRENT_USER/Software/Adobe/CSXS.9/PlayerDebugMode = "1"
     HKEY_CURRENT_USER/Software/Adobe/CSXS.10/PlayerDebugMode = "1"
     HKEY_CURRENT_USER/Software/Adobe/CSXS.11/PlayerDebugMode = "1"
     ```

   - **macOS**: Run in Terminal:
     ```bash
     defaults write com.adobe.CSXS.9 PlayerDebugMode 1
     defaults write com.adobe.CSXS.10 PlayerDebugMode 1
     defaults write com.adobe.CSXS.11 PlayerDebugMode 1
     ```

4. **Restart After Effects**

5. **Open the extension**:
   - Go to `Window` → `Extensions` → `AEP Preview`

### Method 2: Using ZXP Installer

1. Package the extension as a ZXP file using Adobe's signing tools
2. Install using [ZXP Installer](https://aescripts.com/learn/zxp-installer/)

## Usage

### Uploading Presets

1. Click the **Upload AEP Files** button
2. Select one or more .aep files from your computer
3. Or drag and drop .aep files directly into the panel

### Creating Groups

1. Click the **+ New Group** button
2. Enter a group name
3. Select a color for the group
4. Click **Create Group**

### Managing Presets

1. **View Preset Details**: Click on any preset to open the preview panel
2. **Add Tags**: In the preview panel, type a tag name and click "Add"
3. **Remove Tags**: Click the × next to any tag to remove it
4. **Delete Preset**: Click "Delete Preset" in the preview panel

### Searching

1. Type in the search box to filter presets
2. Search works for both preset names and tags
3. Use the group filter dropdown to filter by group

### Opening in After Effects

1. Select a preset to view its details
2. Click **Open in After Effects** to load the project file

### Keyboard Shortcuts

- `Ctrl/Cmd + F`: Focus search input
- `Escape`: Close preview panel or modal

## Development

### Requirements

- Adobe After Effects CC 2018 or later
- Basic understanding of HTML, CSS, JavaScript
- Node.js (optional, for development tools)

### Debug Mode

To debug the extension:

1. Enable PlayerDebugMode (see installation instructions)
2. Open Chrome DevTools:
   - In After Effects, go to the extension panel
   - Right-click and select "Inspect" or use the debug URL:
   - Navigate to: `http://localhost:8088`

### File Descriptions

- **index.html**: Main UI structure
- **css/styles.css**: Main stylesheet
- **css/theme.css**: Theme variables and colors
- **js/main.js**: Application initialization and CEP interface
- **js/storage.js**: LocalStorage management
- **js/presets.js**: Preset and group management logic
- **js/ui.js**: UI rendering and event handling
- **js/host.jsx**: ExtendScript that runs in After Effects
- **lib/CSInterface.js**: Adobe CEP communication library
- **CSXS/manifest.xml**: Extension manifest and configuration
- **.debug**: Debug port configuration

### Customization

#### Changing Colors

Edit `css/theme.css` to modify the color scheme:

```css
:root {
    --accent-color: #0099ff;  /* Change primary accent color */
    --primary-bg: #232323;    /* Background color */
    /* ... other variables */
}
```

#### Adding Features

1. Add UI elements in `index.html`
2. Add styles in `css/styles.css`
3. Add functionality in the appropriate JS file:
   - Storage operations → `js/storage.js`
   - Preset logic → `js/presets.js`
   - UI updates → `js/ui.js`
   - After Effects integration → `js/host.jsx`

## Compatibility

- **After Effects**: CC 2018 and later (CEP 9+)
- **Operating Systems**: Windows and macOS
- **CEP Versions**: 9, 10, 11

## Troubleshooting

### Extension doesn't appear in After Effects

1. Verify the extension is in the correct folder
2. Check that PlayerDebugMode is enabled
3. Restart After Effects completely
4. Check the manifest.xml for errors

### Cannot open project files

1. Verify the file path is correct
2. Check that the .aep file exists and is not corrupted
3. Ensure After Effects has permission to access the file

### UI looks broken

1. Clear browser cache (right-click → Inspect → Console → Clear)
2. Check for JavaScript errors in the console
3. Verify all CSS and JS files are loaded correctly

### Data not persisting

1. Check browser localStorage is enabled
2. Verify extension has write permissions
3. Check for quota exceeded errors in console

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in After Effects
5. Submit a pull request

## License

This project is released under the MIT License.

## Credits

Created using Adobe's Common Extensibility Platform (CEP)

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check Adobe CEP documentation: https://github.com/Adobe-CEP/CEP-Resources

## Changelog

### Version 1.0.0 (Initial Release)
- File upload and management
- Preset grouping with colors
- Tagging system
- Search functionality
- Preview panel
- After Effects integration
- Drag and drop support
- Local storage persistence

## Roadmap

- [ ] Thumbnail preview for compositions
- [ ] Import/export preset collections
- [ ] Batch operations
- [ ] Custom sorting options
- [ ] Preset templates
- [ ] Cloud sync support
- [ ] Collaboration features

---

**Note**: Replace placeholder icons in the `img/` folder with actual PNG images for production use.
