const { app, BrowserWindow, shell, ipcMain, Menu, dialog, net } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'arXiv Browser',
    icon: path.join(__dirname, 'assets', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#f7f5f0',
    show: false,
  })

  win.loadFile('index.html')
  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file://')) { e.preventDefault(); shell.openExternal(url) }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: 'arXiv Browser',
      submenu: [
        { label: 'About arXiv Browser', role: 'about' },
        { type: 'separator' },
        { label: 'Hide', role: 'hide' },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
        { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(process.env.NODE_ENV === 'dev' ? [{ role: 'toggleDevTools' }] : []),
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
    },
  ])
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })

// IPC: save PDF — download in main process (no CORS) then save via dialog
ipcMain.handle('save-pdf', async (event, { url, filename }) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: filename,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  if (!filePath) return { ok: false }

  return new Promise((resolve) => {
    const request = net.request({ url, method: 'GET' })
    request.setHeader('User-Agent', 'Mozilla/5.0 (compatible; arXiv-Browser/2.0)')
    const chunks = []
    request.on('response', (response) => {
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', () => {
        try {
          fs.writeFileSync(filePath, Buffer.concat(chunks))
          resolve({ ok: true, path: filePath })
        } catch (e) {
          resolve({ ok: false, error: e.message })
        }
      })
      response.on('error', (e) => resolve({ ok: false, error: e.message }))
    })
    request.on('error', (e) => resolve({ ok: false, error: e.message }))
    request.end()
  })
})