/**
 * ExtendScript for After Effects
 * This script runs in the After Effects host application
 */

#target aftereffects

/**
 * Import an After Effects project file into current project and add to timeline
 * @param {string} filePath - Full path to the project file (.aep or .pack)
 * @return {string} "true" on success, error message on failure
 */
function openAEProject(filePath) {
    try {
        // Check if file exists
        var projectFile = new File(filePath);

        if (!projectFile.exists) {
            return "Error: File not found - " + filePath;
        }

        // Check file extension - support both .aep and .pack
        if (!filePath.match(/\.(aep|pack)$/i)) {
            return "Error: Not a valid project file (must be .aep or .pack)";
        }

        // Check if there's an active composition
        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            return "Error: No active composition. Please create or open a composition first.";
        }

        // Remember IDs of all existing items before import
        var existingItemIds = {};
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item) {
                existingItemIds[item.id] = true;
            }
        }

        // Import the project file into current project
        var importOptions = new ImportOptions(projectFile);

        if (importOptions.canImportAs(ImportAsType.PROJECT)) {
            // Import as project - this adds the project items to the current project
            app.project.importFile(importOptions);

            // Find or create "Projects" folder
            var fluxMotionFolder = null;
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof FolderItem && item.name === "Projects") {
                    fluxMotionFolder = item;
                    break;
                }
            }

            // Create Projects folder if it doesn't exist
            if (!fluxMotionFolder) {
                fluxMotionFolder = app.project.items.addFolder("Projects");
            }

            // Get .aep file name without extension
            var fileName = projectFile.name.replace(/\.(aep|pack)$/i, '');

            // Create subfolder for this .aep file
            var aepFolder = app.project.items.addFolder(fileName);
            aepFolder.parentFolder = fluxMotionFolder;

            // Find ALL newly imported items (not in our existing IDs list)
            var newCompositions = [];
            var newItems = [];

            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);

                // Check if this item is new (wasn't in our list before)
                if (item && !existingItemIds[item.id]) {
                    // Skip the folders we just created
                    if (item === fluxMotionFolder || item === aepFolder) {
                        continue;
                    }

                    newItems.push(item);

                    // Only collect compositions
                    if (item instanceof CompItem) {
                        newCompositions.push(item);
                    }
                }
            }

            // Move all new items to the .aep folder
            for (var j = 0; j < newItems.length; j++) {
                newItems[j].parentFolder = aepFolder;
            }

            // Add ONLY the first composition to the timeline with in/out points
            if (newCompositions.length > 0) {
                var firstComp = newCompositions[0];

                try {
                    // Add to timeline at the top
                    var newLayer = activeComp.layers.add(firstComp);

                    // Position at current time
                    newLayer.startTime = activeComp.time;

                    // Set in and out points to match composition duration
                    newLayer.inPoint = activeComp.time;
                    newLayer.outPoint = activeComp.time + firstComp.duration;

                    return "true";
                } catch (addError) {
                    return "Error: Failed to add composition to timeline - " + addError.toString();
                }
            } else {
                return "Error: Project imported but no compositions were found. The file may contain only footage items.";
            }
        } else {
            return "Error: Cannot import this project file";
        }

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Get After Effects version information
 * @return {string} Version string
 */
