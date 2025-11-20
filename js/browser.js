/**
 * File Browser Manager
 * Handles folder navigation and file browsing
 */

const FileBrowser = {
    currentPath: [],  // Stack of folder names or {type: 'aep', name: 'file.aep', path: '/path/to/file.aep'}
    currentItems: [], // Current folder contents
    allItems: [],     // All items from root for global search
    selectedFile: null,
    currentAepFile: null, // Currently opened .aep file object

    /**
     * Initialize the file browser
     */
    init: function() {
        this.currentPath = [];
        this.currentItems = [];
        this.selectedFile = null;
        this.currentAepFile = null;
    },

    /**
     * Load files from FluxMotion folder
     */
    loadProjectsFolder: function(callback) {
        if (!window.AEInterface || !window.AEInterface.scanProjectsFolder) {
            console.error('AEInterface not available');
            if (callback) callback({ error: 'After Effects integration not available' });
            return;
        }

        window.AEInterface.scanProjectsFolder((result) => {
            try {
                const data = JSON.parse(result);

                if (data.error) {
                    console.error('Error loading FluxMotion folder:', data.error);
                    if (callback) callback(data);
                    return;
                }

                // Organize data into folder structure
                this.currentItems = this.organizeFolderStructure(data.files, data.folders);

                if (callback) callback({
                    success: true,
                    items: this.currentItems,
                    fileCount: data.files ? data.files.length : 0,
                    folderCount: data.folderCount || 0
                });

            } catch (e) {
                console.error('Error parsing folder data:', e);
                if (callback) callback({ error: 'Failed to parse folder data' });
            }
        });
    },

    /**
     * Decode file name from URL encoding
     */
    decodeFileName: function(name) {
        if (!name) return name;
        try {
            return decodeURIComponent(name);
        } catch (e) {
            return name
                .replace(/%20/g, ' ')
                .replace(/%21/g, '!')
                .replace(/%23/g, '#')
                .replace(/%24/g, '$')
                .replace(/%26/g, '&')
                .replace(/%27/g, "'")
                .replace(/%28/g, '(')
                .replace(/%29/g, ')')
                .replace(/%2B/g, '+')
                .replace(/%2C/g, ',')
                .replace(/%2D/g, '-')
                .replace(/%2E/g, '.')
                .replace(/%3D/g, '=')
                .replace(/%40/g, '@')
                .replace(/%5B/g, '[')
                .replace(/%5D/g, ']');
        }
    },

    /**
     * Organize files into folder structure
     */
    organizeFolderStructure: function(files, folders) {
        const items = [];
        const folderMap = new Map();

        // First pass: collect all .mp4 and .gif files by name (without extension) for .aep previews
        const videoPreviewFiles = new Map();
        // Collect all .png files by name (without extension) for folder previews
        const pngFiles = new Map();

        if (files && Array.isArray(files)) {
            files.forEach(file => {
                const fileType = file.type ? file.type.toLowerCase() : '';

                // Collect video preview files (.mp4 and .gif)
                if (fileType === 'mp4' || fileType === 'gif') {
                    const baseName = file.name.replace(/\.(mp4|gif)$/i, '');
                    const folderPath = file.folder || '';
                    const key = folderPath + '/' + baseName;

                    // Prefer .gif over .mp4 if both exist
                    if (fileType === 'gif' || !videoPreviewFiles.has(key)) {
                        videoPreviewFiles.set(key, file.path);
                    }
                }

                // Collect .png files for folder previews
                if (fileType === 'png') {
                    const baseName = file.name.replace(/\.png$/i, '');
                    const folderPath = file.folder || '';
                    const key = folderPath + '/' + baseName;
                    pngFiles.set(key, file.path);
                }
            });
        }

        // Process folders
        if (folders && Array.isArray(folders)) {
            folders.forEach(folder => {
                const pathParts = folder.path.split('/').filter(p => p);
                const depth = pathParts.length;

                // Only show top-level folders
                if (depth === 1) {
                    // Check if there's a .png file with the same name as this folder
                    // PNG files in root with folder name should match
                    const folderPreviewKey = '/' + folder.name;
                    let folderPreviewPath = pngFiles.get(folderPreviewKey) || null;

                    // Also check for PNG files inside the folder with the same name
                    if (!folderPreviewPath) {
                        const folderInternalKey = folder.name + '/' + folder.name;
                        folderPreviewPath = pngFiles.get(folderInternalKey) || null;
                    }

                    folderMap.set(folder.name, {
                        type: 'folder',
                        name: this.decodeFileName(folder.name),
                        path: folder.path,
                        fullPath: folder.fullPath || folder.path,
                        files: [],
                        info: folder.info || null,
                        folderPreviewPath: folderPreviewPath
                    });
                }
            });
        }

        // Process files (skip .mp4, .gif, .png, .jpg, and .mov files)
        if (files && Array.isArray(files)) {
            files.forEach(file => {
                const fileType = file.type ? file.type.toLowerCase() : '';

                // Skip .mp4, .gif, .png, .jpg, and .mov files - they will be used as previews only
                if (fileType === 'mp4' || fileType === 'gif' || fileType === 'png' ||
                    fileType === 'jpg' || fileType === 'jpeg' || fileType === 'mov') {
                    return;
                }

                const folderPath = file.folder || '';
                const topLevelFolder = folderPath.split('/')[0];

                // Check if there's a matching video preview file (.gif or .mp4) for .aep files
                let videoPreviewPath = null;
                if (fileType === 'aep') {
                    const baseName = file.name.replace(/\.aep$/i, '');
                    const key = folderPath + '/' + baseName;
                    if (videoPreviewFiles.has(key)) {
                        videoPreviewPath = videoPreviewFiles.get(key);
                    }
                }

                const fileObj = {
                    type: 'file',
                    name: this.decodeFileName(file.name),
                    fileName: this.decodeFileName(file.name),
                    filePath: file.path,
                    fileSize: file.size || 0,
                    fileType: file.type,
                    folder: file.folder,
                    info: file.info || null,
                    videoPreviewPath: videoPreviewPath
                };

                if (topLevelFolder && folderMap.has(topLevelFolder)) {
                    // File belongs to a folder
                    folderMap.get(topLevelFolder).files.push(fileObj);
                } else if (!folderPath) {
                    // File is in root of FluxMotion folder
                    items.push(fileObj);
                }
            });
        }

        // Convert folder map to array
        folderMap.forEach(folder => {
            items.push(folder);
        });

        return items.sort((a, b) => {
            // Folders first, then files
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            // Then alphabetically
            return a.name.localeCompare(b.name);
        });
    },

    /**
     * Navigate into a folder
     */
    navigateInto: function(folderItem) {
        if (folderItem.type !== 'folder') return;

        // Update path
        this.currentPath.push(folderItem.name);

        // Set current items to folder contents
        this.currentItems = folderItem.files || [];

        return {
            path: this.currentPath.join('/'),
            items: this.currentItems
        };
    },

    /**
     * Open .aep file as a folder (navigate into it)
     */
    openAepFile: function(fileItem, callback) {
        if (!fileItem.filePath || !['aep', 'pack'].includes(fileItem.fileType?.toLowerCase())) {
            if (callback) callback({ error: 'Not a valid .aep file' });
            return;
        }

        // Get contents of .aep file
        window.AEInterface.getAepContents(fileItem.filePath, (result) => {
            try {
                const contents = JSON.parse(result);

                if (contents.error) {
                    console.error('Error loading .aep contents:', contents.error);
                    if (callback) callback({ error: contents.error });
                    return;
                }

                // Store current .aep file info
                this.currentAepFile = {
                    name: fileItem.fileName,
                    path: fileItem.filePath,
                    fileItem: fileItem
                };

                // Convert compositions and footage to file items
                const items = [];

                // Add compositions
                if (contents.compositions && contents.compositions.length > 0) {
                    contents.compositions.forEach(comp => {
                        items.push({
                            type: 'aep-composition',
                            name: comp.name,
                            fileName: comp.name,
                            fileType: 'composition',
                            aepPath: fileItem.filePath,
                            compositionName: comp.name,
                            info: {
                                width: comp.width,
                                height: comp.height,
                                duration: comp.duration,
                                frameRate: comp.frameRate,
                                numLayers: comp.numLayers
                            }
                        });
                    });
                }

                // Add footage items
                if (contents.footage && contents.footage.length > 0) {
                    contents.footage.forEach(footage => {
                        items.push({
                            type: 'aep-footage',
                            name: footage.name,
                            fileName: footage.name,
                            fileType: 'footage',
                            aepPath: fileItem.filePath,
                            footageName: footage.name,
                            info: {
                                width: footage.width,
                                height: footage.height,
                                duration: footage.duration
                            }
                        });
                    });
                }

                // Update path (add .aep file as a "folder" in path)
                this.currentPath.push({
                    type: 'aep',
                    name: fileItem.fileName,
                    path: fileItem.filePath
                });

                // Set current items
                this.currentItems = items;

                if (callback) callback({
                    success: true,
                    items: items,
                    path: this.getCurrentPathString()
                });

            } catch (e) {
                console.error('Error parsing .aep contents:', e);
                if (callback) callback({ error: 'Failed to parse .aep contents' });
            }
        });
    },

    /**
     * Get current path as a string
     */
    getCurrentPathString: function() {
        return this.currentPath.map(item => {
            if (typeof item === 'string') {
                return item;
            } else if (item.type === 'aep') {
                return item.name;
            }
            return item;
        }).join('/');
    },

    /**
     * Navigate back to parent folder
     */
    navigateBack: function() {
        if (this.currentPath.length === 0) return null;

        const lastItem = this.currentPath.pop();

        // If we're exiting an .aep file, clear the current aep file
        if (typeof lastItem === 'object' && lastItem.type === 'aep') {
            this.currentAepFile = null;
        }

        // Need to reload from root and navigate to current path
        return {
            path: this.getCurrentPathString(),
            reload: true
        };
    },

    /**
     * Navigate to root (FluxMotion folder)
     */
    navigateToRoot: function() {
        this.currentPath = [];
        return {
            path: '',
            reload: true
        };
    },

    /**
     * Get current breadcrumb path
     */
    getBreadcrumbs: function() {
        const crumbs = [{ name: 'Projects', path: [] }];

        this.currentPath.forEach((item, index) => {
            const name = typeof item === 'string' ? item : item.name;
            crumbs.push({
                name: name,
                path: this.currentPath.slice(0, index + 1),
                isAep: typeof item === 'object' && item.type === 'aep'
            });
        });

        return crumbs;
    },

    /**
     * Get file icon based on type
     */
    getFileIcon: function(fileType) {
        const icons = {
            // Project files
            'pack': '📦',
            'aep': '📦',

            // After Effects items
            'composition': '🎬',
            'footage': '🎞️',

            // Scripts
            'jsx': '📜',

            // Images
            'gif': '🖼️',
            'png': '🖼️',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'bmp': '🖼️',
            'tif': '🖼️',
            'tiff': '🖼️',
            'psd': '🖼️',
            'ai': '🖼️',
            'svg': '🖼️',

            // Video
            'mp4': '🎥',
            'mov': '🎥',
            'avi': '🎥',
            'webm': '🎥',
            'mkv': '🎥',
            'flv': '🎥',
            'wmv': '🎥',
            'mpg': '🎥',
            'mpeg': '🎥',

            // Audio
            'mp3': '🎵',
            'wav': '🎵',
            'aac': '🎵',
            'flac': '🎵',
            'ogg': '🎵',
            'wma': '🎵',

            // Presets
            'prst': '⚡',
            'ffx': '⚡'
        };

        return icons[fileType?.toLowerCase()] || '📄';
    },

    /**
     * Format file size
     */
    formatFileSize: function(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Select a file for preview
     */
    selectFile: function(fileItem) {
        if (fileItem.type !== 'file') return null;

        this.selectedFile = fileItem;
        return this.selectedFile;
    },

    /**
     * Search globally across all folders and files
     * @param {string} query - Search query
     * @return {Array} - Array of matching items
     */
    searchGlobal: function(query) {
        if (!query || query.trim() === '') {
            return [];
        }

        const searchQuery = query.toLowerCase().trim();
        const results = [];

        // Helper function to recursively search through items
        const searchItems = (items, parentPath = '') => {
            items.forEach(item => {
                const itemName = item.name.toLowerCase();

                // Skip media files from search (.png, .jpg, .mp4, .gif, .mov)
                if (item.type === 'file') {
                    const fileType = item.fileType ? item.fileType.toLowerCase() : '';
                    if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' ||
                        fileType === 'mp4' || fileType === 'gif' || fileType === 'mov') {
                        return;
                    }
                }

                // Check if item name matches search query
                if (itemName.includes(searchQuery)) {
                    // Clone the item and add parent path info
                    const resultItem = { ...item };
                    resultItem.searchPath = parentPath ? parentPath + '/' + item.name : item.name;
                    results.push(resultItem);
                }

                // If it's a folder, search its contents recursively
                if (item.type === 'folder' && item.files && item.files.length > 0) {
                    const newParentPath = parentPath ? parentPath + '/' + item.name : item.name;
                    searchItems(item.files, newParentPath);
                }
            });
        };

        // Start search from all items
        searchItems(this.allItems);

        return results;
    }
};
