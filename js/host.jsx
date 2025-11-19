/**
 * ExtendScript for After Effects
 * This script runs in the After Effects host application
 */

#target aftereffects

/**
 * Open an After Effects project file
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

        // Close current project if needed (with confirmation)
        if (app.project.file !== null) {
            // Check if current project has unsaved changes
            if (app.project.dirty) {
                var response = confirm("Current project has unsaved changes. Continue opening new project?");
                if (!response) {
                    return "Error: User cancelled operation";
                }
            }
        }

        // Open the project
        var openedProject = app.open(projectFile);

        if (openedProject) {
            return "true";
        } else {
            return "Error: Failed to open project";
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

        // Read and evaluate the JSX file
        jsxFile.open('r');
        var jsxContent = jsxFile.read();
        jsxFile.close();

        // Execute the script content
        var result = eval(jsxContent);

        return result ? result.toString() : "true";

    } catch (e) {
        return "Error: " + e.toString();
    }
}

/**
 * Scan Projects folder for JSX and GIF files
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
        var allFiles = projectsFolder.getFiles();

        for (var i = 0; i < allFiles.length; i++) {
            var file = allFiles[i];

            // Check if it's a file (not a folder)
            if (file instanceof File) {
                var fileName = file.name.toLowerCase();

                // Check for .jsx or .gif extensions
                if (fileName.match(/\.(jsx|gif)$/i)) {
                    var fileType = fileName.split('.').pop().toLowerCase();

                    files.push({
                        name: file.name,
                        path: file.fsName,
                        type: fileType,
                        size: file.length
                    });
                }
            }
        }

        return JSON.stringify({
            files: files,
            count: files.length
        });

    } catch (e) {
        return JSON.stringify({
            error: e.toString()
        });
    }
}
