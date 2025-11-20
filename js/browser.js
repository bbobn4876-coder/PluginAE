/**
 * File Browser Manager
 * Handles folder navigation and file browsing
 */

const FileBrowser = {
    currentPath: [],  // Stack of folder names
    currentItems: [], // Current folder contents
    selectedFile: null,

    /**
     * Initialize the file browser
     */
    init: function() {
        this.currentPath = [];
        this.currentItems = [];
        this.selectedFile = null;
    },

    /**
     * Load files from Projects folder
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
                    console.error('Error loading Projects folder:', data.error);
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
     * Organize files into folder structure
     */
    organizeFolderStructure: function(files, folders) {
        const items = [];
        const folderMap = new Map();

        // Process folders
        if (folders && Array.isArray(folders)) {
            folders.forEach(folder => {
                const pathParts = folder.path.split('/').filter(p => p);
                const depth = pathParts.length;

                // Only show top-level folders
                if (depth === 1) {
                    folderMap.set(folder.name, {
                        type: 'folder',
                        name: folder.name,
                        path: folder.path,
                        fullPath: folder.fullPath || folder.path,
                        files: [],
                        info: folder.info || null
                    });
                }
            });
        }

        // Process files
        if (files && Array.isArray(files)) {
            files.forEach(file => {
                const folderPath = file.folder || '';
                const topLevelFolder = folderPath.split('/')[0];

                if (topLevelFolder && folderMap.has(topLevelFolder)) {
                    // File belongs to a folder
                    folderMap.get(topLevelFolder).files.push({
                        type: 'file',
                        name: file.name,
                        fileName: file.name,
                        filePath: file.path,
                        fileSize: file.size || 0,
                        fileType: file.type,
                        folder: file.folder,
                        info: file.info || null
                    });
                } else if (!folderPath) {
                    // File is in root of Projects folder
                    items.push({
                        type: 'file',
                        name: file.name,
                        fileName: file.name,
                        filePath: file.path,
                        fileSize: file.size || 0,
                        fileType: file.type,
                        folder: '',
                        info: file.info || null
                    });
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
     * Navigate back to parent folder
     */
    navigateBack: function() {
        if (this.currentPath.length === 0) return null;

        this.currentPath.pop();

        // Need to reload from root and navigate to current path
        return {
            path: this.currentPath.join('/'),
            reload: true
        };
    },

    /**
     * Navigate to root (Projects folder)
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

        this.currentPath.forEach((folder, index) => {
            crumbs.push({
                name: folder,
                path: this.currentPath.slice(0, index + 1)
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
    }
};
