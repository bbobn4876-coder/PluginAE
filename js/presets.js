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
     * Load presets from FluxMotion folder with automatic grouping
     */
    loadFromProjectsFolder: function(filesData, foldersData) {
        if (!filesData || !Array.isArray(filesData)) {
            console.warn('Invalid files data from FluxMotion folder');
            return [];
        }

        // Create groups from folders
        if (foldersData && Array.isArray(foldersData)) {
            foldersData.forEach(folderInfo => {
                // Check if group already exists
                const existing = this.currentGroups.find(g =>
                    g.name === folderInfo.name && g.source === 'folder'
                );

                if (!existing) {
                    // Auto-assign color based on folder name
                    const color = this.getFolderColor(folderInfo.name);

                    const group = {
                        name: folderInfo.name,
                        color: color,
                        source: 'folder',
                        folderPath: folderInfo.path
                    };

                    StorageManager.addGroup(group);
                }
            });

            // Reload groups
            this.loadGroups();
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

            // Determine group based on folder
            let groupId = 'ungrouped';
            if (fileInfo.folder) {
                // Find group by folder name
                const folderName = fileInfo.folder.split('/')[0]; // Get first level folder
                const group = this.currentGroups.find(g => g.name === folderName);
                if (group) {
                    groupId = group.id;
                }
            }

            const preset = {
                name: fileInfo.name,
                fileName: fileInfo.name,
                filePath: fileInfo.path,
                fileSize: fileInfo.size || 0,
                fileType: fileInfo.type,
                group: groupId,
                folder: fileInfo.folder || '',
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
     * Get color for folder based on name
     */
    getFolderColor: function(folderName) {
        const lowerName = folderName.toLowerCase();

        // Auto-assign colors based on keywords
        if (lowerName.includes('background') || lowerName.includes('bg')) return 'blue';
        if (lowerName.includes('icon')) return 'purple';
        if (lowerName.includes('preset')) return 'green';
        if (lowerName.includes('transition') || lowerName.includes('tran')) return 'orange';
        if (lowerName.includes('title')) return 'red';
        if (lowerName.includes('shape')) return 'yellow';
        if (lowerName.includes('gradient')) return 'purple';
        if (lowerName.includes('template')) return 'blue';

        // Default colors rotation
        const colors = ['blue', 'green', 'red', 'yellow', 'purple', 'orange'];
        const hash = folderName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
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
