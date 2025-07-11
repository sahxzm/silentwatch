const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// --- Process Monitoring & Overlay Detection ---
console.log("Electron main process started and registering handlers...");
const { monitorProcesses, scanOverlays, getRunningApps } = require('./src/lib/monitor');
ipcMain.handle('monitor-processes', monitorProcesses);
ipcMain.handle('scan-overlays', scanOverlays);
ipcMain.handle('get-running-apps', getRunningApps);


