/**
 * arXiv Browser — LangGraph Agent Server
 *
 * Exposes a POST /chat endpoint backed by a LangGraph ReAct agent.
 * The agent can search arXiv, manage the local library, and sync Zotero
 * by calling LangChain tools that wrap the same actions as the browser UI.
 *
 * Environment variables:
 *   AGENT_API_KEY   — axk_… key created in the APIs tab of the desktop app (required)
 *   APP_PORT        — port the Electron app's API server is listening on (default: 7842)
 *   PORT            — port this agent server listens on (default: 3000)
 *   OPENAI_API_KEY  — for gpt-4o-mini (default LLM)
 *   ZOTERO_API_KEY  — Zotero API key (for sync_zotero tool)
 *   ZOTERO_GROUP    — Zotero group ID (for sync_zotero tool)
 *
 * Swap the LLM by uncommenting one line below — no other changes needed.
 *
 * Usage:
 *   cd agent && npm install
 *   AGENT_API_KEY=axk_… OPENAI_API_KEY=sk-… node server.js
 *
 *   curl -X POST http://localhost:3000/chat \
 *        -H "Content-Type: application/json" \
 *        -d '{"message":"find 3 recent papers on RLHF and save the best one"}'
 */

import express from 'express'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { ChatOpenAI } from '@langchain/openai'
import { z } from 'zod'

// ─── Config ────────────────────────────────────────────────────────────────

const APP_PORT    = parseInt(process.env.APP_PORT  || '7842')
const AGENT_KEY   = process.env.AGENT_API_KEY || ''
const SERVER_PORT = parseInt(process.env.PORT || '3000')
const APP_BASE    = `http://127.0.0.1:${APP_PORT}`

if (!AGENT_KEY) {
  console.error('[agent] AGENT_API_KEY env var is required.')
  console.error('[agent] Create a key in the arXiv Browser → APIs tab, then:')
  console.error('[agent]   AGENT_API_KEY=axk_… node server.js')
  process.exit(1)
}

// ─── Local app API client ──────────────────────────────────────────────────
// All library mutations go through the running Electron app so they are
// reflected in the UI immediately (no direct localStorage access needed).

async function appFetch(path, options = {}) {
  const res = await fetch(`${APP_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AGENT_KEY}`,
      'Content-Type':  'application/json',
      ...(options.headers || {}),
    },
  })
  return res.json()
}

// ─── arXiv XML parser (mirrors parseArxivXml in main.js) ──────────────────
// Node.js has no DOMParser — uses regex on the Atom feed.

