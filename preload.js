const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePDF: (url, filename) => ipcRenderer.invoke('save-pdf', { url, filename }),
  fetchURL: (url) => ipcRenderer.invoke('fetch-url', { url }),
  platform: process.platform,
})
