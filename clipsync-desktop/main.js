const { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, ipcMain, nativeImage, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
const notifier = require('node-notifier');

// Initialize electron-store for persistent settings
const store = new Store();

let mainWindow;
let tray;
let clipboardHistory = [];
let isQuitting = false;

// Auto-updater configuration
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    backgroundColor: '#f4f4f5',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    show: false,
    title: 'ClipSync - Professional Clipboard Manager'
  });

  // Load the app
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from the packaged resources
    const indexPath = path.join(process.resourcesPath, 'app', 'dist', 'index.html');
    mainWindow.loadFile(indexPath);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check for updates
    if (!isDev) {
      autoUpdater.checkForUpdates();
    }
  });

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      
      // Show notification
      notifier.notify({
        title: 'ClipSync',
        message: 'ClipSync is still running in the background',
        sound: false,
        wait: false
      });
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create system tray
function createTray() {
  try {
    const iconPath = path.join(__dirname, 'build/tray-icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath);

    tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  } catch (error) {
    console.log('Tray icon not found, skipping tray creation');
    return;
  }
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open ClipSync',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quick Paste',
      accelerator: 'Ctrl+Shift+V',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('quick-paste');
      }
    },
    { type: 'separator' },
    {
      label: 'Recent Clips',
      submenu: [
        {
          label: 'No clips yet',
          enabled: false
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('open-settings');
      }
    },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdates();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit ClipSync',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('ClipSync - Clipboard Manager');
  tray.setContextMenu(contextMenu);

  // Double-click to show window
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

// Register global shortcuts
function registerShortcuts() {
  // Ctrl+Shift+V - Quick paste
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('quick-paste');
  });

  // Ctrl+Shift+C - Capture clipboard
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    const text = clipboard.readText();
    if (text) {
      mainWindow.webContents.send('clipboard-captured', text);
    }
  });

  // Ctrl+Shift+H - Show/Hide window
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Monitor clipboard changes
let lastClipboardText = '';
function startClipboardMonitoring() {
  setInterval(() => {
    const currentText = clipboard.readText();
    
    if (currentText && currentText !== lastClipboardText) {
      lastClipboardText = currentText;
      
      // Send to renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('clipboard-changed', currentText);
      }
      
      // Update tray menu with recent clips
      updateTrayMenu(currentText);
    }
  }, 500); // Check every 500ms
}

// Update tray menu with recent clips
function updateTrayMenu(newClip) {
  clipboardHistory.unshift(newClip);
  if (clipboardHistory.length > 5) {
    clipboardHistory = clipboardHistory.slice(0, 5);
  }

  const recentClipsMenu = clipboardHistory.map((clip, index) => ({
    label: clip.length > 50 ? clip.substring(0, 50) + '...' : clip,
    click: () => {
      clipboard.writeText(clip);
      notifier.notify({
        title: 'ClipSync',
        message: 'Copied to clipboard',
        sound: false,
        wait: false
      });
    }
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open ClipSync',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quick Paste',
      accelerator: 'Ctrl+Shift+V',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('quick-paste');
      }
    },
    { type: 'separator' },
    {
      label: 'Recent Clips',
      submenu: recentClipsMenu.length > 0 ? recentClipsMenu : [
        {
          label: 'No clips yet',
          enabled: false
        }
      ]
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('open-settings');
      }
    },
    {
      label: 'Check for Updates',
      click: () => {
        autoUpdater.checkForUpdates();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit ClipSync',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

// IPC handlers
ipcMain.handle('get-clipboard', () => {
  return clipboard.readText();
});

ipcMain.handle('set-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});

ipcMain.handle('get-store-value', (event, key) => {
  return store.get(key);
});

ipcMain.handle('set-store-value', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('show-notification', (event, { title, message }) => {
  notifier.notify({
    title: title || 'ClipSync',
    message: message,
    sound: false,
    wait: false
  });
  return true;
});

ipcMain.handle('minimize-to-tray', () => {
  mainWindow.hide();
  return true;
});

ipcMain.handle('quit-app', () => {
  isQuitting = true;
  app.quit();
  return true;
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  notifier.notify({
    title: 'ClipSync Update Available',
    message: `Version ${info.version} is available. Click to download.`,
    sound: true,
    wait: true
  });

  notifier.on('click', () => {
    autoUpdater.downloadUpdate();
  });
});

autoUpdater.on('update-not-available', () => {
  console.log('No updates available');
});

autoUpdater.on('download-progress', (progressObj) => {
  let message = `Download speed: ${progressObj.bytesPerSecond}`;
  message += ` - Downloaded ${progressObj.percent}%`;
  console.log(message);
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  notifier.notify({
    title: 'ClipSync Update Ready',
    message: 'Update downloaded. Will install on quit.',
    sound: true,
    wait: false
  });
});

// App events
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();
  startClipboardMonitoring();

  // Set app user model ID for Windows notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.clipsync.app');
  }
});

app.on('window-all-closed', () => {
  // Don't quit on window close (keep running in tray)
  if (process.platform !== 'darwin' && !isQuitting) {
    // Keep app running
  } else {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('before-quit', () => {
  isQuitting = true;
});

// Handle second instance
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Prevent multiple instances
app.setAsDefaultProtocolClient('clipsync');
