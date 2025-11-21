/**
 * Main Application Entry Point
 * AEP Preview Plugin for Adobe After Effects
 */

// Authentication Manager
window.AuthManager = {
    PASSWORD: '1234',
    SESSION_KEY: 'aep_auth_session',

    /**
     * Check if user is authenticated
     */
    isAuthenticated: function() {
        return sessionStorage.getItem(this.SESSION_KEY) === 'true';
    },

    /**
     * Authenticate user with password
     */
    authenticate: function(password) {
        if (password === this.PASSWORD) {
            sessionStorage.setItem(this.SESSION_KEY, 'true');
            return true;
        }
        return false;
    },

    /**
     * Logout user
     */
    logout: function() {
        sessionStorage.removeItem(this.SESSION_KEY);
    }
};

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
     * Import a project into the current After Effects project
     */
    openProject: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `openAEProject("${escapedPath}")`;
        this.evalScript(script, (result) => {
            if (result === 'true') {
                console.log('Project imported successfully');
            } else {
                console.error('Failed to import project:', result);
            }
            if (callback) callback(result);
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
    },

    /**
     * Execute JSX script file
     */
    executeJSX: function(filePath, callback) {
        if (!filePath) {
            console.error('No JSX file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `executeJSXFile("${escapedPath}")`;
        this.evalScript(script, callback);
    },

    /**
     * Get extension path
     */
    getExtensionPath: function() {
        if (this.csInterface) {
            return this.csInterface.getSystemPath('extension');
        }
        return '';
    },

    /**
     * Scan FluxMotion folder for files
     */
    scanProjectsFolder: function(callback) {
        console.log('AEInterface.scanProjectsFolder() called');

        if (!this.csInterface) {
            console.error('CSInterface not initialized');
            if (callback) callback(JSON.stringify({ error: 'CSInterface not initialized. Make sure the plugin is running in After Effects.' }));
            return;
        }

        const script = 'scanProjectsFolder()';
        console.log('Executing ExtendScript:', script);

        this.evalScript(script, (result) => {
            console.log('ExtendScript result:', result);

            if (!result || result === 'undefined' || result.trim() === '') {
                console.error('Empty or undefined result from ExtendScript');
                const errorResponse = JSON.stringify({
                    error: 'ExtendScript returned empty result. Verify that:\n1. host.jsx is loaded in manifest.xml\n2. The Projects folder exists at: E:/af/Adobe After Effects 2025/Projects\n3. After Effects has permissions to access the folder'
                });
                if (callback) callback(errorResponse);
                return;
            }

            if (callback) callback(result);
        });
    },

    /**
     * Get detailed information about a project file
     */
    getProjectDetails: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `getProjectDetails("${escapedPath}")`;
        this.evalScript(script, callback);
    },

    /**
     * Apply preset/effect to active composition
     */
    applyPreset: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `applyPreset("${escapedPath}")`;
        this.evalScript(script, callback);
    },

    /**
     * Import file into After Effects
     */
    importFile: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `importFile("${escapedPath}")`;
        this.evalScript(script, callback);
    },

    /**
     * Import file into After Effects and add to timeline
     */
    importFileToTimeline: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `importFileToTimeline("${escapedPath}")`;
        this.evalScript(script, callback);
    },

    /**
     * Get contents of an .aep file (compositions, footage, folders)
     */
    getAepContents: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `getAepContents("${escapedPath}")`;
        this.evalScript(script, callback);
    },

    /**
     * Import specific composition from .aep file to timeline
     */
    importAepCompositionToTimeline: function(filePath, compName, callback) {
        if (!filePath || !compName) {
            console.error('File path and composition name required');
            return;
        }

        // Escape backslashes and quotes for ExtendScript
        const escapedPath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const escapedCompName = compName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const script = `importAepCompositionToTimeline("${escapedPath}", "${escapedCompName}")`;
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

    // Check authentication
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    function showMainApp() {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');

        // Initialize PresetManager
        if (typeof PresetManager !== 'undefined') {
            PresetManager.init();
            console.log('PresetManager initialized');
        }

        // Initialize FileBrowser
        FileBrowser.init();

        // Initialize UI
        UIManager.init();

        // Auto-refresh Projects folder when entering main app
        UIManager.loadFiles();

        console.log('AEP Preview Plugin ready');

        // Debug info
        if (AEInterface.csInterface) {
            AEInterface.getAEVersion((version) => {
                console.log('After Effects version:', version);
            });
        }
    }

    function handleLogin() {
        const password = passwordInput.value;
        if (AuthManager.authenticate(password)) {
            loginError.classList.add('hidden');
            showMainApp();
        } else {
            loginError.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Check if already authenticated
    if (AuthManager.isAuthenticated()) {
        showMainApp();
    } else {
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }

    // Login button click
    loginBtn.addEventListener('click', handleLogin);

    // Enter key in password input
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', function(e) {
    // Escape to clear selection
    if (e.key === 'Escape') {
        if (UIManager.selectedItem) {
            UIManager.clearPreview();
            document.querySelectorAll('.file-item.selected').forEach(el => {
                el.classList.remove('selected');
            });
        }
    }

    // Backspace to go back
    if (e.key === 'Backspace' && !UIManager.elements.backBtn.disabled) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            UIManager.navigateBack();
        }
    }
});

