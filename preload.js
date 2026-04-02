// preload.js — Secure IPC Bridge
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ARIA', {
  // Chat with AI
  chat: (payload) => ipcRenderer.invoke('chat', payload),

  // Execute system tool
  executeTool: (payload) => ipcRenderer.invoke('execute-tool', payload),

  // Get app config
  getConfig: () => ipcRenderer.invoke('get-config'),

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close:    () => ipcRenderer.send('window-close'),
});