/**
 * Favorites Manager
 * Handles favorite items storage and management
 */

const FavoritesManager = {
    STORAGE_KEY: 'fluxmotion_favorites',
    favorites: new Set(),

    /**
     * Initialize favorites from storage
     */
    init: function() {
        this.loadFromStorage();
    },

    /**
     * Load favorites from localStorage
     */
    loadFromStorage: function() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const favArray = JSON.parse(stored);
                this.favorites = new Set(favArray);
            }
        } catch (e) {
            console.error('Error loading favorites:', e);
            this.favorites = new Set();
        }
    },

    /**
     * Save favorites to localStorage
     */
    saveToStorage: function() {
        try {
            const favArray = Array.from(this.favorites);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favArray));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    },

    /**
     * Generate unique ID for an item
     */
    getItemId: function(item) {
        if (item.type === 'aep-composition') {
            return `comp:${item.aepPath}:${item.compositionName}`;
        } else if (item.type === 'file') {
            return `file:${item.filePath}`;
        } else if (item.type === 'folder') {
            return `folder:${item.path || item.name}`;
        }
        return null;
    },

    /**
     * Check if item is favorited
     */
    isFavorited: function(item) {
        const id = this.getItemId(item);
        return id && this.favorites.has(id);
    },

    /**
     * Toggle favorite status
     */
    toggleFavorite: function(item) {
        const id = this.getItemId(item);
        if (!id) return false;

        if (this.favorites.has(id)) {
            this.favorites.delete(id);
            this.saveToStorage();
            return false;
        } else {
            this.favorites.add(id);
            // Also store item data for later retrieval
            this.storeFavoriteItem(id, item);
            this.saveToStorage();
            return true;
        }
    },

    /**
     * Store favorite item data
     */
    storeFavoriteItem: function(id, item) {
        try {
            const itemsKey = this.STORAGE_KEY + '_items';
            let items = {};

            const stored = localStorage.getItem(itemsKey);
            if (stored) {
                items = JSON.parse(stored);
            }

            items[id] = {
                type: item.type,
                name: item.name,
                fileName: item.fileName,
                filePath: item.filePath,
                fileType: item.fileType,
                fileSize: item.fileSize,
                folder: item.folder,
                info: item.info,
                videoPreviewPath: item.videoPreviewPath,
                previewPath: item.previewPath,
                aepPath: item.aepPath,
                compositionName: item.compositionName,
                path: item.path,
                folderPreviewPath: item.folderPreviewPath
            };

            localStorage.setItem(itemsKey, JSON.stringify(items));
        } catch (e) {
            console.error('Error storing favorite item:', e);
        }
    },

    /**
     * Get all favorited items
     */
    getFavoriteItems: function() {
        try {
            const itemsKey = this.STORAGE_KEY + '_items';
            const stored = localStorage.getItem(itemsKey);

            if (!stored) return [];

            const items = JSON.parse(stored);
            const favoriteItems = [];

            this.favorites.forEach(id => {
                if (items[id]) {
                    favoriteItems.push(items[id]);
                }
            });

            return favoriteItems;
        } catch (e) {
            console.error('Error getting favorite items:', e);
            return [];
        }
    },

    /**
     * Clear all favorites
     */
    clearAll: function() {
        this.favorites.clear();
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STORAGE_KEY + '_items');
    },

    /**
     * Get favorites count
     */
    getCount: function() {
        return this.favorites.size;
    }
};
