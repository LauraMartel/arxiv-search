# arXiv Browser

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

A desktop application for searching arXiv, building a paper library, and collaborating with colleagues.

Built with [Electron](https://www.electronjs.org/) — installs like any normal desktop app, no coding required for end users.

---

## Features

- **Search** — browse arXiv by category, keywords, date range; search in title, abstract, or all fields
- **Library** — save papers, add notes, organize into collections, export BibTeX
- **Collaboration** — push/pull a shared `library.json` to a GitHub repo; colleagues stay in sync
- **AI (optional)** — chat with your library, get search suggestions, summarize papers (requires OpenAI or Anthropic API key)

---

## Install the app (end users)

Download the latest installer from the [Releases](../../releases) page:

- **Windows**: `arXiv Browser Setup x.x.x.exe` → double-click → Next → Install
- **macOS**: `arXiv Browser-x.x.x.dmg` → drag to Applications
- **Linux**: `arXiv Browser-x.x.x.AppImage` → make executable → run

---

## Build from source (developers)

**Prerequisites**: [Node.js](https://nodejs.org) (LTS)

```bash
git clone https://github.com/YOUR_USERNAME/arxiv-browser.git
cd arxiv-browser
npm install
npm start          # run in development
npm run build:win  # build Windows .exe
npm run build:mac  # build macOS .dmg
npm run build:linux # build Linux .AppImage
```

Or on Windows, just double-click **`BUILD.bat`** — it handles everything automatically.

---

## Collaboration setup

All team members share a single GitHub repository for their library:

1. Create a **private GitHub repository** (e.g. `my-lab/arxiv-library`)
2. Each member opens the app → **Settings** tab:
   - GitHub Token: a Personal Access Token with `repo` scope ([create one here](https://github.com/settings/tokens))
   - Repository: `my-lab/arxiv-library`
   - Branch: `main`
3. Use **Push** to upload your library, **Pull** to get colleagues' papers
4. Merge is automatic — no duplicates

---

## AI setup (optional)

In the app → **Settings** tab:

| Provider | Model | Where to get a key |
|---|---|---|
| OpenAI | gpt-4o-mini (default) | [platform.openai.com](https://platform.openai.com/api-keys) |
| Anthropic | claude-haiku (default) | [console.anthropic.com](https://console.anthropic.com) |

Your API key is stored locally and never sent anywhere except directly to the AI provider.

---

## Data location

| Platform | Path |
|---|---|
| Windows | `%APPDATA%\arxiv-browser\` |
| macOS | `~/Library/Application Support/arxiv-browser/` |
| Linux | `~/.config/arxiv-browser/` |

---

## Uninstall

- **Windows**: Control Panel → Programs → arXiv Browser → Uninstall
- **macOS**: Drag the app from Applications to Trash
- **Linux**: Delete the `.AppImage` file

Library data in the path above is not removed automatically (to avoid data loss).

---

## License

[CC BY-NC 4.0](LICENSE) — free for academic research, education, and personal use. Commercial use is not permitted.
