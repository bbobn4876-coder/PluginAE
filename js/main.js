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
    },

    /**
     * Execute JSX script file
     */
    executeJSX: function(filePath, callback) {
        if (!filePath) {
            console.error('No JSX file path provided');
            return;
        }

        const script = `executeJSXFile("${filePath}")`;
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
     * Scan Projects folder for files
     */
    scanProjectsFolder: function(callback) {
        const script = 'scanProjectsFolder()';
        this.evalScript(script, callback);
    },

    /**
     * Get detailed information about a project file
     */
    getProjectDetails: function(filePath, callback) {
        if (!filePath) {
            console.error('No file path provided');
            return;
        }

        const script = `getProjectDetails("${filePath}")`;
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

