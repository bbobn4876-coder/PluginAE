/**
 * UI Manager for AEP Preview Plugin
 * Handles all UI rendering and updates
 */

const UIManager = {
    elements: {},
    currentPreview: null,

    /**
     * Initialize UI elements
     */
    init: function() {
        // Cache DOM elements
        this.elements = {
            scanProjectsBtn: document.getElementById('scanProjectsBtn'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            filterBtn: document.getElementById('filterBtn'),
            groupFilter: document.getElementById('groupFilter'),
            groupsList: document.getElementById('groupsList'),
            presetsList: document.getElementById('presetsList'),
            presetCount: document.getElementById('presetCount'),
            addGroupBtn: document.getElementById('addGroupBtn'),
            previewSection: document.getElementById('previewSection'),
            closePreview: document.getElementById('closePreview'),
            groupModal: document.getElementById('groupModal'),
            closeGroupModal: document.getElementById('closeGroupModal'),
            cancelGroupBtn: document.getElementById('cancelGroupBtn'),
            createGroupBtn: document.getElementById('createGroupBtn'),
            groupNameInput: document.getElementById('groupNameInput'),
            groupColorSelect: document.getElementById('groupColorSelect')
        };

        this.setupEventListeners();
        this.render();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: function() {
        // Scan Projects folder
        this.elements.scanProjectsBtn.addEventListener('click', () => {
            this.scanProjectsFolder();
        });

        // Search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        this.elements.searchBtn.addEventListener('click', () => {
            this.handleSearch(this.elements.searchInput.value);
        });

        // Group filter
        this.elements.groupFilter.addEventListener('change', (e) => {
            this.handleGroupFilter(e.target.value);
        });

        // Add group
        this.elements.addGroupBtn.addEventListener('click', () => {
            this.showGroupModal();
        });

        // Close preview
        this.elements.closePreview.addEventListener('click', () => {
            this.hidePreview();
        });

        // Group modal
        this.elements.closeGroupModal.addEventListener('click', () => {
            this.hideGroupModal();
        });

        this.elements.cancelGroupBtn.addEventListener('click', () => {
            this.hideGroupModal();
        });

        this.elements.createGroupBtn.addEventListener('click', () => {
            this.createGroup();
        });

        // Close modal on outside click
        this.elements.groupModal.addEventListener('click', (e) => {
            if (e.target === this.elements.groupModal) {
                this.hideGroupModal();
            }
        });
    },

    /**
     * Scan Projects folder for all files
     */
    scanProjectsFolder: function() {
        if (window.AEInterface && window.AEInterface.scanProjectsFolder) {
            this.showNotification('Scanning Projects folder...');

            window.AEInterface.scanProjectsFolder((result) => {
                try {
                    const filesData = JSON.parse(result);

                    if (filesData.error) {
                        this.showNotification('Error: ' + filesData.error);
                        return;
                    }

                    if (filesData.files && filesData.files.length > 0) {
                        const addedPresets = PresetManager.loadFromProjectsFolder(filesData.files);
                        this.showNotification(`Loaded ${addedPresets.length} file(s) from Projects folder`);
                        this.render();
                    } else {
                        this.showNotification('No files found in Projects folder');
                    }
                } catch (e) {
                    console.error('Error parsing Projects folder data:', e);
                    this.showNotification('Error scanning Projects folder');
                }
            });
        } else {
            this.showNotification('CEP interface not available');
        }
    },

    /**
     * Handle search
     */
    handleSearch: function(query) {
        this.renderPresets();
    },

    /**
     * Handle group filter
     */
    handleGroupFilter: function(groupId) {
        PresetManager.activeFilter = groupId;
        this.renderPresets();
    },

    /**
     * Render everything
     */
    render: function() {
        this.renderGroups();
        this.renderGroupFilter();
        this.renderPresets();
    },

    /**
     * Render groups
     */
    renderGroups: function() {
        const groups = PresetManager.currentGroups;
        const container = this.elements.groupsList;

        container.innerHTML = '';

        // Add "All" group
        const allGroup = this.createGroupElement({
            id: 'all',
            name: 'All',
            color: 'blue'
        });
        container.appendChild(allGroup);

        // Add other groups
        groups.forEach(group => {
            const element = this.createGroupElement(group);
            container.appendChild(element);
        });
    },

    /**
     * Create group element
     */
    createGroupElement: function(group) {
        const div = document.createElement('div');
        div.className = 'group-item';
        if (PresetManager.activeFilter === group.id) {
            div.classList.add('active');
        }

        const colorSpan = document.createElement('span');
        colorSpan.className = `group-color ${group.color}`;

        const nameSpan = document.createElement('span');
        nameSpan.className = 'group-name';
        nameSpan.textContent = group.name;

        div.appendChild(colorSpan);
        div.appendChild(nameSpan);

        div.addEventListener('click', () => {
            PresetManager.activeFilter = group.id;
            this.render();
        });

        return div;
    },

    /**
     * Render group filter dropdown
     */
    renderGroupFilter: function() {
        const select = this.elements.groupFilter;
        select.innerHTML = '<option value="all">All Groups</option>';

        PresetManager.currentGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            select.appendChild(option);
        });

        select.value = PresetManager.activeFilter;
    },

    /**
     * Render presets
     */
    renderPresets: function() {
        const searchQuery = this.elements.searchInput.value;
        const presets = PresetManager.filterPresets(null, searchQuery);
        const container = this.elements.presetsList;

        container.innerHTML = '';

        if (presets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <div class="empty-state-text">No presets found. Upload some AEP files to get started.</div>
                </div>
            `;
            this.elements.presetCount.textContent = '0';
            return;
        }

        this.elements.presetCount.textContent = presets.length;

        presets.forEach(preset => {
            const element = this.createPresetElement(preset);
            container.appendChild(element);
        });
    },

    /**
     * Create preset element
     */
    createPresetElement: function(preset) {
        const div = document.createElement('div');
        div.className = 'preset-item';

        const header = document.createElement('div');
        header.className = 'preset-header';

        const name = document.createElement('div');
        name.className = 'preset-name';
        name.textContent = preset.name;

        const size = document.createElement('div');
        size.className = 'preset-size';
        size.textContent = PresetManager.formatFileSize(preset.fileSize);

        header.appendChild(name);
        header.appendChild(size);

        const tags = document.createElement('div');
        tags.className = 'preset-tags';

        if (preset.tags && preset.tags.length > 0) {
            preset.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tags.appendChild(tagSpan);
            });
        }

        div.appendChild(header);
        div.appendChild(tags);

        div.addEventListener('click', () => {
            this.showPreview(preset);
        });

        return div;
    },

    /**
     * Show preset preview
     */
    showPreview: function(preset) {
        this.currentPreview = preset;
        this.elements.previewSection.classList.remove('hidden');

        // Show preview image for GIF files
        const previewImageContainer = document.getElementById('previewImage');
        const previewImg = document.getElementById('previewImg');

        if (preset.fileType === 'gif' && preset.filePath) {
            previewImageContainer.classList.remove('hidden');
            // For CEP, we need to use file:// protocol or convert to base64
            previewImg.src = 'file:///' + preset.filePath.replace(/\\/g, '/');
        } else {
            previewImageContainer.classList.add('hidden');
            previewImg.src = '';
        }

        document.getElementById('previewFileName').textContent = preset.fileName;
        document.getElementById('previewFileType').textContent = preset.fileType ? preset.fileType.toUpperCase() : 'Unknown';
        document.getElementById('previewFileSize').textContent = PresetManager.formatFileSize(preset.fileSize);
        document.getElementById('previewDate').textContent = PresetManager.formatDate(preset.dateAdded);

        const group = PresetManager.getGroup(preset.group);
        document.getElementById('previewGroup').textContent = group ? group.name : 'Ungrouped';

        // Load project details for .pack/.aep files
        const projectContents = document.getElementById('projectContents');
        if ((preset.fileType === 'pack' || preset.fileType === 'aep') && preset.filePath) {
            this.loadProjectDetails(preset.filePath);
        } else {
            projectContents.classList.add('hidden');
        }

        this.renderPreviewTags(preset);
        this.setupPreviewActions(preset);
    },

    /**
     * Load and display project details
     */
    loadProjectDetails: function(filePath) {
        const projectContents = document.getElementById('projectContents');

        if (!window.AEInterface || !window.AEInterface.getProjectDetails) {
            projectContents.classList.add('hidden');
            return;
        }

        // Show loading state
        projectContents.classList.remove('hidden');
        document.getElementById('projectComps').textContent = '...';
        document.getElementById('projectFootage').textContent = '...';
        document.getElementById('projectItems').textContent = '...';
        document.getElementById('compositionsList').innerHTML = '<div style="padding: 8px; text-align: center; color: var(--text-secondary);">Loading...</div>';

        window.AEInterface.getProjectDetails(filePath, (result) => {
            try {
                const projectData = JSON.parse(result);

                if (projectData.error) {
                    projectContents.classList.add('hidden');
                    console.error('Error loading project details:', projectData.error);
                    return;
                }

                // Update stats
                document.getElementById('projectComps').textContent = projectData.numComps || 0;
                document.getElementById('projectFootage').textContent = projectData.numFootage || 0;
                document.getElementById('projectItems').textContent = projectData.numItems || 0;

                // Render compositions list
                const compsList = document.getElementById('compositionsList');
                compsList.innerHTML = '';

                if (projectData.compositions && projectData.compositions.length > 0) {
                    projectData.compositions.forEach(comp => {
                        const compDiv = document.createElement('div');
                        compDiv.className = 'composition-item';

                        const compName = document.createElement('div');
                        compName.className = 'composition-name';
                        compName.textContent = comp.name;

                        const compDetails = document.createElement('div');
                        compDetails.className = 'composition-details';
                        compDetails.textContent = `${comp.width}×${comp.height} • ${comp.frameRate}fps • ${comp.duration}s • ${comp.numLayers} layers`;

                        compDiv.appendChild(compName);
                        compDiv.appendChild(compDetails);
                        compsList.appendChild(compDiv);
                    });
                } else {
                    compsList.innerHTML = '<div style="padding: 8px; text-align: center; color: var(--text-secondary);">No compositions found</div>';
                }

            } catch (e) {
                console.error('Error parsing project details:', e);
                projectContents.classList.add('hidden');
            }
        });
    },

    /**
     * Render preview tags
     */
    renderPreviewTags: function(preset) {
        const container = document.getElementById('previewTags');
        container.innerHTML = '';

        if (preset.tags && preset.tags.length > 0) {
            preset.tags.forEach(tag => {
                const tagDiv = document.createElement('div');
                tagDiv.className = 'tag-item';

                const tagText = document.createElement('span');
                tagText.textContent = tag;

                const removeBtn = document.createElement('span');
                removeBtn.className = 'tag-remove';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', () => {
                    PresetManager.removeTag(preset.id, tag);
                    this.showPreview(PresetManager.getPreset(preset.id));
                });

                tagDiv.appendChild(tagText);
                tagDiv.appendChild(removeBtn);
                container.appendChild(tagDiv);
            });
        }

        // Setup tag input
        const tagInput = document.getElementById('tagInput');
        const addTagBtn = document.getElementById('addTagBtn');

        addTagBtn.onclick = () => {
            const tag = tagInput.value.trim();
            if (tag) {
                PresetManager.addTag(preset.id, tag);
                tagInput.value = '';
                this.showPreview(PresetManager.getPreset(preset.id));
            }
        };

        tagInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                addTagBtn.click();
            }
        };
    },

    /**
     * Setup preview actions
     */
    setupPreviewActions: function(preset) {
        const openBtn = document.getElementById('openInAE');
        const deleteBtn = document.getElementById('deletePreset');

        openBtn.onclick = () => {
            this.openInAfterEffects(preset);
        };

        deleteBtn.onclick = () => {
            if (confirm(`Delete preset "${preset.name}"?`)) {
                PresetManager.deletePreset(preset.id);
                this.hidePreview();
                this.render();
                this.showNotification('Preset deleted');
            }
        };
    },

    /**
     * Hide preview
     */
    hidePreview: function() {
        this.elements.previewSection.classList.add('hidden');
        this.currentPreview = null;
    },

    /**
     * Show group modal
     */
    showGroupModal: function() {
        this.elements.groupModal.classList.remove('hidden');
        this.elements.groupNameInput.value = '';
        this.elements.groupNameInput.focus();
    },

    /**
     * Hide group modal
     */
    hideGroupModal: function() {
        this.elements.groupModal.classList.add('hidden');
    },

    /**
     * Create group
     */
    createGroup: function() {
        const name = this.elements.groupNameInput.value.trim();
        const color = this.elements.groupColorSelect.value;

        if (!name) {
            alert('Please enter a group name');
            return;
        }

        PresetManager.createGroup(name, color);
        this.hideGroupModal();
        this.render();
        this.showNotification(`Group "${name}" created`);
    },

    /**
     * Open preset in After Effects
     */
    openInAfterEffects: function(preset) {
        if (!window.AEInterface || !window.AEInterface.csInterface) {
            this.showNotification('After Effects integration not available');
            return;
        }

        if (!preset.filePath) {
            this.showNotification('No file path available');
            return;
        }

        // Handle different file types
        if (preset.fileType === 'jsx') {
            // Execute JSX script
            this.showNotification('Executing JSX script...');
            window.AEInterface.executeJSX(preset.filePath, (result) => {
                if (result && result !== 'undefined') {
                    if (result.includes('Error') || result.includes('error')) {
                        this.showNotification('JSX Error: ' + result);
                    } else {
                        this.showNotification('JSX executed successfully');
                    }
                } else {
                    this.showNotification('JSX executed');
                }
            });
        } else if (preset.fileType === 'pack') {
            // Open PACK file as project
            this.showNotification('Opening project...');
            window.AEInterface.openProject(preset.filePath);
        } else if (preset.fileType === 'gif') {
            // GIF files can't be opened directly, maybe import?
            this.showNotification('GIF files are for preview only');
        } else {
            this.showNotification('Unknown file type: ' + preset.fileType);
        }
    },

    /**
     * Show notification
     */
    showNotification: function(message) {
        // Simple console log for now
        // Could be enhanced with a toast notification system
        console.log('Notification:', message);
    }
};