function parseArxivXml(xml) {
  const entries = []
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g
  let m
  while ((m = entryRe.exec(xml)) !== null) {
    const e   = m[1]
    const get = tag => {
      const r   = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
      const res = r.exec(e)
      return res ? res[1].replace(/<[^>]+>/g, '').trim() : ''
    }
    const rawId   = get('id')
    const arxivId = rawId.replace(/https?:\/\/arxiv\.org\/abs\//, '').replace(/v\d+$/, '')
    const authors = []
    const nameRe  = /<name>([\s\S]*?)<\/name>/g
    let nm
    while ((nm = nameRe.exec(e)) !== null) authors.push(nm[1].trim())
    entries.push({
      id:        `https://arxiv.org/abs/${arxivId}`,
      arxivId,
      title:     get('title').replace(/\s+/g, ' '),
      authors,
      published: get('published'),
      summary:   get('summary').replace(/\s+/g, ' ').slice(0, 600),
      pdfLink:   `https://arxiv.org/pdf/${arxivId}`,
    })
  }
  return entries
}

// ─── Zotero helper ────────────────────────────────────────────────────────

async function fetchZoteroGroup() {
  const key   = process.env.ZOTERO_API_KEY || ''
  const group = process.env.ZOTERO_GROUP   || ''
  if (!key || !group) return []
  const res = await fetch(
    `https://api.zotero.org/groups/${group}/items?itemType=preprint&limit=100&sort=dateAdded&direction=desc`,
    { headers: { 'Zotero-API-Key': key } }
  )
  if (!res.ok) throw new Error(`Zotero fetch failed: ${res.status}`)
  const data = await res.json()
  return (data || []).map(item => {
    const d       = item.data || {}
    const arxivId = (d.archiveID || '').replace('arXiv:', '')
                 || (d.url || '').replace('https://arxiv.org/abs/', '')
    return {
      arxivId,
      title:     d.title || '',
      authors:   (d.creators || []).map(c => ({ name: [c.firstName, c.lastName].filter(Boolean).join(' ') })),
      published: d.date || '',
      summary:   d.abstractNote || '',
      zoteroKey: item.key,
    }
  })
}

// ─── LangChain Tools ──────────────────────────────────────────────────────

const tools = [

  new DynamicStructuredTool({
    name: 'search_arxiv',
    description: 'Search recent arXiv papers by keyword and/or category. Returns titles, abstracts and IDs.',
    schema: z.object({
      query:    z.string().describe('Keywords, title words, or author name'),
      category: z.string().optional().describe('arXiv category e.g. cs.LG, quant-ph, math.CO'),
      max:      z.number().optional().default(10).describe('Max results (1–50, default 10)'),
    }),
    func: async ({ query, category, max = 10 }) => {
      const q = query && category
        ? `(ti:${query} OR abs:${query}) AND cat:${category}`
        : category ? `cat:${category}`
        : query    ? `all:${query}`
        : '*'
      const params = new URLSearchParams({
        search_query: q,
        start:        0,
        max_results:  Math.min(Number(max) || 10, 50),
        sortBy:       'relevance',
        sortOrder:    'descending',
      })
      const res     = await fetch(`https://export.arxiv.org/api/query?${params}`, {
        headers: { 'User-Agent': 'arXiv-Browser-Agent/1.0' },
      })
      const xml     = await res.text()
      const papers  = parseArxivXml(xml)
      return JSON.stringify({ ok: true, papers, count: papers.length })
    },
  }),

  new DynamicStructuredTool({
    name: 'save_paper',
    description: 'Save a paper to the local library by its arXiv ID. Fetches full metadata from arXiv first.',
    schema: z.object({
      arxivId: z.string().describe('arXiv paper ID, e.g. 2301.07041 or 2301.07041v2'),
    }),
    func: async ({ arxivId }) => {
      // Fetch full metadata from arXiv
      const cleanId = arxivId.replace(/v\d+$/, '')
      const params  = new URLSearchParams({ search_query: `id:${cleanId}`, max_results: 1 })
      const res     = await fetch(`https://export.arxiv.org/api/query?${params}`, {
        headers: { 'User-Agent': 'arXiv-Browser-Agent/1.0' },
      })
      const xml     = await res.text()
      const papers  = parseArxivXml(xml)
      if (!papers.length) return JSON.stringify({ ok: false, error: `Paper ${arxivId} not found on arXiv` })
      const result  = await appFetch('/v1/library', { method: 'POST', body: JSON.stringify(papers[0]) })
      return JSON.stringify(result)
    },
  }),

  new DynamicStructuredTool({
    name: 'remove_paper',
    description: 'Remove a saved paper from the local library by its arXiv ID.',
    schema: z.object({
      arxivId: z.string().describe('arXiv ID of the paper to remove'),
    }),
    func: async ({ arxivId }) => {
      const result = await appFetch(`/v1/library/${encodeURIComponent(arxivId)}`, { method: 'DELETE' })
      return JSON.stringify(result)
    },
  }),

  new DynamicStructuredTool({
    name: 'sync_zotero',
    description: 'Pull all preprints from the configured Zotero group and add any missing ones to the local library. Requires ZOTERO_API_KEY and ZOTERO_GROUP env vars on the agent server.',
    schema: z.object({}),
    func: async () => {
      let remote
      try { remote = await fetchZoteroGroup() }
      catch (e) { return JSON.stringify({ ok: false, error: e.message }) }
      if (!remote.length) return JSON.stringify({ ok: true, added: 0, message: 'No papers in Zotero group or Zotero not configured.' })
      let added = 0
      for (const p of remote) {
        if (!p.arxivId) continue
        await appFetch('/v1/library', { method: 'POST', body: JSON.stringify(p) })
        added++
      }
      return JSON.stringify({ ok: true, added })
    },
  }),

  new DynamicStructuredTool({
    name: 'update_note',
    description: 'Add or update the personal note attached to a saved paper.',
    schema: z.object({
      arxivId: z.string().describe('arXiv ID of the saved paper'),
      note:    z.string().describe('Note content (max 5000 chars)'),
    }),
    func: async ({ arxivId, note }) => {
      const result = await appFetch(`/v1/library/${encodeURIComponent(arxivId)}`, {
        method: 'PATCH',
        body:   JSON.stringify({ note: note.slice(0, 5000) }),
      })
      return JSON.stringify(result)
    },
  }),

]

// ─── LLM — swap one line to change provider ───────────────────────────────
//
// Ollama (local, free):
//   import { ChatOllama } from '@langchain/ollama'  // npm i @langchain/ollama
//   const llm = new ChatOllama({ model: 'llama3' })
//
// Mistral (API):
//   import { ChatMistralAI } from '@langchain/mistralai'  // npm i @langchain/mistralai
//   const llm = new ChatMistralAI({ model: 'mistral-small' })
//
// Default — OpenAI gpt-4o-mini:
const llm = new ChatOpenAI({ model: 'gpt-4o-mini' })

// ─── ReAct Agent ──────────────────────────────────────────────────────────

const agent = createReactAgent({ llm, tools })

// ─── Express Server ───────────────────────────────────────────────────────

const app = express()
app.use(express.json({ limit: '64kb' }))

app.get('/health', (_, res) => res.json({ ok: true, app: 'arxiv-agent' }))

app.post('/chat', async (req, res) => {
  const { message, history = [] } = req.body || {}
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: '"message" (string) is required' })
  }
  try {
    const result = await agent.invoke({
      messages: [...history, { role: 'user', content: message }],
    })
    res.json({ reply: result.messages.at(-1).content })
  } catch (e) {
    console.error('[agent] Error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

app.listen(SERVER_PORT, () => {
  console.log(`[agent] Listening on http://localhost:${SERVER_PORT}`)
  console.log(`[agent] Connecting to arXiv Browser at ${APP_BASE}`)
  console.log(`[agent] LLM: gpt-4o-mini (edit server.js to change provider)`)
})
