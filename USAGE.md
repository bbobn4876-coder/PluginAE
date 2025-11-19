# AEP Preview Plugin - Usage Guide

## Quick Start

### 1. Login

When you first open the plugin, you'll see a login screen.

**Password:** `1234`

Enter the password and click "Login" or press Enter.

---

## Main Features

### File Upload

The plugin supports the following file types:

- **`.pack`** - Project files (uploaded via button or drag & drop)
- **`.jsx`** - ExtendScript files (from Projects folder)
- **`.gif`** - GIF animations (from Projects folder)

#### Upload .pack Files

1. Click the **"Upload Pack Files"** button
2. Select one or more `.pack` files
3. Or drag and drop `.pack` files directly into the plugin

### Projects Folder

The plugin includes a `Projects/` folder where you can store presets and backgrounds.

#### Supported Files in Projects Folder:
- **`.jsx`** - ExtendScript scripts (presets, automation)
- **`.gif`** - GIF animations (backgrounds, previews)

#### How to Use:

1. Place your `.jsx` and `.gif` files in the `Projects/` folder
2. Click the **"Scan Projects Folder"** button in the plugin
3. All compatible files will be automatically loaded

#### Example JSX File:

The plugin includes `Projects/example.jsx` which demonstrates:
- Creating a new composition
- Adding a text layer
- Styling and positioning

You can create your own JSX scripts and place them in the Projects folder.

---

## Working with Presets

### Creating Groups

Organize your presets with color-coded groups:

1. Click **"+ New Group"**
2. Enter a group name
3. Select a color
4. Click **"Create Group"**

### Tagging Presets

Add tags to presets for better organization:

1. Click on any preset to open the preview
2. Scroll to the "Tags" section
3. Type a tag name and click "Add"
4. Tags can be removed by clicking the × next to them

### Searching

Find presets quickly:

1. Type in the search box to filter by:
   - Preset name
   - Tags
2. Use the group dropdown to filter by group

---

## Preview Panel

Click any preset to see detailed information:

### For GIF Files:
- **Image Preview** - Actual GIF animation displayed
- File information (name, type, size, date)
- Tags management

### For JSX Files:
- File information
- Tags management
- Execute button

### For PACK Files:
- File information
- Tags management
- Open button

---

## Working with Files in After Effects

The plugin provides two ways to use your files:

### Apply to Active Composition

The **"Apply to Active Composition"** button applies the preset/effect to your currently active composition:

- **For .pack/.aep Files:** Imports the project contents into your current project
- **For .jsx Files:** Executes the script in the context of the active composition
- **Requirement:** You must have an active composition selected in After Effects
- **Result:** Adds the preset/effect without closing your current project

### Open in After Effects

The **"Open in After Effects"** button behaves differently based on file type:

#### .pack Files
- Opens the file as an After Effects project
- Prompts to save current project if there are unsaved changes
- **Preview:** Click on any composition in the preview panel to see its details

#### .jsx Files
- Executes the ExtendScript in After Effects
- Shows success/error notification
- Can create compositions, add layers, run automation, etc.

#### .gif Files
- Shows "Preview only" message
- GIF files are for visual reference only

---

## Keyboard Shortcuts

- **Ctrl/Cmd + F** - Focus search input
- **Escape** - Close preview panel or modal
- **Enter** - Submit login (on login screen)

---

## Tips and Tricks

### 1. Organize with Groups and Tags

Use both groups and tags for maximum organization:
- **Groups** - Broad categories (Effects, Backgrounds, Templates)
- **Tags** - Specific attributes (motion, color, 3d, particles)

### 2. Create Reusable JSX Scripts

Store commonly used scripts in the Projects folder:
- Composition templates
- Layer configurations
- Animation presets
- Batch operations

### 3. Use GIFs for Quick Reference

Place GIF previews of complex effects in the Projects folder to quickly visualize what a preset does.

### 4. Search by Tags

Instead of remembering preset names, tag them with descriptive keywords and search by those.

### 5. Drag and Drop

The fastest way to upload `.pack` files is to drag them directly from your file explorer into the plugin.

---

## File Structure

```
PluginAE/
├── Projects/               ← Place your .jsx and .gif files here
│   ├── example.jsx        ← Example script
│   └── README.md
├── css/
├── js/
├── lib/
└── index.html
```

---

## Troubleshooting

### "After Effects integration not available"

**Solution:** Make sure you're running the plugin inside After Effects, not in a web browser.

### "No JSX or GIF files found in Projects folder"

**Solutions:**
1. Check that files are directly in `Projects/` folder (not in subfolders)
2. Verify file extensions are exactly `.jsx` or `.gif`
3. Restart the plugin

### GIF not displaying in preview

**Solutions:**
1. Check that the GIF file path is correct
2. Try a different GIF file
3. Make sure the GIF is not corrupted

### JSX script errors

**Solutions:**
1. Check the JSX syntax
2. Test the script in ExtendScript Toolkit first
3. Check the console for error messages

### Password not working

The password is exactly: `1234` (no spaces, lowercase numbers)

If you're still having issues, clear your browser cache and restart After Effects.

---

## Examples

### Example 1: Creating a Preset Library

1. Create groups: "Motion Graphics", "Text Effects", "Transitions"
2. Upload your `.pack` files
3. Assign each to appropriate group
4. Add tags like: "fast", "slow", "colorful", "minimal"
5. Search and find presets instantly

### Example 2: Automation with JSX

Create a JSX file that automates repetitive tasks:

```jsx
// auto-setup.jsx
var comp = app.project.items.addComp("My Comp", 1920, 1080, 1, 10, 30);
var solid = comp.layers.addSolid([0, 0, 0], "Background", 1920, 1080, 1, 10);
"Setup complete!";
```

Place in Projects folder, scan, and execute when needed.

### Example 3: GIF References

Keep GIF previews of:
- Complex particle effects
- Animation styles
- Color palettes
- Transition styles

Quick visual reference without opening full projects.

---

## Advanced Usage

### Session Persistence

- Password authentication uses session storage
- Stays logged in for the browser session
- Closes when After Effects closes

### Data Storage

- All preset data is stored locally
- Survives plugin restarts
- Independent per After Effects installation

### File Paths

- The plugin stores full file paths
- Works with files anywhere on your system
- Projects folder is relative to plugin location

---

## Security Note

The password (1234) is for basic access control. For production use with sensitive files, consider:
- Changing the password in `js/main.js` (line 8)
- Using stronger authentication
- Encrypting stored data

---

## Support

For issues or questions:
- Check the main README.md
- Review the INSTALL.md guide
- Check console for error messages
- Ensure After Effects is up to date

---

**Happy organizing! 🎬**
