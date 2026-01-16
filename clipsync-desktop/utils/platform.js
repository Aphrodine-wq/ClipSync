/**
 * Platform Utilities
 * Cross-platform utilities for clipboard, notifications, and file paths
 */

const { app } = require('electron');
const path = require('path');
const os = require('os');

/**
 * Get platform name
 */
exports.getPlatform = () => {
    return process.platform; // 'win32', 'darwin', 'linux'
};

/**
 * Check if running on Windows
 */
exports.isWindows = () => {
    return process.platform === 'win32';
};

/**
 * Check if running on Mac
 */
exports.isMac = () => {
    return process.platform === 'darwin';
};

/**
 * Check if running on Linux
 */
exports.isLinux = () => {
    return process.platform === 'linux';
};

/**
 * Get user data directory
 */
exports.getUserDataPath = () => {
    return app.getPath('userData');
};

/**
 * Get app data directory (platform-specific)
 */
exports.getAppDataPath = () => {
    if (exports.isWindows()) {
        return path.join(os.homedir(), 'AppData', 'Roaming', 'ClipSync');
    } else if (exports.isMac()) {
        return path.join(os.homedir(), 'Library', 'Application Support', 'ClipSync');
    } else {
        return path.join(os.homedir(), '.config', 'clipsync');
    }
};

/**
 * Get cache directory
 */
exports.getCachePath = () => {
    return app.getPath('cache');
};

/**
 * Get temp directory
 */
exports.getTempPath = () => {
    return app.getPath('temp');
};

/**
 * Get documents directory
 */
exports.getDocumentsPath = () => {
    return app.getPath('documents');
};

/**
 * Get platform-specific shortcut key
 */
exports.getShortcutKey = () => {
    if (exports.isMac()) {
        return 'Command'; // Cmd on Mac
    } else {
        return 'Control'; // Ctrl on Windows/Linux
    }
};

/**
 * Format shortcut string
 */
exports.formatShortcut = (key) => {
    if (exports.isMac()) {
        return key.replace('Ctrl', 'Cmd').replace('Control', 'Command');
    } else {
        return key.replace('Cmd', 'Ctrl').replace('Command', 'Control');
    }
};

/**
 * Get platform-specific notification options
 */
exports.getNotificationOptions = (title, message) => {
    const options = {
        title,
        body: message,
    };

    if (exports.isMac()) {
        // Mac-specific options
        options.sound = false;
    } else if (exports.isWindows()) {
        // Windows-specific options
        options.icon = path.join(__dirname, '..', 'build', 'icon.ico');
    } else {
        // Linux-specific options
        options.icon = path.join(__dirname, '..', 'build', 'icon.png');
    }

    return options;
};

/**
 * Get clipboard monitoring interval (platform-specific)
 */
exports.getClipboardInterval = () => {
    // Mac clipboard monitoring can be more frequent
    if (exports.isMac()) {
        return 300; // 300ms on Mac
    } else {
        return 500; // 500ms on Windows/Linux
    }
};

/**
 * Get platform-specific app name
 */
exports.getAppName = () => {
    return 'ClipSync';
};

/**
 * Get platform-specific user agent
 */
exports.getUserAgent = () => {
    const platform = exports.getPlatform();
    const version = app.getVersion();
    return `ClipSync/${version} (${platform})`;
};

