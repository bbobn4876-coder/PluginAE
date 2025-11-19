/**
 * Preset Manager for AEP Preview Plugin
 * Handles preset operations and filtering
 */

const PresetManager = {
    currentPresets: [],
    currentGroups: [],
    activeFilter: 'all',
    searchQuery: '',

    /**
     * Initialize the preset manager
     */
    init: function() {
        this.loadPresets();
        this.loadGroups();
    },

    /**
     * Load presets from storage
     */
    loadPresets: function() {
        this.currentPresets = StorageManager.getPresets();
        return this.currentPresets;
    },

    /**
     * Load groups from storage
     */
    loadGroups: function() {
        this.currentGroups = StorageManager.getGroups();
        return this.currentGroups;
    },

    /**
     * Add presets from file upload
     */
    addPresetsFromFiles: function(files) {
        const addedPresets = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file type - support .pack, .jsx, .gif
            const ext = file.name.split('.').pop().toLowerCase();
            if (!['pack', 'jsx', 'gif'].includes(ext)) {
                console.warn('Skipping unsupported file:', file.name);
                continue;
            }

            const preset = {
                name: file.name,
                fileName: file.name,
                filePath: file.path || '',
                fileSize: file.size,
                fileType: ext,
                group: 'ungrouped',
                tags: [],
                dateAdded: new Date().toISOString(),
                source: 'upload'
            };

            const savedPreset = StorageManager.addPreset(preset);
            addedPresets.push(savedPreset);
        }

        this.loadPresets();
        return addedPresets;
    },

    /**
     * Load presets from Projects folder
     */
    loadFromProjectsFolder: function(filesData) {
        if (!filesData || !Array.isArray(filesData)) {
            console.warn('Invalid files data from Projects folder');
            return [];
        }

        const addedPresets = [];

        filesData.forEach(fileInfo => {
            // Check if preset already exists
            const existing = this.currentPresets.find(p =>
                p.filePath === fileInfo.path && p.source === 'projects'
            );

            if (existing) {
                console.log('Preset already loaded:', fileInfo.name);
                return;
            }

            const preset = {
                name: fileInfo.name,
                fileName: fileInfo.name,
                filePath: fileInfo.path,
                fileSize: fileInfo.size || 0,
                fileType: fileInfo.type,
                group: 'ungrouped',
                tags: [],
                dateAdded: new Date().toISOString(),
                source: 'projects'
            };

            const savedPreset = StorageManager.addPreset(preset);
            addedPresets.push(savedPreset);
        });

        this.loadPresets();
        return addedPresets;
    },

    /**
     * Get preset by ID
     */
    getPreset: function(id) {
        return this.currentPresets.find(p => p.id === id);
    },

    /**
     * Update preset
     */
    updatePreset: function(id, updates) {
        const updated = StorageManager.updatePreset(id, updates);
        if (updated) {
            this.loadPresets();
        }
        return updated;
    },

    /**
     * Delete preset
     */
    deletePreset: function(id) {
        StorageManager.deletePreset(id);
        this.loadPresets();
    },

    /**
     * Add tag to preset
     */
    addTag: function(presetId, tag) {
        const preset = this.getPreset(presetId);
        if (preset && !preset.tags.includes(tag)) {
            preset.tags.push(tag);
            this.updatePreset(presetId, { tags: preset.tags });
        }
    },

    /**
     * Remove tag from preset
     */
    removeTag: function(presetId, tag) {
        const preset = this.getPreset(presetId);
        if (preset) {
            preset.tags = preset.tags.filter(t => t !== tag);
            this.updatePreset(presetId, { tags: preset.tags });
        }
    },

    /**
     * Set preset group
     */
    setPresetGroup: function(presetId, groupId) {
        this.updatePreset(presetId, { group: groupId });
    },

    /**
     * Filter presets
     */
    filterPresets: function(groupId = null, searchQuery = null) {
        if (groupId !== null) {
            this.activeFilter = groupId;
        }
        if (searchQuery !== null) {
            this.searchQuery = searchQuery.toLowerCase();
        }

        let filtered = [...this.currentPresets];

        // Filter by group
        if (this.activeFilter !== 'all') {
            filtered = filtered.filter(p => p.group === this.activeFilter);
        }

        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(p => {
                const nameMatch = p.name.toLowerCase().includes(this.searchQuery);
                const tagMatch = p.tags.some(tag =>
                    tag.toLowerCase().includes(this.searchQuery)
                );
                return nameMatch || tagMatch;
            });
        }

        return filtered;
    },

    /**
     * Get all unique tags
     */
    getAllTags: function() {
        const tagSet = new Set();
        this.currentPresets.forEach(preset => {
            preset.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    },

    /**
     * Create a new group
     */
    createGroup: function(name, color) {
        const group = {
            name: name,
            color: color || 'blue'
        };
        const savedGroup = StorageManager.addGroup(group);
        this.loadGroups();
        return savedGroup;
    },

    /**
     * Delete group
     */
    deleteGroup: function(id) {
        StorageManager.deleteGroup(id);
        this.loadGroups();
    },

    /**
     * Get group by ID
     */
    getGroup: function(id) {
        return this.currentGroups.find(g => g.id === id);
    },

    /**
     * Format file size
     */
    formatFileSize: function(bytes) {
        if (!bytes) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * Format date
     */
    formatDate: function(dateString) {
        if (!dateString) return 'Unknown';

        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
};
