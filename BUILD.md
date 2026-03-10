# How to build the arXiv Browser installer

## Prerequisites (one-time setup)

1. **Install Node.js** — download from https://nodejs.org (choose the LTS version)
2. **Open a terminal** in this folder

---

## Build

```bash
# Install dependencies (first time only)
npm install

# Test the app without building
npm start

# Build installer for your platform
npm run build:win      # → Windows .exe installer
npm run build:mac      # → macOS .dmg
npm run build:linux    # → Linux .AppImage

# Build all platforms at once (requires each platform's toolchain)
npm run build:all
```

The installer will appear in the `dist/` folder.

---

## Distribute to colleagues

1. Run `npm run build:win` (or `:mac`, `:linux`)
2. Share the file in `dist/`:
   - Windows: `arXiv Browser Setup 2.0.0.exe`
   - macOS: `arXiv Browser-2.0.0.dmg`
   - Linux: `arXiv Browser-2.0.0.AppImage`

### What colleagues do to install:
- **Windows**: Double-click the `.exe` → Next → Install → Done
- **macOS**: Open the `.dmg` → drag the app to Applications → Done
- **Linux**: Make the `.AppImage` executable (`chmod +x`) → double-click

---

## macOS cross-compile note

Building a macOS `.dmg` requires running `npm run build:mac` **on a Mac**.
On Windows/Linux you can use a GitHub Actions workflow to build for Mac automatically.
See: https://www.electron.build/multi-platform-build

---

## App data location

Settings and library are stored in the OS app data folder:
- **Windows**: `%APPDATA%\arxiv-browser\`
- **macOS**: `~/Library/Application Support/arxiv-browser/`
- **Linux**: `~/.config/arxiv-browser/`
