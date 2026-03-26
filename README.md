# arXiv Browser

A desktop app for searching, saving, and managing arXiv papers — with Zotero sync, AI summaries, Google Drive storage, and team library sharing via GitHub.

---

## Installation

### Requirements

- [Node.js](https://nodejs.org) (LTS version, e.g. 22.x) — install this first if you don't have it

### Getting started

1. Download and unzip this folder
2. Double-click **BUILD.bat**
   - On first run, it installs dependencies and builds the app (may take a few minutes)
   - On subsequent runs, it launches the app directly
3. Once the app opens, you can **pin it to your taskbar** — it will show the correct icon

The installer is also generated at `dist/arXiv Browser Setup.exe` if you want to install it permanently.

---

## Features

### Search
- Search arXiv by category, keywords, author, title, or abstract
- Filter by date range with presets (1 week, 1 month, etc.)
- Paginate through results — load more or load all (up to 2,000)
- In-page find with Ctrl+F

### Library
- Save papers with **+ Library**
- Add personal notes (auto-saved)
- Remove papers — syncs removal to Zotero automatically
- Export as **BibTeX** or **JSON**
- Import from a colleague's JSON export

### AI Assistant
- **Summarize** any paper directly into your notes
- **Chat** with your library — ask questions across all your saved papers
- **Suggestions** — get targeted arXiv search queries based on your library
- Supports OpenAI (GPT-4o-mini) and Anthropic (Claude)

### Team Collaboration
- **Zotero sync** — papers saved to your shared group library automatically
- Each team member keeps their own file (`library-alice.json`, `library-bob.json`)

### Google Drive Integration (Optional)
- Upload PDFs to a shared Google Drive folder
- Automatic CSV log (`papers_log.csv`) tracking all saved papers
- Can be used standalone or combined with Zotero (recommended for teams)
- Requires a Google Drive API key and authorized access to a shared folder

### Agent API (Optional)
- Built-in local HTTP API server for external tool integration
- REST endpoints to search arXiv, manage library, and update notes
- Bearer token authentication with key management UI
- Not required for normal use — intended for advanced automation workflows

### AI Agent (Optional)
- Separate LangGraph-based agent server (`agent/server.js`)
- Conversational interface that can search, save, and manage papers autonomously
- Requires its own `npm install` inside the `agent/` folder
- Experimental — not fully integrated into the main app

---

## Settings

Open the **Settings** tab to configure:

| Setting | Description |
|---|---|
| AI Provider | OpenAI or Anthropic |
| API Key | Your OpenAI or Anthropic key |
| Username | Your name (used for Zotero and GitHub attribution) |
| Storage Mode | Local only, Zotero, Google Drive, or Zotero + Google Drive |
| GitHub Repo | `owner/repo` format, e.g. `mylab/arxiv-library` |
| GitHub Token | Personal access token with `repo` scope |
| Zotero API Key | From [zotero.org/settings/keys](https://www.zotero.org/settings/keys) — enable group read/write |
| Zotero Group ID | The number in your group URL: `zotero.org/groups/`**`1234567`** |
| Google Drive API Key | Your Google Drive API key for PDF uploads |
| Drive Folder ID | The ID of the shared Google Drive folder |

---

## Zotero Setup

1. Create a group at [zotero.org/groups/new](https://www.zotero.org/groups/new)
2. Get an API key at [zotero.org/settings/keys](https://www.zotero.org/settings/keys)
   - Enable **Default Group Permissions: Read/Write**
3. Paste the Group ID (just the number) into Settings
4. Click **Test Connection** to verify
5. Set storage mode to **Zotero** or **Zotero + Google Drive**

Papers saved with **+ Library** will automatically appear in your Zotero group library.

---

## GitHub Team Sync Setup

1. Create a **private** GitHub repo (e.g. `mylab/arxiv-library`)
2. Generate a token at [github.com/settings/tokens](https://github.com/settings/tokens)
   - Classic token, `repo` scope
3. Add repo and token in Settings, click **Save**
4. Use **Push** to upload your library, **Pull** to merge colleagues' libraries

---

## Google Drive Setup

1. Create a Google Drive API key with access to the Drive API
2. Create a shared folder in Google Drive for your team
3. Copy the folder ID from the URL: `drive.google.com/drive/folders/`**`<folder-id>`**
4. Paste the API key and folder ID into Settings
5. Set storage mode to **Google Drive** or **Zotero + Google Drive**

PDFs will be uploaded automatically when you save papers. A CSV log tracks all saved papers in the folder.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| Ctrl+F | Find in search results |
| Enter | Run search |
| Escape | Close find bar |

---

## Data & Privacy

- Your library is stored locally in your browser's localStorage
- API keys are stored locally only — **never** sent to GitHub or Zotero
- Notes are personal and not included in GitHub sync
- In Electron mode, all arXiv requests go directly — no third-party proxies
- In browser mode, some requests may be routed through third-party CORS proxies ([corsproxy.io](https://corsproxy.io) and [api.allorigins.win](https://api.allorigins.win)) to work around browser cross-origin restrictions. These proxies see the request URLs but not your API keys or credentials.

---

## Disclaimer

This application is provided **as-is** for research and educational purposes only. The author(s) make no warranties of any kind, express or implied, and accept no liability for any damages, data loss, security issues, or other problems arising from the use of this software.

**Use at your own risk.** In particular:

- **API keys**: You are responsible for safeguarding your own API keys (OpenAI, Anthropic, Zotero, GitHub, Google Drive). Never share them or commit them to public repositories. The app stores keys locally on your machine, but you are solely responsible for their security.
- **Third-party services**: This app interacts with external APIs (arXiv, Zotero, GitHub, Google Drive, OpenAI, Anthropic). The author(s) are not responsible for changes, outages, or terms-of-service issues with these services.
- **No guarantee of correctness**: AI-generated summaries and suggestions may be inaccurate or incomplete. Always verify information against the original papers.

This software is not affiliated with or endorsed by arXiv, Cornell University, Zotero, OpenAI, Anthropic, or any other third party.
