/**
 * Main Application Entry Point
 * AEP Preview Plugin for Adobe After Effects
 */

// After Effects Interface
window.AEInterface = {
    csInterface: null,

    /**
     * Initialize the CEP interface
     */
    init: function() {
        if (typeof CSInterface !== 'undefined') {
            this.csInterface = new CSInterface();
            this.setupTheme();
            console.log('CEP Interface initialized');
        } else {
            console.warn('CSInterface not available - running in browser mode');
        }
    },

    /**
     * Setup theme based on After Effects
     */
    setupTheme: function() {
        if (!this.csInterface) return;

        const setTheme = () => {
            const hostEnv = this.csInterface.getHostEnvironment();
            if (hostEnv) {
                const skinInfo = JSON.parse(hostEnv).appSkinInfo;
                const brightness = skinInfo.panelBackgroundColor.color.red;

                // After Effects uses dark theme by default
                if (brightness < 128) {
                    document.body.setAttribute('data-theme', 'dark');
                } else {
                    document.body.setAttribute('data-theme', 'light');
                }
            }
        };

        setTheme();

        // Listen for theme changes
        this.csInterface.addEventListener('com.adobe.csxs.events.ThemeColorChanged', setTheme);
    },

    /**
     * Evaluate ExtendScript in After Effects
     */
    evalScript: function(script, callback) {
        if (this.csInterface) {
            this.csInterface.evalScript(script, callback);
        } else {
            console.warn('Cannot evaluate script - CEP not available');
            if (callback) callback('CEP not available');
        }
    },

    /**
     * Open a project in After Effects
     */
    openProject: function(filePath) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        const script = `openAEProject("${filePath}")`;
        this.evalScript(script, (result) => {
            if (result === 'true') {
                console.log('Project opened successfully');
            } else {
                console.error('Failed to open project:', result);
            }
        });
    },

    /**
     * Get After Effects version
     */
    getAEVersion: function(callback) {
        const script = 'getAEVersion()';
        this.evalScript(script, callback);
    },

    /**
     * Get active composition info
     */
    getActiveComp: function(callback) {
        const script = 'getActiveComp()';
        this.evalScript(script, callback);
    }
};

/**
 * Application Initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('AEP Preview Plugin starting...');

    // Initialize CEP interface
    AEInterface.init();

    // Initialize storage and preset manager
    PresetManager.init();

    // Initialize UI
    UIManager.init();

    console.log('AEP Preview Plugin ready');

    // Debug info
    if (AEInterface.csInterface) {
        AEInterface.getAEVersion((version) => {
            console.log('After Effects version:', version);
        });
    }
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + F for search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }

    // Escape to close preview
    if (e.key === 'Escape') {
        if (!UIManager.elements.previewSection.classList.contains('hidden')) {
            UIManager.hidePreview();
        }
        if (!UIManager.elements.groupModal.classList.contains('hidden')) {
            UIManager.hideGroupModal();
        }
    }
});

/**
 * Handle drag and drop
 */
document.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        // Filter for .aep files
        const aepFiles = Array.from(files).filter(file =>
            file.name.toLowerCase().endsWith('.aep')
        );

        if (aepFiles.length > 0) {
            UIManager.handleFileUpload(aepFiles);
        }
    }
});
