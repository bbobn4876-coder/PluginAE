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
            currentFileName: document.getElementById('currentFileName'),
            applyToComp: document.getElementById('applyToComp'),
            openInAE: document.getElementById('openInAE'),

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

        // Apply to composition
        this.elements.applyToComp.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.type === 'file') {
                this.applyToComposition(this.selectedItem);
            }
        });

        // Open in AE
        this.elements.openInAE.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.type === 'file') {
                this.openInAfterEffects(this.selectedItem);
            }
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

        const icon = document.createElement('div');
        icon.className = 'item-icon';
        icon.textContent = '📁';

        const name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = folderItem.name;

        const info = document.createElement('div');
        info.className = 'item-info';
        info.textContent = `${folderItem.files?.length || 0} items`;

        div.appendChild(icon);
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
        name.textContent = fileItem.name;

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

        // Enable action buttons
        this.elements.applyToComp.disabled = false;
        this.elements.openInAE.disabled = false;
        this.elements.currentFileName.textContent = fileItem.fileName;
    },

    /**
     * Show preview for file
     */
    showPreview: function(fileItem) {
        const videoPlayer = this.elements.videoPlayer;
        const imagePreview = this.elements.imagePreview;
        const placeholder = this.elements.videoPlaceholder;

        // Hide all preview elements
        videoPlayer.classList.add('hidden');
        imagePreview.classList.add('hidden');
        placeholder.classList.add('hidden');

        const ext = fileItem.fileType?.toLowerCase();

        // Show appropriate preview
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            // Image preview
            imagePreview.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            imagePreview.classList.remove('hidden');
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
            // Video preview
            videoPlayer.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            videoPlayer.classList.remove('hidden');
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
        this.elements.videoPlaceholder.classList.remove('hidden');

        this.elements.videoPlayer.src = '';
        this.elements.imagePreview.src = '';
        this.elements.currentFileName.textContent = 'No file selected';

        this.elements.applyToComp.disabled = true;
        this.elements.openInAE.disabled = true;

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
            // Open project file
            this.showNotification('Opening project in After Effects...');
            window.AEInterface.openProject(fileItem.filePath);
        } else {
            this.showNotification('File type not supported for opening in AE');
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
