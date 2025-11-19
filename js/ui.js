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
            uploadBtn: document.getElementById('uploadBtn'),
            fileInput: document.getElementById('fileInput'),
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
        // Upload button
        this.elements.uploadBtn.addEventListener('click', () => {
            this.elements.fileInput.click();
        });

        // File input change
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
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
     * Handle file upload
     */
    handleFileUpload: function(files) {
        if (!files || files.length === 0) return;

        const addedPresets = PresetManager.addPresetsFromFiles(files);

        if (addedPresets.length > 0) {
            this.showNotification(`Added ${addedPresets.length} preset(s)`);
            this.render();
        }

        // Reset file input
        this.elements.fileInput.value = '';
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

        document.getElementById('previewFileName').textContent = preset.fileName;
        document.getElementById('previewFileSize').textContent = PresetManager.formatFileSize(preset.fileSize);
        document.getElementById('previewDate').textContent = PresetManager.formatDate(preset.dateAdded);

        const group = PresetManager.getGroup(preset.group);
        document.getElementById('previewGroup').textContent = group ? group.name : 'Ungrouped';

        this.renderPreviewTags(preset);
        this.setupPreviewActions(preset);
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
        if (window.AEInterface) {
            window.AEInterface.openProject(preset.filePath);
        } else {
            this.showNotification('After Effects integration not available');
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
