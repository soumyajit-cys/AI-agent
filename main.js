// main.js — Electron Main Process
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, execSync } = require('child_process');
const os = require('os');
require('dotenv').config();

const { handleChat } = require('./src/ai');
const { executeSystemTool } = require('./src/system');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,          // Custom title bar
    transparent: false,
    backgroundColor: '#050A14',
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false,           // Don't show until ready
  });

  mainWindow.loadFile('renderer/index.html');

  // Show window gracefully
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (mainWindow === null) createWindow(); });

// ─── Window Controls ──────────────────────────────────────────────────────────
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());

// ─── Chat Handler ─────────────────────────────────────────────────────────────
ipcMain.handle('chat', async (event, { messages, userMessage }) => {
  try {
    const result = await handleChat(messages, userMessage);
    return { success: true, data: result };
  } catch (err) {
    console.error('[chat error]', err);
    return { success: false, error: err.message };
  }
});

// ─── System Tool Executor ─────────────────────────────────────────────────────
ipcMain.handle('execute-tool', async (event, { toolName, toolInput }) => {
  try {
    const result = await executeSystemTool(toolName, toolInput, mainWindow, shell, dialog, exec, execSync, os, fs);
    return { success: true, result };
  } catch (err) {
    console.error(`[tool error] ${toolName}:`, err);
    return { success: false, error: err.message };
  }
});

// ─── Get API Key Status ───────────────────────────────────────────────────────
ipcMain.handle('get-config', () => {
  return {
    hasApiKey: !!(process.env.ANTHROPIC_API_KEY),
    platform: process.platform,
    homeDir: os.homedir(),
    username: os.userInfo().username,
  };
});