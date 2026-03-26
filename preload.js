const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  savePDF:          (url, filename)                  => ipcRenderer.invoke('save-pdf',        { url, filename }),
  saveZoteroPDF:    (url, filename, zoteroApiKey)    => ipcRenderer.invoke('save-zotero-pdf', { url, filename, zoteroApiKey }),
  uploadPdfToZotero: (args)                          => ipcRenderer.invoke('upload-pdf-to-zotero', args),
  fetchURL: (url)           => ipcRenderer.invoke('fetch-url', { url }),
  openURL:  (url)           => ipcRenderer.invoke('open-url', { url }),
  platform: process.platform,

  // ── Local API server ─────────────────────────────────────────────────────
  apiKeysList:   ()     => ipcRenderer.invoke('api-keys-list'),
  apiKeyCreate:  (name) => ipcRenderer.invoke('api-keys-create', name),
  apiKeyDelete:  (id)   => ipcRenderer.invoke('api-keys-delete', id),
  apiServerStart: (port) => ipcRenderer.invoke('api-server-start', port),
  apiServerStop:  ()    => ipcRenderer.invoke('api-server-stop'),
  apiServerStatus: ()   => ipcRenderer.invoke('api-server-status'),
  // Renderer → main: push library snapshot for /v1/library endpoint
  syncLibrary: (data) => ipcRenderer.send('sync-library', data),
  // Main → renderer: agent pushed a paper via POST /v1/library
  onAddPaperFromApi:    (cb) => ipcRenderer.on('add-paper-from-api',    (_, paper)   => cb(paper)),
  // Main → renderer: agent removed a paper via DELETE /v1/library/:arxivId
  onRemovePaperFromApi: (cb) => ipcRenderer.on('remove-paper-from-api', (_, arxivId) => cb(arxivId)),
  // Main → renderer: agent updated a note via PATCH /v1/library/:arxivId
  onUpdateNoteFromApi:  (cb) => ipcRenderer.on('update-note-from-api',  (_, data)    => cb(data)),
})