function getAEVersion() {
    try {
        return app.version;
    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Get active composition information
 * @return {string} JSON string with comp info
 */
function getActiveComp() {
    try {
        var comp = app.project.activeItem;

        if (comp === null || !(comp instanceof CompItem)) {
            return JSON.stringify({
                error: "No active composition"
            });
        }

        var compInfo = {
            name: comp.name,
            width: comp.width,
            height: comp.height,
            duration: comp.duration,
            frameRate: comp.frameRate,
            numLayers: comp.numLayers
        };

        return JSON.stringify(compInfo);

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Get project information
 * @return {string} JSON string with project info
 */
function getProjectInfo() {
    try {
        var proj = app.project;

        if (proj.file === null) {
            return JSON.stringify({
                hasProject: false
            });
        }

        var projectInfo = {
            hasProject: true,
            name: proj.file.name,
            path: proj.file.fsName,
            numItems: proj.numItems,
            numComps: 0,
            numFootage: 0
        };

        // Count compositions and footage
        for (var i = 1; i <= proj.numItems; i++) {
            var item = proj.item(i);
            if (item instanceof CompItem) {
                projectInfo.numComps++;
            } else if (item instanceof FootageItem) {
                projectInfo.numFootage++;
            }
        }

        return JSON.stringify(projectInfo);

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Import a file into the project
 * @param {string} filePath - Path to file to import
 * @return {string} "true" on success, error message on failure
 */
function importFile(filePath) {
    try {
        var importFile = new File(filePath);

        if (!importFile.exists) {
            return "Error: File not found - " + filePath;
        }

        var importOptions = new ImportOptions(importFile);

        if (importOptions.canImportAs(ImportAsType.FOOTAGE)) {
            var footage = app.project.importFile(importOptions);
            return "true";
        } else {
            return "Error: Cannot import this file type";
        }

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Import a file into the project and add to timeline
 * @param {string} filePath - Path to file to import
 * @return {string} "true" on success, error message on failure
 */
function importFileToTimeline(filePath) {
    try {
        var importFile = new File(filePath);

        if (!importFile.exists) {
            return "Error: File not found - " + filePath;
        }

        // Check if there's an active composition
        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            return "Error: No active composition. Please create or open a composition first.";
        }

        var importOptions = new ImportOptions(importFile);

        if (importOptions.canImportAs(ImportAsType.FOOTAGE)) {
            // Import the file
            var footage = app.project.importFile(importOptions);

            // Add to timeline at the top
            var newLayer = activeComp.layers.add(footage);

            // Position at current time
            newLayer.startTime = activeComp.time;

            // Set in and out points
            if (footage.duration && footage.duration > 0) {
                newLayer.inPoint = activeComp.time;
                newLayer.outPoint = activeComp.time + footage.duration;
            }

            return "true";
        } else {
            return "Error: Cannot import this file type";
        }

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Save current project
 * @return {string} "true" on success, error message on failure
 */
function saveProject() {
    try {
        if (app.project.file === null) {
            return "Error: No project to save";
        }

        app.project.save();
        return "true";

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Save project as
 * @param {string} filePath - Path where to save the project
 * @return {string} "true" on success, error message on failure
 */
function saveProjectAs(filePath) {
    try {
        var saveFile = new File(filePath);
        app.project.save(saveFile);
        return "true";

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Create a new composition
 * @param {string} name - Name of the composition
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @param {number} duration - Duration in seconds
 * @param {number} frameRate - Frame rate
 * @return {string} "true" on success, error message on failure
 */
function createComp(name, width, height, duration, frameRate) {
    try {
        var comp = app.project.items.addComp(
            name,
            width,
            height,
            1.0, // pixel aspect ratio
            duration,
            frameRate
        );

        return "true";

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Alert message (for debugging)
 * @param {string} message
 */
function showAlert(message) {
    alert(message);
    return "true";
}

/**
 * Get system info
 * @return {string} JSON with system info
 */
function getSystemInfo() {
    try {
        var info = {
            os: $.os,
            version: $.version,
            buildNumber: $.build,
            locale: $.locale
        };

        return JSON.stringify(info);

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Execute a JSX script file and add created items to timeline
 * Same logic as openAEProject but for .jsx files
 * @param {string} filePath - Full path to the .jsx file
 * @return {string} "true" on success, error message on failure
 */
function executeJSXFile(filePath) {
    try {
        // Check if file exists
        var jsxFile = new File(filePath);

        if (!jsxFile.exists) {
            return "Error: File not found - " + filePath;
        }

        // Check file extension
        if (!filePath.match(/\.jsx$/i)) {
            return "Error: Not a valid JSX file (must be .jsx)";
        }

        // Check if there's an active composition
        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            return "Error: No active composition. Please create or open a composition first.";
        }

        // Remember IDs of all existing items before execution
        var existingItemIds = {};
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item) {
                existingItemIds[item.id] = true;
            }
        }

        // Execute the JSX script
        $.evalFile(jsxFile);

        // Find or create "Projects" folder
        var projectsFolder = null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof FolderItem && item.name === "Projects") {
                projectsFolder = item;
                break;
            }
        }

        // Create Projects folder if it doesn't exist
        if (!projectsFolder) {
            projectsFolder = app.project.items.addFolder("Projects");
        }

        // Get .jsx file name without extension
        var fileName = jsxFile.name.replace(/\.jsx$/i, '');

        // Create subfolder for this .jsx file
        var jsxFolder = app.project.items.addFolder(fileName);
        jsxFolder.parentFolder = projectsFolder;

        // Find ALL newly created items (not in our existing IDs list)
        var newCompositions = [];
        var newItems = [];

        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);

            // Check if this item is new (wasn't in our list before)
            if (item && !existingItemIds[item.id]) {
                // Skip the folders we just created
                if (item === projectsFolder || item === jsxFolder) {
                    continue;
                }

                newItems.push(item);

                // Only collect compositions
                if (item instanceof CompItem) {
                    newCompositions.push(item);
                }
            }
        }

        // Move all new items to the .jsx folder
        for (var j = 0; j < newItems.length; j++) {
            newItems[j].parentFolder = jsxFolder;
        }

        // Add ONLY the first composition to the timeline with in/out points
        if (newCompositions.length > 0) {
            var firstComp = newCompositions[0];

            try {
                // Add to timeline at the top
                var newLayer = activeComp.layers.add(firstComp);

                // Position at current time
                newLayer.startTime = activeComp.time;

                // Set in and out points to match composition duration
                newLayer.inPoint = activeComp.time;
                newLayer.outPoint = activeComp.time + firstComp.duration;

                return "true";
            } catch (addError) {
                return "Error: Failed to add composition to timeline - " + addError.toString();
            }
        } else {
            return "Error: Script executed but no compositions were found. The script may contain only footage items or no items at all.";
        }

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Scan FluxMotion folder for ALL files (recursive)
 * @return {string} JSON string with files array
 */
function scanProjectsFolder() {
    try {
        // Get extension path
        var extensionPath = new File($.fileName).parent.parent.fsName;
        var projectsFolder = new Folder(extensionPath + "/Projects");

        if (!projectsFolder.exists) {
            return JSON.stringify({
                error: "Projects folder not found at: " + projectsFolder.fsName
            });
        }

        var files = [];
        var folders = [];

        // Helper function to read info.json from folder
        function readInfoJson(folder) {
            var infoFile = new File(folder.fsName + "/info.json");
            if (infoFile.exists) {
                infoFile.open("r");
                var content = infoFile.read();
                infoFile.close();

                try {
                    return JSON.parse(content);
                } catch (e) {
                    return null;
                }
            }
            return null;
        }

        // Recursive function to scan folders
        function scanFolder(folder, relativePath) {
            var contents = folder.getFiles();
            var infoData = readInfoJson(folder);

            for (var i = 0; i < contents.length; i++) {
                var item = contents[i];

                if (item instanceof Folder) {
                    // It's a folder - scan it recursively
                    var folderName = item.name;
                    var newRelativePath = relativePath ? relativePath + "/" + folderName : folderName;
                    var folderInfo = readInfoJson(item);

                    // Add folder to folders array
                    folders.push({
                        name: folderName,
                        path: newRelativePath,
                        info: folderInfo
                    });

                    // Scan this folder recursively
                    scanFolder(item, newRelativePath);

                } else if (item instanceof File) {
                    // It's a file
                    // Skip hidden files, README, and info.json
                    if (item.name.indexOf('.') === 0 ||
                        item.name.toLowerCase() === 'readme.md' ||
                        item.name.toLowerCase() === 'info.json') {
                        continue;
                    }

                    var fileType = '';
                    var nameParts = item.name.split('.');
                    if (nameParts.length > 1) {
                        fileType = nameParts[nameParts.length - 1].toLowerCase();
                    }

                    files.push({
                        name: item.name,
                        path: item.fsName,
                        type: fileType,
                        size: item.length,
                        folder: relativePath || '', // Which subfolder this file is in
                        info: infoData // Include parent folder's info.json data
                    });
                }
            }
        }

        // Start scanning from FluxMotion folder
        scanFolder(projectsFolder, '');

        return JSON.stringify({
            files: files,
            folders: folders,
            count: files.length,
            folderCount: folders.length
        });

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Get detailed information about a project file (.pack/.aep)
 * @param {string} filePath - Path to the project file
 * @return {string} JSON string with project details
 */
function getProjectDetails(filePath) {
    try {
        var projectFile = new File(filePath);

        if (!projectFile.exists) {
            return JSON.stringify({
                error: "File not found"
            });
        }

        // Check if it's a valid project file
        if (!filePath.match(/\.(aep|pack)$/i)) {
            return JSON.stringify({
                error: "Not a valid project file"
            });
        }

        // Save current project state
        var currentProject = app.project.file;
        var currentProjectPath = currentProject ? currentProject.fsName : null;

        try {
            // Close current project without saving
            if (currentProject !== null) {
                app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
            }

            // Open the target project
            app.open(projectFile);

            var projectData = {
                numItems: app.project.numItems,
                numComps: 0,
                numFootage: 0,
                compositions: []
            };

            // Collect information about items
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);

                if (item instanceof CompItem) {
                    projectData.numComps++;
                    projectData.compositions.push({
                        name: item.name,
                        width: item.width,
                        height: item.height,
                        duration: Math.round(item.duration * 100) / 100,
                        frameRate: item.frameRate,
                        numLayers: item.numLayers
                    });
                } else if (item instanceof FootageItem) {
                    projectData.numFootage++;
                }
            }

            // Close the analyzed project
            app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);

            // Reopen previous project if there was one
            if (currentProjectPath !== null) {
                app.open(new File(currentProjectPath));
            }

            return JSON.stringify(projectData);

        } catch (innerError) {
            // Try to restore previous project even if error occurred
            if (currentProjectPath !== null) {
                try {
                    app.open(new File(currentProjectPath));
                } catch (e) {
                    // Ignore restoration errors
                }
            }
            throw innerError;
        }

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Apply preset/effect to active composition
 * @param {string} filePath - Path to the preset file (.jsx, .pack, .aep, .ffx, .prst)
 * @return {string} "true" on success, error message on failure
 */
function applyPreset(filePath) {
    try {
        // Check if file exists
        var presetFile = new File(filePath);

        if (!presetFile.exists) {
            return "Error: File not found - " + filePath;
        }

        // Check if there's an active composition
        var activeComp = app.project.activeItem;

        if (!(activeComp instanceof CompItem)) {
            return "Error: No active composition. Please select a composition first.";
        }

        // Get file extension
        var fileType = filePath.split('.').pop().toLowerCase();

        // Handle .jsx files
        if (fileType === 'jsx') {
            return executeJSXFile(filePath);
        }

        // Handle .aep and .pack files
        if (fileType === 'pack' || fileType === 'aep') {
            var importOptions = new ImportOptions(presetFile);

            if (importOptions.canImportAs(ImportAsType.PROJECT)) {
                app.project.importFile(importOptions);
                return "true";
            } else {
                return "Error: Cannot import this file type";
            }
        }

        // Handle .ffx preset files
        if (fileType === 'ffx') {
            // Check if a layer is selected
            if (activeComp.selectedLayers.length === 0) {
                return "Error: No layer selected. Please select a layer to apply the preset.";
            }

            var selectedLayer = activeComp.selectedLayers[0];

            try {
                // Apply the preset to the selected layer
                selectedLayer.applyPreset(presetFile);
                return "true";
            } catch (ffxError) {
                return "Error: Failed to apply preset - " + ffxError.toString();
            }
        }

        // Handle .prst preset files (exact same logic as .ffx)
        if (fileType === 'prst') {
            // Check if a layer is selected
            if (activeComp.selectedLayers.length === 0) {
                return "Error: No layer selected. Please select a layer to apply the preset.";
            }

            var selectedLayer = activeComp.selectedLayers[0];

            try {
                // Apply the preset to the selected layer
                selectedLayer.applyPreset(presetFile);
                return "true";
            } catch (prstError) {
                return "Error: Failed to apply preset - " + prstError.toString();
            }
        }

        // Unsupported file type
        return "Error: Unsupported preset file type: " + fileType;

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Render composition preview to image sequence or movie
 * @param {string} compName - Name of the composition to render
 * @param {string} outputPath - Path where to save the preview
 * @return {string} "true" on success, error message on failure
 */
function renderPreview(compName, outputPath) {
    try {
        // Find composition by name
        var comp = null;

        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName) {
                comp = item;
                break;
            }
        }

        if (!comp) {
            return "Error: Composition not found: " + compName;
        }

        // Add to render queue
        var renderQueueItem = app.project.renderQueue.items.add(comp);

        // Set output path
        var outputModule = renderQueueItem.outputModule(1);
        outputModule.file = new File(outputPath);

        // Render
        app.project.renderQueue.render();

        return "true";

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Render composition preview to PNG file
 * @param {CompItem} comp - Composition to render
 * @param {string} outputPath - Path where to save the PNG
 * @return {boolean} True on success, false on failure
 */
function renderCompPreview(comp, outputPath) {
    try {
        // Save current frame
        comp.time = 0;

        // Create a temporary render queue item
        var renderItem = app.project.renderQueue.items.add(comp);

        // Get the output module
        var outputModule = renderItem.outputModule(1);

        // Set output to PNG sequence (we'll only render 1 frame)
        outputModule.applyTemplate("PNG Sequence");

        // Set output file
        var outFile = new File(outputPath);
        outputModule.file = outFile;

        // Set render settings to render only first frame
        var renderSettings = renderItem.renderSettings;
        renderSettings.timeSpan = 0; // Work Area Only

        // Set work area to just the first frame
        comp.workAreaStart = 0;
        comp.workAreaDuration = comp.frameDuration;

        // Start render
        app.project.renderQueue.render();

        // Remove render item from queue
        renderItem.remove();

        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Get contents of an .aep file (list of compositions and footage items)
 * Uses caching to avoid reopening projects
 * Uses import method to avoid showing "Opening Project" popup
 * @param {string} filePath - Full path to the .aep file
 * @return {string} JSON string with contents
 */
function getAepContents(filePath) {
    try {
        var projectFile = new File(filePath);

        if (!projectFile.exists) {
            return JSON.stringify({
                error: "File not found"
            });
        }

        if (!filePath.match(/\.(aep|pack)$/i)) {
            return JSON.stringify({
                error: "Not a valid project file"
            });
        }

        // Check for cache file
        var cacheFilePath = filePath + '.cache.json';
        var cacheFile = new File(cacheFilePath);
        var projectModified = projectFile.modified.getTime();

        // Try to read from cache if it exists and is fresh
        if (cacheFile.exists) {
            try {
                cacheFile.open('r');
                var cacheContent = cacheFile.read();
                cacheFile.close();

                var cacheData = JSON.parse(cacheContent);

                // Check if cache is still valid (file hasn't been modified)
                if (cacheData.timestamp && cacheData.timestamp >= projectModified) {
                    return JSON.stringify(cacheData.contents);
                }
            } catch (cacheError) {
                // Cache read failed, continue to regenerate
            }
        }

        // Cache miss or invalid - use import method (no popup, no project switching)
        try {
            // Remember IDs of all existing items before import
            var existingItemIds = {};
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item) {
                    existingItemIds[item.id] = true;
                }
            }

            // Import the project file into current project (no popup, no switching)
            var importOptions = new ImportOptions(projectFile);

            if (!importOptions.canImportAs(ImportAsType.PROJECT)) {
                return JSON.stringify({
                    error: "Cannot import this project file"
                });
            }

            // Suppress After Effects dialogs (e.g., missing footage warnings)
            app.beginSuppressDialogs();

            app.project.importFile(importOptions);

            // End dialog suppression (false = don't show any dialogs that were suppressed)
            app.endSuppressDialogs(false);

            var contents = {
                compositions: [],
                footage: [],
                folders: []
            };

            // Collect only compositions from newly imported items
            var importedItems = [];
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);

                // Check if this is a newly imported item
                if (item && !existingItemIds[item.id]) {
                    importedItems.push(item);

                    if (item instanceof CompItem) {
                        var compData = {
                            id: item.id,
                            name: item.name,
                            width: item.width,
                            height: item.height,
                            duration: Math.round(item.duration * 100) / 100,
                            frameRate: item.frameRate,
                            numLayers: item.numLayers
                        };

                        contents.compositions.push(compData);
                    }
                }
            }

            // Clean up: remove all imported items (we only needed the metadata)
            // Suppress dialogs during cleanup
            app.beginSuppressDialogs();
            for (var j = 0; j < importedItems.length; j++) {
                try {
                    importedItems[j].remove();
                } catch (removeError) {
                    // Continue even if removal fails
                }
            }
            app.endSuppressDialogs(false);

            // Write to cache
            try {
                var cacheData = {
                    timestamp: projectModified,
                    contents: contents
                };

                cacheFile.open('w');
                cacheFile.write(JSON.stringify(cacheData));
                cacheFile.close();
            } catch (cacheWriteError) {
                // Cache write failed, but we still have the data
            }

            return JSON.stringify(contents);

        } catch (innerError) {
            throw innerError;
        }

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}

/**
 * Import specific composition from an .aep file to timeline
 * @param {string} filePath - Full path to the .aep file
 * @param {string} compName - Name of the composition to import
 * @return {string} "true" on success, error message on failure
 */
function importAepCompositionToTimeline(filePath, compName) {
    try {
        var projectFile = new File(filePath);

        if (!projectFile.exists) {
            return "Error: File not found - " + filePath;
        }

        if (!filePath.match(/\.(aep|pack)$/i)) {
            return "Error: Not a valid project file (must be .aep or .pack)";
        }

        // Check if there's an active composition
        var activeComp = app.project.activeItem;
        if (!(activeComp instanceof CompItem)) {
            return "Error: No active composition. Please create or open a composition first.";
        }

        // Remember IDs of all existing items before import
        var existingItemIds = {};
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item) {
                existingItemIds[item.id] = true;
            }
        }

        // Import the project file into current project
        var importOptions = new ImportOptions(projectFile);

        if (importOptions.canImportAs(ImportAsType.PROJECT)) {
            app.project.importFile(importOptions);

            // Find or create "Projects" folder
            var projectsFolder = null;
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                if (item instanceof FolderItem && item.name === "Projects") {
                    projectsFolder = item;
                    break;
                }
            }

            if (!projectsFolder) {
                projectsFolder = app.project.items.addFolder("Projects");
            }

            // Get .aep file name without extension
            var fileName = projectFile.name.replace(/\.(aep|pack)$/i, '');

            // Create subfolder for this .aep file
            var aepFolder = app.project.items.addFolder(fileName);
            aepFolder.parentFolder = projectsFolder;

            // Find the specific composition and all new items
            var targetComp = null;
            var newItems = [];

            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);

                if (item && !existingItemIds[item.id]) {
                    // Skip the folders we just created
                    if (item === projectsFolder || item === aepFolder) {
                        continue;
                    }

                    newItems.push(item);

                    // Check if this is the composition we're looking for
                    if (item instanceof CompItem && item.name === compName) {
                        targetComp = item;
                    }
                }
            }

            // Move all new items to the .aep folder
            for (var j = 0; j < newItems.length; j++) {
                newItems[j].parentFolder = aepFolder;
            }

            // Add the specific composition to timeline
            if (targetComp) {
                try {
                    var newLayer = activeComp.layers.add(targetComp);
                    newLayer.startTime = activeComp.time;
                    newLayer.inPoint = activeComp.time;
                    newLayer.outPoint = activeComp.time + targetComp.duration;
                    return "true";
                } catch (addError) {
                    return "Error: Failed to add composition to timeline - " + addError.toString();
                }
            } else {
                return "Error: Composition '" + compName + "' not found in project file";
            }
        } else {
            return "Error: Cannot import this project file";
        }

    } catch (e) {
        return "Error: " + e.toString();
    }
}
