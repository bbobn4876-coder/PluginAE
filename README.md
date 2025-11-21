# AEP Preview - Adobe After Effects Plugin

A powerful CEP (Common Extensibility Platform) extension for Adobe After Effects that allows you to manage, organize, and preview your project files with an intuitive interface.

## Features

### Security
- **Password Protection**: Secure access with password authentication (default: 1234)
- **Session Management**: Stays authenticated during your After Effects session

### File Management
- **All File Types**: Support for `.pack`/`.aep` project files, `.jsx` scripts, `.gif` previews, and more
- **Projects Folder**: Automatic recursive scanning of ALL file types from Projects directory
- **Automatic Grouping**: Files are automatically grouped by folder names with smart color coding
- **Smart Preview**: Visual preview for images, detailed project contents for .pack/.aep files

### Organization
- **Preset Grouping**: Organize presets into custom groups with color coding
- **Tagging System**: Add multiple tags to presets for better organization
- **Search Functionality**: Quickly find presets by name or tag
- **Filter by Group**: Dropdown filter to view specific groups

### Integration
- **Apply to Composition**: Apply presets/effects directly to active composition without closing your project
- **JSX Script Execution**: Run ExtendScript files directly in After Effects
- **Project Loading**: Open `.pack`/`.aep` files as After Effects projects
- **Project Preview**: View composition details, statistics, and contents for .pack/.aep files
- **Smart File Handling**: Different actions based on file type

### User Experience
- **Dark Theme**: Seamlessly integrates with After Effects' dark interface
- **Local Storage**: All data persists between sessions
- **Interactive Notifications**: Visual toast notifications for all actions
- **Clickable Compositions**: Click on compositions in preview to view details
- **Keyboard Shortcuts**: Quick access with Ctrl/Cmd+F and Escape
- **Hover Effects**: Interactive UI elements with visual feedback

## Project Structure

```
PluginAE/
├── .idea/              # IDE configuration
├── css/                # Stylesheets
│   ├── fonts.css       # Custom font definitions
│   ├── styles.css      # Main styles
│   └── theme.css       # Theme variables
├── CSXS/               # CEP manifest
│   └── manifest.xml
├── Font/               # Custom fonts directory
│   └── README.md       # Font usage guide
├── img/                # Icons and images
│   ├── icon-dark.png
│   └── icon-light.png
├── js/                 # JavaScript files
│   ├── browser.js      # File browser logic
│   ├── host.jsx        # ExtendScript for AE
│   ├── main.js         # Main application
│   ├── presets.js      # Preset management
│   ├── storage.js      # Local storage
│   └── ui.js           # UI management
├── lib/                # External libraries
│   └── CSInterface.js  # Adobe CEP library
├── META-INF/           # Metadata
├── Projects/           # ⭐ Place your .jsx and .gif files here
│   ├── example.jsx     # Example JSX script
│   └── README.md
├── res/                # Resources
├── .debug              # Debug configuration
├── index.html          # Main HTML file
├── mimetype            # MIME type definition (Adobe AIR)
├── INSTALL.md          # Installation guide
├── USAGE.md            # ⭐ Detailed usage instructions
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

### First Time Login

**Password:** `1234`

Enter the password when the plugin opens. You'll stay logged in for your After Effects session.

### Uploading Files

#### Upload .pack Files:
1. Click the **"Upload Pack Files"** button
2. Select one or more `.pack` files from your computer
3. Or drag and drop `.pack` files directly into the panel

#### Load from Projects Folder:
1. Place `.jsx` and `.gif` files in the `Projects/` folder
2. Click **"Scan Projects Folder"** button
3. All compatible files will be loaded automatically

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

### Working with Files in After Effects

The plugin provides two main ways to use your files:

#### Apply to Active Composition

The **"Apply to Active Composition"** button applies the preset/effect to your currently active composition:

- **For .pack/.aep files**: Imports the project contents into your current project
- **For .jsx files**: Executes the script in the context of the active composition
- **Requirement**: You must have an active composition selected in After Effects
- **Result**: Adds the preset/effect without closing your current project

Steps:
1. Open or create a composition in After Effects
2. Select the composition to make it active
3. In the plugin, click on any preset to open the preview panel
4. Click **"Apply to Active Composition"**

#### Open in After Effects

The **"Open in After Effects"** button works differently based on file type:

- **`.pack`/`.aep` files**: Opens as an After Effects project
- **`.jsx` files**: Executes the ExtendScript in After Effects
- **`.gif` files**: Preview only (shows notification)

Steps:
1. Click on any preset to open the preview panel
2. Click **"Open in After Effects"**
3. The action will be performed based on file type

### Preview Panel

- **GIF/Image files**: Shows animated/static preview image
- **PACK/AEP files**: Shows project contents with composition details, statistics, and clickable compositions
- **All files**: Display file name, type, size, date, group, and folder path
- **Tags**: Add or remove tags
- **Actions**: Apply to composition, open/execute in AE, or delete
- **Interactive**: Click on compositions to view detailed information

### Keyboard Shortcuts

- `Ctrl/Cmd + F`: Focus search input
- `Escape`: Close preview panel or modal
- `Enter`: Submit login or add tag

---

For detailed usage instructions, see [USAGE.md](USAGE.md)

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

#### Adding Custom Fonts

The plugin supports custom fonts through the `Font/` directory:

1. **Add font files** to the `Font/` directory:
   - Supported formats: `.ttf`, `.otf`, `.woff`, `.woff2`

2. **Define fonts** in `css/fonts.css`:
   ```css
   @font-face {
       font-family: 'YourFont';
       src: url('../Font/YourFont.woff2') format('woff2'),
            url('../Font/YourFont.ttf') format('truetype');
       font-weight: 400;
       font-style: normal;
       font-display: swap;
   }
   ```

3. **Use fonts** in your CSS:
   ```css
   body {
       font-family: 'YourFont', 'Segoe UI', sans-serif;
   }
   ```

See `Font/README.md` for detailed instructions.

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

### Version 2.0.0 (Latest)
- **Apply to Composition**: Apply presets directly to active composition
- **Recursive Folder Scanning**: Scan all subfolders in Projects directory
- **Automatic Grouping**: Files automatically grouped by folder names with smart color coding
- **All File Types Support**: Support for all file formats, not just .pack/.jsx/.gif
- **Project Content Preview**: View compositions, statistics, and details for .pack/.aep files
- **Interactive Notifications**: Visual toast notifications for all actions
- **Clickable Compositions**: Click on compositions in preview to view details
- **Improved UI**: Hover effects and better visual feedback
- **Enhanced Preview Panel**: Shows folder paths and project contents

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
