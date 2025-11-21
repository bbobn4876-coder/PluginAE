/**
 * Storage Manager for AEP Preview Plugin
 * Handles local storage operations for presets, groups, and tags
 */

const StorageManager = {
    KEYS: {
        PRESETS: 'aep_presets',
        GROUPS: 'aep_groups',
        SETTINGS: 'aep_settings'
    },

    /**
     * Get all presets from storage
     */
    getPresets: function() {
        const data = localStorage.getItem(this.KEYS.PRESETS);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save presets to storage
     */
    savePresets: function(presets) {
        localStorage.setItem(this.KEYS.PRESETS, JSON.stringify(presets));
    },

    /**
     * Add a new preset
     */
    addPreset: function(preset) {
        const presets = this.getPresets();
        preset.id = this.generateId();
        preset.dateAdded = new Date().toISOString();
        presets.push(preset);
        this.savePresets(presets);
        return preset;
    },

    /**
     * Update an existing preset
     */
    updatePreset: function(id, updates) {
        const presets = this.getPresets();
        const index = presets.findIndex(p => p.id === id);
        if (index !== -1) {
            presets[index] = { ...presets[index], ...updates };
            this.savePresets(presets);
            return presets[index];
        }
        return null;
    },

    /**
     * Delete a preset
     */
    deletePreset: function(id) {
        const presets = this.getPresets();
        const filtered = presets.filter(p => p.id !== id);
        this.savePresets(filtered);
        return filtered;
    },

    /**
     * Get all groups from storage
     */
    getGroups: function() {
        const data = localStorage.getItem(this.KEYS.GROUPS);
        if (!data) {
            // Initialize with default groups
            const defaultGroups = [
                { id: 'ungrouped', name: 'Ungrouped', color: 'blue' }
            ];
            this.saveGroups(defaultGroups);
            return defaultGroups;
        }
        return JSON.parse(data);
    },

    /**
     * Save groups to storage
     */
    saveGroups: function(groups) {
        localStorage.setItem(this.KEYS.GROUPS, JSON.stringify(groups));
    },

    /**
     * Add a new group
     */
    addGroup: function(group) {
        const groups = this.getGroups();
        group.id = this.generateId();
        groups.push(group);
        this.saveGroups(groups);
        return group;
    },

    /**
     * Update a group
     */
    updateGroup: function(id, updates) {
        const groups = this.getGroups();
        const index = groups.findIndex(g => g.id === id);
        if (index !== -1) {
            groups[index] = { ...groups[index], ...updates };
            this.saveGroups(groups);
            return groups[index];
        }
        return null;
    },

    /**
     * Delete a group
     */
    deleteGroup: function(id) {
        if (id === 'ungrouped') return; // Cannot delete ungrouped
        const groups = this.getGroups();
        const filtered = groups.filter(g => g.id !== id);
        this.saveGroups(filtered);

        // Move presets in this group to ungrouped
        const presets = this.getPresets();
        presets.forEach(preset => {
            if (preset.group === id) {
                preset.group = 'ungrouped';
            }
        });
        this.savePresets(presets);

        return filtered;
    },

    /**
     * Get settings
     */
    getSettings: function() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : {};
    },

    /**
     * Save settings
     */
    saveSettings: function(settings) {
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    },

    /**
     * Generate a unique ID
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Clear all data
     */
    clearAll: function() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    /**
     * Export all data
     */
    exportData: function() {
        return {
            presets: this.getPresets(),
            groups: this.getGroups(),
            settings: this.getSettings()
        };
    },

    /**
     * Import data
     */
    importData: function(data) {
        if (data.presets) this.savePresets(data.presets);
        if (data.groups) this.saveGroups(data.groups);
        if (data.settings) this.saveSettings(data.settings);
    }
};
