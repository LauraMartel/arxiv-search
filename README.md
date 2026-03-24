# arXiv Browser

A desktop app for searching, saving, and managing arXiv papers — with Zotero sync, AI summaries, Google Drive storage, and team library sharing via GitHub.

---

## Running the App

### Requirements

- [Node.js](https://nodejs.org) (LTS version, e.g. 22.x) — install this first if you don't have it

### First time setup

1. Download and unzip this folder
2. Open a terminal:
   - **Windows**: Press Windows key, type `cmd`, right-click **Command Prompt** → **Run as administrator**
   - **Mac/Linux**: Open Terminal
3. Navigate to the app folder:
   ```
   cd /path/to/arxiv-build
   ```
4. Install dependencies (one time only):
   ```
   npm install
   ```

### Launch the app

From the same folder in your terminal (no admin needed after first install):
```
npm start
```

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
- **GitHub sync** — push/pull libraries with colleagues via a shared repo
- Each team member keeps their own file (`library-alice.json`, `library-bob.json`)

### Google Drive Integration
- Upload PDFs to a shared Google Drive folder
- Automatic CSV log (`papers_log.csv`) tracking all saved papers
- Can be used standalone or combined with Zotero (recommended for teams)

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
