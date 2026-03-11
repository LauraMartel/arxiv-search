const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePDF: (url, filename) => ipcRenderer.invoke('save-pdf', { url, filename }),
  platform: process.platform,
})
