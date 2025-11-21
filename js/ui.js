/**
 * UI Manager for File Browser
 * Handles all UI rendering and user interactions
 */

const UIManager = {
    elements: {},
    currentItems: [],
    selectedItem: null,
    audioContext: null,
    audioAnalyser: null,
    audioSource: null,
    animationId: null,

    /**
     * Decode file name from URL encoding
     */
    decodeFileName: function(name) {
        if (!name) return name;
        try {
            // First, try to decode URI component
            return decodeURIComponent(name);
        } catch (e) {
            // If that fails, try to manually replace common encodings
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
     * Initialize UI elements
     */
    init: function() {
        // Cache DOM elements
        this.elements = {
            // Video preview
            videoPlaceholder: document.getElementById('videoPlaceholder'),
            videoPlayerContainer: document.getElementById('videoPlayerContainer'),
            videoPlayer: document.getElementById('videoPlayer'),
            imagePreview: document.getElementById('imagePreview'),
            youtubePreview: document.getElementById('youtubePreview'),
            audioPlayerContainer: document.getElementById('audioPlayerContainer'),
            audioPlayer: document.getElementById('audioPlayer'),
            audioWaveform: document.getElementById('audioWaveform'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            progressBar: document.getElementById('progressBar'),
            progressFill: document.getElementById('progressFill'),
            progressHandle: document.getElementById('progressHandle'),
            muteBtn: document.getElementById('muteBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeValue: document.getElementById('volumeValue'),
            currentFileName: document.getElementById('currentFileName'),

            // Navigation
            backBtn: document.getElementById('backBtn'),
            breadcrumbPath: document.getElementById('breadcrumbPath'),
            refreshBtn: document.getElementById('refreshBtn'),
            searchBtn: document.getElementById('searchBtn'),
            searchInput: document.getElementById('searchInput'),

            // Sidebar
            folderTree: document.getElementById('folderTree'),
            favoritesMenuItem: document.getElementById('favoritesMenuItem'),
            sidebarSearchBtn: document.getElementById('sidebarSearchBtn'),
            sidebarSearchInput: document.getElementById('sidebarSearchInput'),

            // Content
            folderGrid: document.getElementById('folderGrid'),

            // Toast
            toast: document.getElementById('notificationToast')
        };

        // Initialize FavoritesManager
        if (typeof FavoritesManager !== 'undefined') {
            FavoritesManager.init();
        }

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

        // Search button
        this.elements.searchBtn.addEventListener('click', () => {
            this.toggleSearch();
        });

        // Search input
        this.elements.searchInput.addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
        });

        // Close search on Escape
        this.elements.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleSearch();
            }
        });

        // Favorites menu item
        if (this.elements.favoritesMenuItem) {
            this.elements.favoritesMenuItem.addEventListener('click', () => {
                this.showFavorites();
            });
        }

        // Sidebar search button
        if (this.elements.sidebarSearchBtn) {
            this.elements.sidebarSearchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSidebarSearch();
            });
        }

        // Sidebar search input
        if (this.elements.sidebarSearchInput) {
            this.elements.sidebarSearchInput.addEventListener('input', (e) => {
                this.filterFolderTree(e.target.value);
            });

            this.elements.sidebarSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSidebarSearch();
                }
            });
        }

        // Close sidebar search when clicking outside
        document.addEventListener('click', (e) => {
            if (this.elements.sidebarSearchInput &&
                this.elements.sidebarSearchInput.classList.contains('active')) {
                if (!e.target.closest('.sidebar-header')) {
                    this.closeSidebarSearch();
                }
            }
        });

        // Setup global drag-and-drop handler
        this.setupDragAndDrop();
    },

    /**
     * Setup drag-and-drop handler for compositions
     */
    setupDragAndDrop: function() {
        // Prevent default drag behavior on document
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                const data = e.dataTransfer.getData('application/json');
                if (!data) return;

                const dragData = JSON.parse(data);

                if (dragData.type === 'aep-composition') {
                    // Import composition to timeline
                    this.importCompositionToTimeline({
                        aepPath: dragData.aepPath,
                        compositionName: dragData.compositionName,
                        fileName: dragData.fileName
                    });
                }
            } catch (err) {
                console.error('Drag-and-drop error:', err);
            }
        });
    },

    /**
     * Setup audio player
     */
    setupAudioPlayer: function() {
        const audioPlayer = this.elements.audioPlayer;
        const playPauseBtn = this.elements.playPauseBtn;
        const muteBtn = this.elements.muteBtn;
        const volumeSlider = this.elements.volumeSlider;
        const volumeValue = this.elements.volumeValue;
        const progressBar = this.elements.progressBar;

        // Set initial volume to 50%
        audioPlayer.volume = 0.5;

        // Play/Pause button
        playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });

        // Mute button
        muteBtn.addEventListener('click', () => {
            this.toggleMute();
        });

        // Volume slider event
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audioPlayer.volume = volume;
            volumeValue.textContent = e.target.value + '%';
            this.updateVolumeIcon(volume);
        });

        // Progress bar click
        progressBar.addEventListener('click', (e) => {
            this.seekAudio(e);
        });

        // Progress bar drag
        let isDragging = false;
        progressBar.addEventListener('mousedown', () => {
            isDragging = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                this.seekAudio(e);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Audio time update
        audioPlayer.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        // Audio metadata loaded
        audioPlayer.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });

        // Audio ended
        audioPlayer.addEventListener('ended', () => {
            this.updatePlayPauseButton(false);
        });

        // Initialize audio visualization when playing
        audioPlayer.addEventListener('play', () => {
            this.updatePlayPauseButton(true);
            this.initAudioVisualization();
        });

        // Stop visualization when paused
        audioPlayer.addEventListener('pause', () => {
            this.updatePlayPauseButton(false);
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        });
    },

    /**
     * Toggle play/pause
     */
    togglePlayPause: function() {
        const audioPlayer = this.elements.audioPlayer;
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    },

    /**
     * Update play/pause button
     */
    updatePlayPauseButton: function(isPlaying) {
        const playPauseBtn = this.elements.playPauseBtn;
        playPauseBtn.innerHTML = isPlaying
            ? '<span class="pause-icon">⏸</span>'
            : '<span class="play-icon">▶</span>';
    },

    /**
     * Toggle mute
     */
    toggleMute: function() {
        const audioPlayer = this.elements.audioPlayer;
        audioPlayer.muted = !audioPlayer.muted;
        this.updateVolumeIcon(audioPlayer.muted ? 0 : audioPlayer.volume);
    },

    /**
     * Update volume icon
     */
    updateVolumeIcon: function(volume) {
        const muteBtn = this.elements.muteBtn;
        const icon = muteBtn.querySelector('.volume-icon');

        if (volume === 0) {
            icon.textContent = '🔇';
        } else if (volume < 0.5) {
            icon.textContent = '🔉';
        } else {
            icon.textContent = '🔊';
        }
    },

    /**
     * Seek audio
     */
    seekAudio: function(e) {
        const progressBar = this.elements.progressBar;
        const audioPlayer = this.elements.audioPlayer;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    },

    /**
     * Update progress bar
     */
    updateProgress: function() {
        const audioPlayer = this.elements.audioPlayer;
        const progressFill = this.elements.progressFill;
        const progressHandle = this.elements.progressHandle;
        const currentTime = this.elements.currentTime;

        if (audioPlayer.duration) {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressFill.style.width = percent + '%';
            progressHandle.style.left = percent + '%';
            currentTime.textContent = this.formatTime(audioPlayer.currentTime);
        }
    },

    /**
     * Update duration display
     */
    updateDuration: function() {
        const audioPlayer = this.elements.audioPlayer;
        const duration = this.elements.duration;
        duration.textContent = this.formatTime(audioPlayer.duration);
    },

    /**
     * Format time in mm:ss
     */
    formatTime: function(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    },

    /**
     * Initialize audio visualization
     */
    initAudioVisualization: function() {
        const audioPlayer = this.elements.audioPlayer;
        const canvas = this.elements.audioWaveform;

        if (!canvas) return;

        // Create audio context if not exists
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioAnalyser = this.audioContext.createAnalyser();
            this.audioAnalyser.fftSize = 256;

            // Create source from audio element
            if (!this.audioSource) {
                this.audioSource = this.audioContext.createMediaElementSource(audioPlayer);
                this.audioSource.connect(this.audioAnalyser);
                this.audioAnalyser.connect(this.audioContext.destination);
            }
        }

        this.drawWaveform();
    },

    /**
     * Draw audio waveform
     */
    drawWaveform: function() {
        const canvas = this.elements.audioWaveform;
        if (!canvas || !this.audioAnalyser) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth;
        const height = canvas.height = canvas.offsetHeight;

        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.animationId = requestAnimationFrame(draw);

            this.audioAnalyser.getByteFrequencyData(dataArray);

            // Clear canvas with gradient background
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * height * 0.8;

                // Create gradient for bars
                const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                barGradient.addColorStop(0, '#667eea');
                barGradient.addColorStop(0.5, '#764ba2');
                barGradient.addColorStop(1, '#f093fb');

                ctx.fillStyle = barGradient;
                ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

                x += barWidth;
            }
        };

        draw();
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
            // Store all items for global search
            FileBrowser.allItems = result.items || [];
            this.showNotification(`Loaded ${result.fileCount} files from ${result.folderCount} folders`);

            // Render folder tree in sidebar
            this.renderFolderTree(result.items || []);

            // Don't render content grid initially - show placeholder message instead
            // Files will be shown when a folder is clicked in the tree
            this.updateBreadcrumbs();
            // Show static preview for Projects folder
            this.showProjectsPreview();
        });
    },

    /**
     * Render folder tree in sidebar
     */
    renderFolderTree: function(items) {
        const tree = this.elements.folderTree;
        if (!tree) return;

        tree.innerHTML = '';

        // Get only folders
        const folders = items.filter(item => item.type === 'folder');

        if (folders.length === 0) {
            tree.innerHTML = '<div class="empty-state-text" style="padding: 12px; text-align: center; color: var(--text-secondary);">No folders</div>';
            return;
        }

        folders.forEach(folder => {
            const treeItem = this.createFolderTreeItem(folder);
            tree.appendChild(treeItem);
        });
    },

    /**
     * Create folder tree item
     */
    createFolderTreeItem: function(folder) {
        const container = document.createElement('div');
        container.className = 'folder-tree-item';
        container.dataset.folderName = folder.name;
        container.dataset.folderPath = folder.path || folder.name;

        const header = document.createElement('div');
        header.className = 'folder-tree-header';

        // Check if folder has files or subfolders
        const subfolders = folder.files ? folder.files.filter(f => f.type === 'folder') : [];
        const hasSubfolders = subfolders.length > 0;
        const hasFiles = folder.files && folder.files.length > 0;

        if (hasSubfolders) {
            const expandIcon = document.createElement('span');
            expandIcon.className = 'folder-expand-icon';
            expandIcon.textContent = '▶';
            header.appendChild(expandIcon);
        } else {
            // Add spacer if no subfolders
            const spacer = document.createElement('span');
            spacer.style.width = '16px';
            header.appendChild(spacer);
        }

        const icon = document.createElement('span');
        icon.className = 'folder-tree-icon';
        icon.textContent = '📁';
        header.appendChild(icon);

        const name = document.createElement('span');
        name.className = 'folder-tree-name';
        name.textContent = this.decodeFileName(folder.name);
        name.title = this.decodeFileName(folder.name);
        header.appendChild(name);

        container.appendChild(header);

        // Store folder reference for later use
        container.folderData = folder;

        // Add click handler to open folder
        header.addEventListener('click', (e) => {
            e.stopPropagation();

            // Close all other folders at the same level
            this.closeOtherFolders(container);

            if (hasSubfolders) {
                // Toggle expand/collapse of submenu
                const isExpanded = header.classList.contains('expanded');
                header.classList.toggle('expanded');

                const children = container.querySelector('.folder-tree-children');
                if (children) {
                    children.classList.toggle('expanded');
                }
            }

            // Highlight this folder as active
            this.highlightActiveFolder(container);

            // Open folder in main view
            this.openFolder(folder);
        });

        // Create children container if folder has subfolders
        if (hasSubfolders) {
            const children = document.createElement('div');
            children.className = 'folder-tree-children';

            // Add subfolders to submenu
            subfolders.forEach(subfolder => {
                const subItem = this.createFolderTreeItem(subfolder);
                children.appendChild(subItem);
            });

            container.appendChild(children);
        }

        return container;
    },

    /**
     * Close all other folders except the current one
     */
    closeOtherFolders: function(currentContainer) {
        // Get parent container
        const parent = currentContainer.parentElement;
        if (!parent) return;

        // Close all siblings
        const siblings = parent.querySelectorAll(':scope > .folder-tree-item');
        siblings.forEach(sibling => {
            if (sibling !== currentContainer) {
                const header = sibling.querySelector('.folder-tree-header');
                const children = sibling.querySelector('.folder-tree-children');

                if (header && header.classList.contains('expanded')) {
                    header.classList.remove('expanded');
                }
                if (children && children.classList.contains('expanded')) {
                    children.classList.remove('expanded');
                }
            }
        });
    },

    /**
     * Highlight active folder in the tree
     */
    highlightActiveFolder: function(container) {
        // Remove active class from all folders
        const allHeaders = document.querySelectorAll('.folder-tree-header');
        allHeaders.forEach(header => {
            header.classList.remove('active');
        });

        // Add active class to current folder
        const header = container.querySelector('.folder-tree-header');
        if (header) {
            header.classList.add('active');
        }
    },

    /**
     * Show favorites view
     */
    showFavorites: function() {
        if (typeof FavoritesManager === 'undefined') {
            this.showNotification('Favorites not available');
            return;
        }

        const favorites = FavoritesManager.getFavoriteItems();

        if (favorites.length === 0) {
            this.currentItems = [];
            this.renderFolderGrid();
            this.showNotification('No favorites yet. Click ⭐ on items to add them to favorites!');
            return;
        }

        this.currentItems = favorites;
        this.renderFolderGrid();
        this.clearPreview();

        // Update breadcrumbs to show Favorites
        const pathElement = this.elements.breadcrumbPath;
        pathElement.innerHTML = '<span class="breadcrumb-item active">⭐ Favorites</span>';

        // Disable back button
        this.elements.backBtn.disabled = true;

        this.showNotification(`Showing ${favorites.length} favorite ${favorites.length === 1 ? 'item' : 'items'}`);
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

        // Render all items (folders and files, including .aep files)
        this.currentItems.forEach(item => {
            const element = item.type === 'folder'
                ? this.createFolderElement(item)
                : this.createFileElement(item);
            grid.appendChild(element);
        });
    },

    /**
     * Render compositions from .aep file inline (without showing the .aep file itself)
     */
    renderAepCompositions: function(aepFileItem, grid) {
        // Get contents of .aep file
        window.AEInterface.getAepContents(aepFileItem.filePath, (result) => {
            try {
                const contents = JSON.parse(result);

                if (contents.error) {
                    console.error('Error loading .aep contents:', contents.error);
                    return;
                }

                // Create composition items
                if (contents.compositions && contents.compositions.length > 0) {
                    contents.compositions.forEach(comp => {
                        const compositionItem = {
                            type: 'aep-composition',
                            name: comp.name,
                            fileName: comp.name,
                            fileType: 'composition',
                            aepPath: aepFileItem.filePath,
                            compositionName: comp.name,
                            previewPath: aepFileItem.videoPreviewPath, // Use .aep preview if available
                            info: {
                                width: comp.width,
                                height: comp.height,
                                duration: comp.duration,
                                frameRate: comp.frameRate,
                                numLayers: comp.numLayers
                            }
                        };

                        const element = this.createFileElement(compositionItem);
                        grid.appendChild(element);
                    });
                }
            } catch (e) {
                console.error('Error parsing .aep contents:', e);
            }
        });
    },

    /**
     * Create folder element
     */
    createFolderElement: function(folderItem, isSearchResult = false) {
        const div = document.createElement('div');
        div.className = 'folder-item';
        div.title = `Open ${folderItem.name}`;

        // Check if favorited
        if (typeof FavoritesManager !== 'undefined' && FavoritesManager.isFavorited(folderItem)) {
            div.classList.add('favorited');
        }

        // Add favorite button
        const favoriteBtn = this.createFavoriteButton(folderItem, div);
        div.appendChild(favoriteBtn);

        // Check if there's a .png preview for this folder
        if (folderItem.folderPreviewPath) {
            const preview = document.createElement('img');
            preview.className = 'folder-preview';
            preview.src = 'file:///' + folderItem.folderPreviewPath.replace(/\\/g, '/');
            preview.alt = folderItem.name;
            div.appendChild(preview);
        }

        const name = document.createElement('div');
        name.className = 'item-name';
        // Decode URL encoding (e.g., %20 for spaces)
        name.textContent = this.decodeFileName(folderItem.name);

        const info = document.createElement('div');
        info.className = 'item-info';
        const fileCount = folderItem.files?.length || 0;
        info.textContent = `${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;

        div.appendChild(name);
        div.appendChild(info);

        div.addEventListener('click', (e) => {
            // Don't open folder if clicking favorite button
            if (e.target.closest('.favorite-btn')) return;
            this.openFolder(folderItem);
        });

        div.addEventListener('dblclick', (e) => {
            // Don't open folder if clicking favorite button
            if (e.target.closest('.favorite-btn')) return;
            this.openFolder(folderItem);
        });

        return div;
    },

    /**
     * Create file element
     */
    createFileElement: function(fileItem, isSearchResult = false) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.title = fileItem.fileName;

        // Check if favorited
        if (typeof FavoritesManager !== 'undefined' && FavoritesManager.isFavorited(fileItem)) {
            div.classList.add('favorited');
        }

        // Add favorite button
        const favoriteBtn = this.createFavoriteButton(fileItem, div);
        div.appendChild(favoriteBtn);

        // Make compositions draggable
        if (fileItem.type === 'aep-composition') {
            div.draggable = true;
            div.setAttribute('data-draggable', 'true');

            // Store composition data in element
            div.compositionData = {
                aepPath: fileItem.aepPath,
                compositionName: fileItem.compositionName,
                fileName: fileItem.fileName
            };

            // Add drag event listeners
            div.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'aep-composition',
                    aepPath: fileItem.aepPath,
                    compositionName: fileItem.compositionName,
                    fileName: fileItem.fileName
                }));
                div.classList.add('dragging');
                this.showNotification('🎬 Drag to After Effects timeline to add composition');
            });

            div.addEventListener('dragend', (e) => {
                div.classList.remove('dragging');
            });
        }

        // Check if item has preview thumbnail
        const hasPreview = fileItem.previewPath || fileItem.videoPreviewPath;

        // For items with preview, show thumbnail instead of icon
        if (hasPreview) {
            const preview = document.createElement('img');
            preview.className = 'item-preview-thumb';
            const previewPath = fileItem.previewPath || fileItem.videoPreviewPath;
            preview.src = 'file:///' + previewPath.replace(/\\/g, '/');
            preview.alt = fileItem.name;
            div.appendChild(preview);
        } else {
            const icon = document.createElement('div');
            icon.className = 'item-icon';
            icon.textContent = FileBrowser.getFileIcon(fileItem.fileType);
            div.appendChild(icon);
        }

        const name = document.createElement('div');
        name.className = 'item-name';
        // Decode URL encoding (e.g., %20 for spaces)
        name.textContent = this.decodeFileName(fileItem.name);

        const info = document.createElement('div');
        info.className = 'item-info';

        // Show appropriate info based on file type
        if (fileItem.type === 'aep-composition' && fileItem.info) {
            info.textContent = `${fileItem.info.width}x${fileItem.info.height} • ${fileItem.info.duration}s`;
        } else if (fileItem.type === 'aep-footage' && fileItem.info) {
            info.textContent = `${fileItem.info.width}x${fileItem.info.height}`;
        } else {
            info.textContent = FileBrowser.formatFileSize(fileItem.fileSize);
        }

        div.appendChild(name);
        div.appendChild(info);

        div.addEventListener('click', (e) => {
            // Don't open file if clicking favorite button
            if (e.target.closest('.favorite-btn')) return;

            // For all files including .aep, just select them for preview
            this.selectFile(fileItem, div);
        });

        div.addEventListener('dblclick', (e) => {
            // Don't open file if clicking favorite button
            if (e.target.closest('.favorite-btn')) return;

            // For .aep and .pack files, import to timeline (openAEProject behavior)
            if (['aep', 'pack'].includes(fileItem.fileType?.toLowerCase())) {
                this.importAepToTimeline(fileItem);
            } else if (fileItem.type === 'aep-composition') {
                // For compositions inside .aep files, import to timeline
                this.importCompositionToTimeline(fileItem);
            } else if (fileItem.fileType?.toLowerCase() === 'jsx') {
                // For .jsx files, execute and add to timeline (like .aep)
                this.executeJsxToTimeline(fileItem);
            } else {
                // For other files, use normal handling
                this.openInAfterEffects(fileItem);
            }
        });

        return div;
    },

    /**
     * Create favorite button for item
     */
    createFavoriteButton: function(item, container) {
        const btn = document.createElement('div');
        btn.className = 'favorite-btn';
        btn.title = 'Add to favorites';

        const icon = document.createElement('span');
        icon.className = 'star-icon';

        // Check if item is favorited
        if (typeof FavoritesManager !== 'undefined') {
            const isFavorited = FavoritesManager.isFavorited(item);
            icon.textContent = isFavorited ? '★' : '☆';
            if (isFavorited) {
                btn.classList.add('favorited');
                btn.title = 'Remove from favorites';
            }
        } else {
            icon.textContent = '☆';
        }

        btn.appendChild(icon);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            if (typeof FavoritesManager === 'undefined') {
                this.showNotification('Favorites not available');
                return;
            }

            const isFavorited = FavoritesManager.toggleFavorite(item);

            // Update button state
            if (isFavorited) {
                icon.textContent = '★';
                btn.classList.add('favorited');
                btn.title = 'Remove from favorites';
                container.classList.add('favorited');
                this.showNotification('⭐ Added to favorites');
            } else {
                icon.textContent = '☆';
                btn.classList.remove('favorited');
                btn.title = 'Add to favorites';
                container.classList.remove('favorited');
                this.showNotification('Removed from favorites');
            }
        });

        return btn;
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
     * Open .aep file as a folder
     */
    openAepAsFolder: function(fileItem) {
        FileBrowser.openAepFile(fileItem, (result) => {
            if (result.error) {
                this.showNotification('✗ Error: ' + result.error);
                return;
            }

            this.currentItems = result.items;
            this.renderFolderGrid();
            this.updateBreadcrumbs();
            this.clearPreview();
        });
    },

    /**
     * Import .aep project file to timeline (opens and imports first composition)
     */
    importAepToTimeline: function(fileItem) {
        if (!fileItem.filePath) {
            this.showNotification('✗ Invalid file path');
            return;
        }

        this.showNotification('Importing project to timeline...');

        // Use openAEProject which imports the first composition to timeline
        window.AEInterface.openProject(fileItem.filePath, (result) => {
            if (result === 'true') {
                this.showNotification('✓ Project imported to timeline!');
            } else if (result.includes('Error')) {
                this.showNotification('✗ ' + result);
            } else {
                this.showNotification('✓ ' + result);
            }
        });
    },

    /**
     * Import composition from .aep file to timeline
     */
    importCompositionToTimeline: function(compositionItem) {
        if (!compositionItem.aepPath || !compositionItem.compositionName) {
            this.showNotification('✗ Invalid composition item');
            return;
        }

        this.showNotification('Importing ' + compositionItem.compositionName + ' to timeline...');

        window.AEInterface.importAepCompositionToTimeline(
            compositionItem.aepPath,
            compositionItem.compositionName,
            (result) => {
                if (result === 'true') {
                    this.showNotification('✓ Composition added to timeline!');
                } else if (result.includes('Error')) {
                    this.showNotification('✗ ' + result);
                } else {
                    this.showNotification('✓ ' + result);
                }
            }
        );
    },

    /**
     * Import .jsx file to After Effects project
     */
    importJsxToProject: function(fileItem) {
        if (!fileItem.filePath) {
            this.showNotification('✗ Invalid file path');
            return;
        }

        if (!window.AEInterface) {
            this.showNotification('After Effects integration not available');
            return;
        }

        this.showNotification('Importing JSX file to project...');
        window.AEInterface.importFile(fileItem.filePath, (result) => {
            if (result === 'true' || result.includes('imported')) {
                this.showNotification('✓ JSX file imported to project!');
            } else if (result.includes('Error') || result.includes('error')) {
                this.showNotification('✗ ' + result);
            } else {
                this.showNotification('✓ ' + result);
            }
        });
    },

    /**
     * Execute .jsx file and add created items to timeline (like .aep behavior)
     */
    executeJsxToTimeline: function(fileItem) {
        if (!fileItem.filePath) {
            this.showNotification('✗ Invalid file path');
            return;
        }

        if (!window.AEInterface) {
            this.showNotification('After Effects integration not available');
            return;
        }

        this.showNotification('Executing JSX script and adding to timeline...');
        window.AEInterface.executeJSX(fileItem.filePath, (result) => {
            if (result === 'true' || (!result.includes('Error') && !result.includes('error'))) {
                this.showNotification('✓ JSX executed and added to timeline!');
            } else if (result.includes('Error') || result.includes('error')) {
                this.showNotification('✗ ' + result);
            } else {
                this.showNotification('✓ ' + result);
            }
        });
    },

    /**
     * Navigate back
     */
    navigateBack: function() {
        const result = FileBrowser.navigateBack();

        if (result) {
            if (result.reload) {
                // Need to reload from root and navigate to path
                FileBrowser.loadProjectsFolder((loadResult) => {
                    if (loadResult.error) {
                        this.showNotification('Error: ' + loadResult.error);
                        return;
                    }

                    FileBrowser.allItems = loadResult.items || [];

                    // Restore path by navigating to each folder
                    if (result.restorePath && result.restorePath.length > 0) {
                        let currentItems = loadResult.items;

                        for (let i = 0; i < result.restorePath.length; i++) {
                            const pathPart = result.restorePath[i];
                            const folderName = typeof pathPart === 'string' ? pathPart : pathPart.name;

                            // Find folder in current items
                            const folder = currentItems.find(item => item.type === 'folder' && item.name === folderName);

                            if (folder) {
                                currentItems = folder.files || [];
                            } else {
                                // Folder not found, break
                                break;
                            }
                        }

                        this.currentItems = currentItems;
                    } else {
                        // At root
                        this.currentItems = loadResult.items;
                    }

                    this.renderFolderGrid();
                    this.updateBreadcrumbs();
                    this.clearPreview();
                });
            } else {
                this.currentItems = result.items;
                this.renderFolderGrid();
                this.updateBreadcrumbs();
                this.clearPreview();
            }
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

        // Reload from root and navigate to specified path
        FileBrowser.loadProjectsFolder((loadResult) => {
            if (loadResult.error) {
                this.showNotification('Error: ' + loadResult.error);
                return;
            }

            FileBrowser.allItems = loadResult.items || [];

            // Navigate to the specified path
            if (pathArray && pathArray.length > 0) {
                let currentItems = loadResult.items;

                for (let i = 0; i < pathArray.length; i++) {
                    const pathPart = pathArray[i];
                    const folderName = typeof pathPart === 'string' ? pathPart : pathPart.name;

                    // Find folder in current items
                    const folder = currentItems.find(item => item.type === 'folder' && item.name === folderName);

                    if (folder) {
                        currentItems = folder.files || [];
                    } else {
                        // Folder not found, break
                        break;
                    }
                }

                this.currentItems = currentItems;
            } else {
                // At root
                this.currentItems = loadResult.items;
            }

            this.renderFolderGrid();
            this.updateBreadcrumbs();
            this.clearPreview();
        });
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
        this.elements.currentFileName.textContent = this.decodeFileName(fileItem.fileName);
    },

    /**
     * Show preview for file
     */
    showPreview: function(fileItem) {
        const videoPlayerContainer = this.elements.videoPlayerContainer;
        const videoPlayer = this.elements.videoPlayer;
        const imagePreview = this.elements.imagePreview;
        const youtubePreview = this.elements.youtubePreview;
        const audioPlayerContainer = this.elements.audioPlayerContainer;
        const audioPlayer = this.elements.audioPlayer;
        const placeholder = this.elements.videoPlaceholder;

        // Hide all preview elements
        videoPlayerContainer.classList.add('hidden');
        imagePreview.classList.add('hidden');
        youtubePreview.classList.add('hidden');
        audioPlayerContainer.classList.add('hidden');
        placeholder.classList.add('hidden');

        const ext = fileItem.fileType?.toLowerCase();

        // Check for video/gif preview for .aep, .jsx, and .prst files
        if (['aep', 'pack', 'jsx', 'prst'].includes(ext)) {
            // First check if there's a video preview path
            if (fileItem.videoPreviewPath) {
                // Determine if it's a .gif, .png or video file
                const previewExt = fileItem.videoPreviewPath.split('.').pop().toLowerCase();

                if (previewExt === 'gif') {
                    // Show .gif as image preview with autoplay
                    imagePreview.src = 'file:///' + fileItem.videoPreviewPath.replace(/\\/g, '/');
                    imagePreview.classList.remove('hidden');
                } else if (previewExt === 'png') {
                    // Show .png as image preview
                    imagePreview.src = 'file:///' + fileItem.videoPreviewPath.replace(/\\/g, '/');
                    imagePreview.classList.remove('hidden');
                } else if (['mp4', 'mov', 'webm'].includes(previewExt)) {
                    // Show video preview (.mp4, etc.) with loop and autoplay
                    videoPlayer.src = 'file:///' + fileItem.videoPreviewPath.replace(/\\/g, '/');
                    videoPlayer.loop = true;
                    videoPlayer.muted = true;
                    videoPlayerContainer.classList.remove('hidden');
                    videoPlayer.play().catch(err => {
                        console.log('Auto-play prevented:', err);
                    });
                }
                return;
            }

            // If no video preview, show placeholder with icon
            placeholder.classList.remove('hidden');
            const iconElem = placeholder.querySelector('.placeholder-icon');
            const textElem = placeholder.querySelector('.placeholder-text');
            iconElem.textContent = FileBrowser.getFileIcon(ext);
            textElem.textContent = this.decodeFileName(fileItem.fileName);
            return;
        }

        // Check for YouTube preview in info.json for any file type
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

        // For AEP and PACK files without videoPreview, check for thumbnail or show placeholder
        if (['aep', 'pack'].includes(ext)) {
            // If there's no video preview, show placeholder
            placeholder.classList.remove('hidden');
            const iconElem = placeholder.querySelector('.placeholder-icon');
            const textElem = placeholder.querySelector('.placeholder-text');
            iconElem.textContent = FileBrowser.getFileIcon(ext);
            textElem.textContent = this.decodeFileName(fileItem.fileName);
            return;
        }

        // Show appropriate preview based on file type
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            // Image preview
            imagePreview.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            imagePreview.classList.remove('hidden');
        } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) {
            // Video preview with autoplay
            videoPlayer.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            videoPlayerContainer.classList.remove('hidden');
            videoPlayer.play().catch(err => {
                console.log('Auto-play prevented:', err);
            });
        } else if (['mp3', 'wav'].includes(ext)) {
            // Audio preview
            audioPlayer.src = 'file:///' + fileItem.filePath.replace(/\\/g, '/');
            audioPlayerContainer.classList.remove('hidden');

            // Auto-play audio when loaded
            audioPlayer.addEventListener('loadeddata', () => {
                audioPlayer.play().catch(err => {
                    console.log('Auto-play prevented:', err);
                });
            }, { once: true });
        } else {
            // Show placeholder for non-previewable files
            placeholder.classList.remove('hidden');
            const iconElem = placeholder.querySelector('.placeholder-icon');
            const textElem = placeholder.querySelector('.placeholder-text');

            iconElem.textContent = FileBrowser.getFileIcon(ext);
            textElem.textContent = this.decodeFileName(fileItem.fileName);
        }
    },

    /**
     * Clear preview
     */
    clearPreview: function() {
        this.elements.videoPlayerContainer.classList.add('hidden');
        this.elements.imagePreview.classList.add('hidden');
        this.elements.youtubePreview.classList.add('hidden');
        this.elements.audioPlayerContainer.classList.add('hidden');
        this.elements.videoPlaceholder.classList.remove('hidden');

        this.elements.videoPlayer.pause();
        this.elements.videoPlayer.src = '';
        this.elements.imagePreview.src = '';
        this.elements.youtubePreview.src = '';
        this.elements.audioPlayer.src = '';
        this.elements.currentFileName.textContent = 'No file selected';

        this.selectedItem = null;

        // Show static preview if in Projects folder
        if (FileBrowser.currentPath.length === 0) {
            this.showProjectsPreview();
        }
    },

    /**
     * Show static preview for Projects folder
     */
    showProjectsPreview: function() {
        // Only show if in root Projects folder (no subfolders)
        if (FileBrowser.currentPath.length !== 0) {
            return;
        }

        // Hide all other preview elements
        this.elements.videoPlayerContainer.classList.add('hidden');
        this.elements.youtubePreview.classList.add('hidden');
        this.elements.audioPlayerContainer.classList.add('hidden');
        this.elements.videoPlaceholder.classList.add('hidden');

        // Show static image for Projects folder
        this.elements.imagePreview.src = 'img/PreviewProjects.jpg';
        this.elements.imagePreview.classList.remove('hidden');
        this.elements.currentFileName.textContent = 'Projects';
    },

    /**
     * Show placeholder when folder is collapsed
     */
    showFolderCollapsedPlaceholder: function() {
        // Hide all other preview elements
        this.elements.videoPlayerContainer.classList.add('hidden');
        this.elements.youtubePreview.classList.add('hidden');
        this.elements.audioPlayerContainer.classList.add('hidden');
        this.elements.videoPlaceholder.classList.add('hidden');

        // Show static image for collapsed folder
        this.elements.imagePreview.src = 'img/PreviewProjects.jpg';
        this.elements.imagePreview.classList.remove('hidden');
        this.elements.currentFileName.textContent = 'Чтобы просмотреть файлы, откройте папку слева';

        // Clear the content grid and show placeholder
        const grid = this.elements.folderGrid;
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📁</div>
                <div class="empty-state-text">Чтобы просмотреть файлы, откройте папку слева</div>
            </div>
        `;
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
        } else if (ext === 'prst' || ext === 'ffx') {
            // Apply animation preset to selected layer
            this.showNotification('Applying preset to selected layer...');
            window.AEInterface.applyPreset(fileItem.filePath, (result) => {
                if (result === 'true') {
                    this.showNotification('✓ Preset applied successfully!');
                } else if (result.includes('Error')) {
                    this.showNotification('✗ ' + result);
                } else {
                    this.showNotification('Applied: ' + result);
                }
            });
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
    },

    /**
     * Toggle search input visibility
     */
    toggleSearch: function() {
        const searchInput = this.elements.searchInput;
        const searchBtn = this.elements.searchBtn;

        if (searchInput.classList.contains('active')) {
            // Hide search
            searchInput.classList.remove('active');
            searchBtn.classList.remove('active');
            searchInput.value = '';
            // Show all items
            this.filterFiles('');
        } else {
            // Show search
            searchInput.classList.add('active');
            searchBtn.classList.add('active');
            // Focus on input after animation
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        }
    },

    /**
     * Filter files by search query (global search across all folders)
     */
    filterFiles: function(query) {
        const grid = this.elements.folderGrid;

        if (!query || query.trim() === '') {
            // Show current folder items
            this.renderFolderGrid();
            return;
        }

        // Perform global search
        const searchResults = FileBrowser.searchGlobal(query);

        // Clear grid
        grid.innerHTML = '';

        if (searchResults.length === 0) {
            // Show "no results" message
            const message = document.createElement('div');
            message.className = 'empty-state search-no-results';
            message.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <div class="empty-state-text">No files found matching "${query}"</div>
            `;
            grid.appendChild(message);
            return;
        }

        // Render search results
        searchResults.forEach(item => {
            const element = item.type === 'folder'
                ? this.createFolderElement(item, true)
                : this.createFileElement(item, true);

            // Add search path info
            if (item.searchPath) {
                const pathInfo = document.createElement('div');
                pathInfo.className = 'search-path-info';
                pathInfo.textContent = item.searchPath;
                pathInfo.style.fontSize = '11px';
                pathInfo.style.color = '#888';
                pathInfo.style.marginTop = '4px';
                element.appendChild(pathInfo);
            }

            grid.appendChild(element);
        });
    },

    /**
     * Toggle sidebar search input
     */
    toggleSidebarSearch: function() {
        const input = this.elements.sidebarSearchInput;

        if (input.classList.contains('active')) {
            this.closeSidebarSearch();
        } else {
            input.classList.add('active');
            // Focus on input after animation
            setTimeout(() => {
                input.focus();
            }, 100);
        }
    },

    /**
     * Close sidebar search input
     */
    closeSidebarSearch: function() {
        const input = this.elements.sidebarSearchInput;
        input.classList.remove('active');
        input.value = '';
        // Reset folder tree to show all items
        this.filterFolderTree('');
    },

    /**
     * Filter folder tree by search query
     */
    filterFolderTree: function(query) {
        const folderTree = this.elements.folderTree;
        const items = folderTree.querySelectorAll('.folder-tree-item');

        if (!query || query.trim() === '') {
            // Show all items
            items.forEach(item => {
                item.style.display = '';
            });
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Filter items
        items.forEach(item => {
            const itemName = item.querySelector('.folder-tree-header')?.textContent.toLowerCase() || '';

            if (itemName.includes(lowerQuery)) {
                item.style.display = '';
                // Expand parent if this item matches
                let parent = item.parentElement?.closest('.folder-tree-item');
                while (parent) {
                    parent.style.display = '';
                    const header = parent.querySelector('.folder-tree-header');
                    if (header && !header.classList.contains('expanded')) {
                        header.click();
                    }
                    parent = parent.parentElement?.closest('.folder-tree-item');
                }
            } else {
                item.style.display = 'none';
            }
        });
    }
};
