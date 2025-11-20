/**
 * UI Manager for File Browser
 * Handles all UI rendering and user interactions
 */

const UIManager = {
    elements: {},
    currentItems: [],
    selectedItem: null,

    /**
     * Initialize UI elements
     */
    init: function() {
        // Cache DOM elements
        this.elements = {
            // Video preview
            videoPlaceholder: document.getElementById('videoPlaceholder'),
            videoPlayer: document.getElementById('videoPlayer'),
            imagePreview: document.getElementById('imagePreview'),
            youtubePreview: document.getElementById('youtubePreview'),
            audioPlayerContainer: document.getElementById('audioPlayerContainer'),
            audioPlayer: document.getElementById('audioPlayer'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeValue: document.getElementById('volumeValue'),
            currentFileName: document.getElementById('currentFileName'),

            // Navigation
            backBtn: document.getElementById('backBtn'),
            breadcrumbPath: document.getElementById('breadcrumbPath'),
            refreshBtn: document.getElementById('refreshBtn'),

            // Content
            folderGrid: document.getElementById('folderGrid'),

            // Toast
            toast: document.getElementById('notificationToast')
        };

        this.setupEventListeners();
        this.setupAudioPlayer();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
        // Refresh button
        this.elements.refreshBtn.addEventListener('click', () => {
            this.loadFiles();
        });

        // Back button
        this.elements.backBtn.addEventListener('click', () => {
            this.navigateBack();
        });
    },

    /**
     * Setup audio player
     */
    setupAudioPlayer: function() {
        const audioPlayer = this.elements.audioPlayer;
        const volumeSlider = this.elements.volumeSlider;
        const volumeValue = this.elements.volumeValue;

        // Set initial volume to 50%
        audioPlayer.volume = 0.5;

        // Volume slider event
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audioPlayer.volume = volume;
            volumeValue.textContent = e.target.value + '%';
        });
    },

    /**
     * Load files from Projects folder
     */
    loadFiles: function() {
        this.showNotification('Loading files from Projects folder...');

        FileBrowser.loadProjectsFolder((result) => {
            if (result.error) {
                this.showNotification('Error: ' + result.error);
                return;
            }

            this.currentItems = result.items || [];
            this.showNotification(`Loaded ${result.fileCount} files from ${result.folderCount} folders`);
            this.renderFolderGrid();
            this.updateBreadcrumbs();
        });
    },

    /**
     * Render folder grid
     */
    renderFolderGrid: function() {
        const grid = this.elements.folderGrid;
        grid.innerHTML = '';

        if (this.currentItems.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <div class="empty-state-text">
                        No files found. Place files in the Projects folder and click Refresh.
                    </div>
                </div>
            `;
            return;
        }

        this.currentItems.forEach(item => {
            const element = item.type === 'folder'
                ? this.createFolderElement(item)
                : this.createFileElement(item);
            grid.appendChild(element);
        });
    },

    /**
     * Create folder element
     */
    createFolderElement: function(folderItem) {
        const div = document.createElement('div');
        div.className = 'folder-item';
        div.title = `Open ${folderItem.name}`;

        // Find first .png file in folder for preview
        const pngFile = folderItem.files?.find(f =>
            f.fileType?.toLowerCase() === 'png' ||
            f.fileType?.toLowerCase() === 'jpg' ||
            f.fileType?.toLowerCase() === 'jpeg' ||
            f.fileType?.toLowerCase() === 'gif'
        );

        // If there's a preview image, add it
        if (pngFile) {
            const preview = document.createElement('img');
            preview.className = 'folder-preview';
            preview.src = 'file:///' + pngFile.filePath.replace(/\\/g, '/');
            preview.alt = folderItem.name;
            div.appendChild(preview);
        }

        const name = document.createElement('div');
        name.className = 'item-name';
        // Decode URL encoding (e.g., %20 for spaces)
        name.textContent = decodeURIComponent(folderItem.name);

        const info = document.createElement('div');
        info.className = 'item-info';
        info.textContent = `${folderItem.files?.length || 0} items`;

        div.appendChild(name);
        div.appendChild(info);

        div.addEventListener('click', () => {
            this.openFolder(folderItem);
        });

        div.addEventListener('dblclick', () => {
            this.openFolder(folderItem);
        });

        return div;
    },

    /**
     * Create file element
     */
    createFileElement: function(fileItem) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.title = fileItem.fileName;

        const icon = document.createElement('div');
        icon.className = 'item-icon';
        icon.textContent = FileBrowser.getFileIcon(fileItem.fileType);

        const name = document.createElement('div');
        name.className = 'item-name';
        // Decode URL encoding (e.g., %20 for spaces)
        name.textContent = decodeURIComponent(fileItem.name);

        const info = document.createElement('div');
        info.className = 'item-info';
        info.textContent = FileBrowser.formatFileSize(fileItem.fileSize);

        div.appendChild(icon);
        div.appendChild(name);
        div.appendChild(info);

        div.addEventListener('click', () => {
            this.selectFile(fileItem, div);
        });

        div.addEventListener('dblclick', () => {
            this.openInAfterEffects(fileItem);
        });

        return div;
    },

    /**
     * Open a folder
     */
    openFolder: function(folderItem) {
        const result = FileBrowser.navigateInto(folderItem);

        if (result) {
            this.currentItems = result.items;
            this.renderFolderGrid();
            this.updateBreadcrumbs();
            this.clearPreview();
        }
    },

    /**
     * Navigate back
     */
    navigateBack: function() {
        const result = FileBrowser.navigateBack();

        if (result) {
            if (result.reload) {
                // Need to reload from root and navigate to path
                this.loadFiles();
            } else {
                this.currentItems = result.items;
                this.renderFolderGrid();
            }
            this.updateBreadcrumbs();
            this.clearPreview();
        }
    },

    /**
     * Update breadcrumbs
     */
    updateBreadcrumbs: function() {
        const breadcrumbs = FileBrowser.getBreadcrumbs();
        const pathElement = this.elements.breadcrumbPath;

        pathElement.innerHTML = '';

        breadcrumbs.forEach((crumb, index) => {
            const span = document.createElement('span');
            span.className = 'breadcrumb-item';
            span.textContent = crumb.name;

            if (index === breadcrumbs.length - 1) {
                span.classList.add('active');
            } else {
                span.addEventListener('click', () => {
                    this.navigateToPath(crumb.path);
                });
            }

            pathElement.appendChild(span);
        });

        // Enable/disable back button
        this.elements.backBtn.disabled = breadcrumbs.length <= 1;
    },

    /**
     * Navigate to specific path
     */
    navigateToPath: function(pathArray) {
        FileBrowser.currentPath = pathArray;
        this.loadFiles();
    },

    /**
     * Select a file for preview
     */
    selectFile: function(fileItem, element) {
        // Remove previous selection
        document.querySelectorAll('.file-item.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Add selection
        element.classList.add('selected');

        this.selectedItem = fileItem;
        FileBrowser.selectFile(fileItem);

        // Update preview
        this.showPreview(fileItem);

        // Update file name display
        this.elements.currentFileName.textContent = fileItem.fileName;
    },

    /**
     * Show preview for file
     */
    showPreview: function(fileItem) {
        const videoPlayer = this.elements.videoPlayer;
        const imagePreview = this.elements.imagePreview;
        const youtubePreview = this.elements.youtubePreview;
        const audioPlayerContainer = this.elements.audioPlayerContainer;
        const audioPlayer = this.elements.audioPlayer;
        const placeholder = this.elements.videoPlaceholder;

        // Hide all preview elements
        videoPlayer.classList.add('hidden');
        imagePreview.classList.add('hidden');
        youtubePreview.classList.add('hidden');
        audioPlayerContainer.classList.add('hidden');
        placeholder.classList.add('hidden');

        const ext = fileItem.fileType?.toLowerCase();

        // Check for YouTube preview in info.json first
        if (fileItem.info && fileItem.info.videoPreview) {
            // Extract src from iframe HTML if needed
            let videoSrc = fileItem.info.videoPreview;

            // If it's an iframe HTML string, extract the src attribute
            if (videoSrc.includes('<iframe')) {
                const srcMatch = videoSrc.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    videoSrc = srcMatch[1];
                }
            }

            // Show YouTube video preview
            youtubePreview.src = videoSrc;
            youtubePreview.classList.remove('hidden');
            return;
        }

        // Show appropriate preview based on file type
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            // Image preview
            imagePreview.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            imagePreview.classList.remove('hidden');
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
            // Video preview
            videoPlayer.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            videoPlayer.classList.remove('hidden');
        } else if (['mp3', 'wav'].includes(ext)) {
            // Audio preview
            audioPlayer.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            audioPlayerContainer.classList.remove('hidden');
        } else {
            // Show placeholder for non-previewable files
            placeholder.classList.remove('hidden');
            const iconElem = placeholder.querySelector('.placeholder-icon');
            const textElem = placeholder.querySelector('.placeholder-text');

            iconElem.textContent = FileBrowser.getFileIcon(ext);
            textElem.textContent = fileItem.fileName;
        }
    },

    /**
     * Clear preview
     */
    clearPreview: function() {
        this.elements.videoPlayer.classList.add('hidden');
        this.elements.imagePreview.classList.add('hidden');
        this.elements.youtubePreview.classList.add('hidden');
        this.elements.audioPlayerContainer.classList.add('hidden');
        this.elements.videoPlaceholder.classList.remove('hidden');

        this.elements.videoPlayer.src = '';
        this.elements.imagePreview.src = '';
        this.elements.youtubePreview.src = '';
        this.elements.audioPlayer.src = '';
        this.elements.currentFileName.textContent = 'No file selected';

        this.selectedItem = null;
    },

    /**
     * Apply to composition
     */
    applyToComposition: function(fileItem) {
        if (!window.AEInterface || !window.AEInterface.applyPreset) {
            this.showNotification('After Effects integration not available');
            return;
        }

        this.showNotification('Applying to composition...');

        window.AEInterface.applyPreset(fileItem.filePath, (result) => {
            if (result === 'true') {
                this.showNotification('✓ Applied successfully!');
            } else if (result.includes('Error')) {
                this.showNotification('✗ ' + result);
            } else {
                this.showNotification('Applied: ' + result);
            }
        });
    },

    /**
     * Open in After Effects
     */
    openInAfterEffects: function(fileItem) {
        if (!window.AEInterface) {
            this.showNotification('After Effects integration not available');
            return;
        }

        const ext = fileItem.fileType?.toLowerCase();

        if (ext === 'jsx') {
            // Execute JSX script
            this.showNotification('Executing JSX script...');
            window.AEInterface.executeJSX(fileItem.filePath, (result) => {
                if (result && result !== 'undefined') {
                    if (result.includes('Error') || result.includes('error')) {
                        this.showNotification('✗ JSX Error: ' + result);
                    } else {
                        this.showNotification('✓ JSX executed successfully');
                    }
                } else {
                    this.showNotification('✓ JSX executed');
                }
            });
        } else if (ext === 'pack' || ext === 'aep') {
            // Import project file into current project
            this.showNotification('Importing project into current After Effects project...');
            window.AEInterface.openProject(fileItem.filePath, (result) => {
                if (result === 'true') {
                    this.showNotification('✓ Project imported successfully!');
                } else if (result.includes('Error')) {
                    this.showNotification('✗ ' + result);
                } else {
                    this.showNotification('✓ Imported: ' + result);
                }
            });
        } else if (ext === 'prst' || ext === 'ffx') {
            // Animation preset - use Apply to Comp instead
            this.showNotification('Use "Apply to Comp" button to apply presets to a selected layer');
        } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tif', 'tiff', 'psd', 'ai', 'svg'].includes(ext)) {
            // Import image file as footage
            this.showNotification('Importing image into After Effects...');
            window.AEInterface.importFile(fileItem.filePath, (result) => {
                if (result === 'true') {
                    this.showNotification('✓ Image imported successfully!');
                } else if (result.includes('Error')) {
                    this.showNotification('✗ ' + result);
                } else {
                    this.showNotification('✓ Imported: ' + result);
                }
            });
        } else if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg'].includes(ext)) {
            // Import video file as footage
            this.showNotification('Importing video into After Effects...');
            window.AEInterface.importFile(fileItem.filePath, (result) => {
                if (result === 'true') {
                    this.showNotification('✓ Video imported successfully!');
                } else if (result.includes('Error')) {
                    this.showNotification('✗ ' + result);
                } else {
                    this.showNotification('✓ Imported: ' + result);
                }
            });
        } else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma'].includes(ext)) {
            // Import audio file to timeline
            this.showNotification('Adding audio to timeline...');
            window.AEInterface.importFileToTimeline(fileItem.filePath, (result) => {
                if (result === 'true') {
                    this.showNotification('✓ Audio added to timeline successfully!');
                } else if (result.includes('Error')) {
                    this.showNotification('✗ ' + result);
                } else {
                    this.showNotification('✓ Added: ' + result);
                }
            });
        } else {
            this.showNotification('File type not supported: .' + ext);
        }
    },

    /**
     * Show notification toast
     */
    showNotification: function(message) {
        console.log('Notification:', message);

        const toast = this.elements.toast;
        if (toast) {
            toast.textContent = message;
            toast.classList.remove('hidden');

            // Auto-hide after 3 seconds
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
};
