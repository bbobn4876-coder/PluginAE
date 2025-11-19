/**
 * CSInterface - Adobe Common Extensibility Platform Interface
 * This is a simplified version of the CSInterface library for CEP extensions
 */

var CSInterface = function() {
    this.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";
};

/**
 * Evaluate a script in the host application
 */
CSInterface.prototype.evalScript = function(script, callback) {
    if (callback === null || callback === undefined) {
        callback = function(result) {};
    }

    window.__adobe_cep__.evalScript(script, callback);
};

/**
 * Get the host environment
 */
CSInterface.prototype.getHostEnvironment = function() {
    var hostEnv = window.__adobe_cep__.getHostEnvironment();
    return hostEnv;
};

/**
 * Close the extension
 */
CSInterface.prototype.closeExtension = function() {
    window.__adobe_cep__.closeExtension();
};

/**
 * Get extension ID
 */
CSInterface.prototype.getExtensionID = function() {
    return window.__adobe_cep__.getExtensionId();
};

/**
 * Get system path
 */
CSInterface.prototype.getSystemPath = function(pathType) {
    var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
    return path;
};

/**
 * Add event listener
 */
CSInterface.prototype.addEventListener = function(type, listener, obj) {
    window.__adobe_cep__.addEventListener(type, listener, obj);
};

/**
 * Remove event listener
 */
CSInterface.prototype.removeEventListener = function(type, listener, obj) {
    window.__adobe_cep__.removeEventListener(type, listener, obj);
};

/**
 * Dispatch event
 */
CSInterface.prototype.dispatchEvent = function(event) {
    if (typeof event.data === "object") {
        event.data = JSON.stringify(event.data);
    }

    window.__adobe_cep__.dispatchEvent(event);
};

/**
 * Request to open a URL in the default browser
 */
CSInterface.prototype.openURLInDefaultBrowser = function(url) {
    return window.cep.util.openURLInDefaultBrowser(url);
};

/**
 * Get OS information
 */
CSInterface.prototype.getOSInformation = function() {
    var userAgent = navigator.userAgent;

    if (navigator.platform === "Win32" || navigator.platform === "Windows") {
        return "Windows";
    } else if (navigator.platform === "MacIntel") {
        return "Mac";
    }

    return "Unknown";
};

/**
 * Get scale factor
 */
CSInterface.prototype.getScaleFactor = function() {
    var hostEnv = this.getHostEnvironment();
    if (hostEnv) {
        var appSkinInfo = JSON.parse(hostEnv).appSkinInfo;
        return appSkinInfo.scaleFactor;
    }
    return 1;
};

/**
 * CSEvent object
 */
var CSEvent = function(type, scope, appId, extensionId) {
    this.type = type;
    this.scope = scope || "GLOBAL";
    this.appId = appId || "";
    this.extensionId = extensionId || "";
    this.data = "";
};

/**
 * System Path types
 */
CSInterface.SystemPath = {
    USER_DATA: "userData",
    COMMON_FILES: "commonFiles",
    MY_DOCUMENTS: "myDocuments",
    APPLICATION: "application",
    EXTENSION: "extension",
    HOST_APPLICATION: "hostApplication"
};

/**
 * Extension event scope
 */
CSInterface.EventScope = {
    GLOBAL: "GLOBAL",
    APPLICATION: "APPLICATION"
};
