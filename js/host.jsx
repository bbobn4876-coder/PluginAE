/**
 * ExtendScript for After Effects
 * This script runs in the After Effects host application
 */

#target aftereffects

/**
 * Import an After Effects project file into current project
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

        // Import the project file into current project instead of opening as new project
        var importOptions = new ImportOptions(projectFile);

        if (importOptions.canImportAs(ImportAsType.PROJECT)) {
            // Import as project - this adds the project items to the current project
            app.project.importFile(importOptions);
            return "true";
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
 * Execute a JSX script file
 * @param {string} filePath - Full path to the .jsx file
 * @return {string} Result of script execution
 */
function executeJSXFile(filePath) {
    try {
        var jsxFile = new File(filePath);

        if (!jsxFile.exists) {
            return "Error: JSX file not found - " + filePath;
        }

        // Use $.evalFile() which is the proper way to execute JSX scripts
        var result = $.evalFile(jsxFile);

        // Return the result or success message
        if (result !== undefined && result !== null) {
            return result.toString();
        } else {
            return "true";
        }

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Scan Projects folder for ALL files (recursive)
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

        // Start scanning from Projects folder
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
        var presetFile = new File(filePath);

        if (!presetFile.exists) {
            return "Error: File not found - " + filePath;
        }

        var activeComp = app.project.activeItem;

        if (!(activeComp instanceof CompItem)) {
            return "Error: No active composition. Please select a composition first.";
        }

        // Get file extension
        var fileType = filePath.split('.').pop().toLowerCase();

        if (fileType === 'jsx') {
            // Execute JSX file
            return executeJSXFile(filePath);

        } else if (fileType === 'pack' || fileType === 'aep') {
            // Import project file into current project
            var importOptions = new ImportOptions(presetFile);

            if (importOptions.canImportAs(ImportAsType.PROJECT)) {
                // Import as project
                app.project.importFile(importOptions);
                return "true";
            } else {
                return "Error: Cannot import this file type";
            }

        } else if (fileType === 'ffx' || fileType === 'prst') {
            // Apply animation preset to selected layer
            // First check if there's a selected layer
            if (activeComp.selectedLayers.length === 0) {
                return "Error: No layer selected. Please select a layer to apply the preset.";
            }

            var selectedLayer = activeComp.selectedLayers[0];

            // Apply the animation preset
            try {
                selectedLayer.applyPreset(presetFile);
                return "true";
            } catch (presetError) {
                return "Error: Failed to apply preset - " + presetError.toString();
            }

        } else {
            return "Error: Unsupported preset file type: " + fileType;
        }

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
