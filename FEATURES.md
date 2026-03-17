# FEATURES.md — Vickery Digital Workspace

## 1. Current Feature Inventory

### Launchpad (main content area)
- **Your Apps grid** — Hardcoded cards for Chorify, Needledrop, MonoLine with status indicators (live / in dev / pipeline). Links open in new tabs.
- **Dev Console grid** — 11 hardcoded tool links (Vercel, Turso, GitHub, Cloudflare, Claude, etc.). Static HTML, not configurable.
- **My Tools grid** — Dynamic section populated from the database. Shows all saved links where `group !== 'Panel'`. Each card displays the link's emoji icon and name, with a hover-reveal "open in new tab" button.
- **Clock and greeting** — Time-of-day greeting ("Good morning, Theron"), live clock, and date display. Updates every 30 seconds.
- **Footer** — Static location line and a hardcoded infrastructure budget bar (~$19 / $60).

### Side Panel (right)
- **Tabbed iframe viewer** — Links with `group: 'Panel'` render as tabs. Clicking a tab lazy-loads the URL in a sandboxed iframe. Only the active tab's iframe is loaded; others stay idle until selected.
- **Panel controls** — Reload current iframe, pop out to new tab, close panel entirely. Resizable via drag handle (min 260px, max 60vw).
- **Loading and error states** — Spinner with label while loading; error card with "open in new tab" fallback if iframe fails.
- **Auto-seed** — On first-ever login (guarded by `localStorage.panel_seeded`), three default panel apps (Nexus Chat, KanbanFlow, Pastewise) are created via API.

### Link Manager (admin sidebar)
- **Add link form** — URL input (with auto-name-from-hostname), name field, emoji picker (22 preset emojis), section/group selector (7 groups: My Tools, Dev, AI, Research, Business, Other, Panel).
- **Saved links list** — Filterable by group tab. Each row shows icon, name, group, and hostname. Up/down reorder buttons (disabled at boundaries), delete with confirmation dialog.
- **Batch reorder** — On every up/down move, a `PUT /api/links/reorder` call updates all positions server-side.

### Auth
- **Access key login** — Single password field. Key stored in `localStorage`, sent as `Authorization: Bearer` header. Session auto-restores on page load if key exists and API responds 200.
- **Sign out** — Clears `localStorage` and reloads.

### API
- Full CRUD for `custom_links` (Create, Read, Update, Delete) plus batch reorder. Input validated with Zod schemas. CORS locked to production domain + localhost.

---

## 2. Gap Analysis

Compared against typical personal dashboards (e.g., Heimdall, Homer, Flame, Dashy), the Workspace is missing several table-stakes features:

| Gap | Impact | Notes |
|-----|--------|-------|
| **No search or filter on the launchpad** | High | With 11 hardcoded + N custom links, there's no way to find a link without scanning visually. Every comparable dashboard has a search bar (usually with `/` or `Cmd+K` hotkey). |
| **No inline editing of saved links** | High | To change a link's name, URL, icon, or group, you must delete and re-add it. The PUT endpoint exists but the frontend never calls it. |
| **No favicons** | Medium | Every link uses a manually-selected emoji. Competitor dashboards auto-fetch the site's favicon, which is faster to scan and requires zero user effort. |
| **No keyboard shortcuts** | Medium | No hotkeys for search, panel toggle, admin open/close. Power users expect at least `Cmd+K` for search and number keys for tabs. |
| **No drag-and-drop reorder** | Medium | Reordering is done with up/down arrow buttons, one swap at a time. Drag-and-drop is the expected UX for list reordering. |
| **No import/export** | Low-Med | No way to back up links or migrate. A JSON export/import would provide data portability. |
| **No link health checking** | Low | Dead links (404s, expired domains) accumulate silently. An automated checker could flag them. |
| **Hardcoded sections** | Low-Med | "Your Apps" and "Dev Console" are entirely hardcoded in HTML. Adding/removing an app or dev tool requires a code change and redeploy. |
| **No light/dark mode toggle** | Low | The app is dark-mode only. Some users (or daytime use) would benefit from a light theme. |
| **Budget bar is static** | Low | The infrastructure budget bar (`~$19 / $60`) is hardcoded. It never updates. |

---

## 3. Prioritized Feature Roadmap

### Impact vs. Effort Matrix

```
                        HIGH IMPACT
                            |
         Strategic          |          Quick Wins
      (build carefully)     |       (do these first)
                            |
    - Drag-and-Drop         |  - Link Search / Cmd+K
      Reorder               |  - Inline Edit Links
    - Make App Cards        |  - Auto-Favicon Display
      Dynamic (DB-backed)   |  - Keyboard Shortcuts
                            |
  HIGH ─────────────────────┼───────────────────── LOW
  EFFORT                    |                    EFFORT
                            |
         Avoid              |         Nice-to-Have
    (not worth it now)      |       (when bored)
                            |
    - Automated Link        |  - Import/Export JSON
      Health Checker        |  - Light/Dark Mode Toggle
    - Multi-user with       |  - Panel tab reorder
      per-user link lists   |    via drag
                            |
                            |
                        LOW IMPACT
```

### Categorized

#### Quick Wins (High Impact / Low Effort)

| Feature | Status | Why it matters |
|---------|--------|----------------|
| **Link Search / `Cmd+K`** | [x] Done | Instant access to any link. The most-requested feature on every dashboard. ~50 lines of JS + a modal. |
| **Inline Edit Links** | [ ] Planned | The `PUT /api/links/:id` endpoint already exists. The frontend just needs an edit button that swaps a link row into an editable form. ~80 lines of JS. |
| **Auto-Favicon Display** | [x] Done | Replace emoji-only icons with real favicons via Google's favicon API (`https://www.google.com/s2/favicons?domain=...&sz=32`). Falls back to the emoji. ~15 lines of JS. |
| **Keyboard Shortcuts** | [x] Done | `/` and `Cmd+K` focus search, `Escape` blurs search then closes admin. ~30 lines of JS. |

#### Strategic (High Impact / High Effort)

| Feature | Why it matters |
|---------|----------------|
| **Drag-and-Drop Reorder** | Much better UX than arrow buttons. Requires implementing pointer event tracking, placeholder rendering, and drop-zone logic — or pulling in a small library like SortableJS (~15KB). |
| **Make App Cards Dynamic** | "Your Apps" and "Dev Console" are hardcoded HTML. Making them DB-backed (a new `group` value like `"Apps"` or `"Console"`) would let you add/remove them from the Link Manager without redeploying. Requires restructuring the launchpad rendering. |

#### Nice-to-Have (Low Impact / Low Effort)

| Feature | Why it matters |
|---------|----------------|
| **Import/Export JSON** | Download all links as JSON; upload to restore. ~40 lines of JS, no API changes (use existing GET/POST). Good for backup peace of mind. |
| **Light/Dark Mode Toggle** | Swap CSS variables via a toggle. ~30 lines of CSS + 10 lines of JS. Low impact because the user primarily works in dark environments. |
| **Panel Tab Reorder via Drag** | Specifically for panel tabs, dragging them left/right to reorder. Lower priority than general drag-and-drop. |

#### Avoid (Low Impact / High Effort)

| Feature | Why it matters to avoid |
|---------|------------------------|
| **Automated Link Health Checker** | Requires a scheduled job (cron or Vercel CRON) to HEAD-request every link, handle timeouts, store results, and display status. High complexity for a personal dashboard with ~20 links you'd notice are broken by using them. |
| **Multi-User with Per-User Link Lists** | The app currently uses a single `primary_user` identity. Adding real user management (registration, per-user scoping, user switcher) would require auth system changes, DB schema changes, and UI for user management. Overkill for 1-2 people. |

---

## 4. Quick Wins: Implementation Plan

### 4.1 Link Search / `Cmd+K` Modal

**Goal**: A search overlay that filters across all links (hardcoded + custom) and lets the user open one with Enter or click.

#### Frontend Changes (`frontend/index.html`)

**HTML** — Add a search modal after the `#app` div:

```html
<div id="searchOverlay" class="search-overlay">
  <div class="search-modal">
    <input type="text" id="searchInput" class="search-input" placeholder="Search links…" autocomplete="off" spellcheck="false">
    <div class="search-results" id="searchResults"></div>
    <div class="search-hint">↑↓ navigate · enter open · esc close</div>
  </div>
</div>
```

**CSS** — Add styles:

```css
.search-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:500; display:none; align-items:flex-start; justify-content:center; padding-top:18vh; }
.search-overlay.open { display:flex; }
.search-modal { background:var(--surface); border:1px solid var(--border-md); border-radius:12px; width:460px; max-width:90vw; overflow:hidden; box-shadow:0 16px 48px rgba(0,0,0,0.5); }
.search-input { width:100%; padding:16px 20px; background:transparent; border:none; border-bottom:1px solid var(--border); color:var(--text); font-size:15px; font-family:'DM Sans',sans-serif; outline:none; }
.search-input::placeholder { color:var(--text-dim); }
.search-results { max-height:320px; overflow-y:auto; }
.search-result { display:flex; align-items:center; gap:10px; padding:10px 20px; cursor:pointer; transition:background 0.1s; }
.search-result:hover, .search-result.selected { background:var(--surface2); }
.search-result-icon { font-size:14px; width:20px; text-align:center; flex-shrink:0; }
.search-result-name { font-size:13px; font-weight:500; }
.search-result-group { font-size:11px; color:var(--text-dim); margin-left:auto; font-family:'Fira Code',monospace; }
.search-hint { padding:8px 20px; font-size:10px; color:var(--text-dim); border-top:1px solid var(--border); font-family:'Fira Code',monospace; text-align:center; }
```

**JS** — Add search logic:

```js
// 1. Build a unified search index (call after loadLinks completes)
function buildSearchIndex() {
  const index = []

  // Hardcoded dev console links (scrape from DOM)
  document.querySelectorAll('.tool-link').forEach(a => {
    index.push({ name: a.textContent.trim(), url: a.href, icon: a.querySelector('.tool-icon')?.textContent || '', group: 'Dev Console', source: 'hardcoded' })
  })

  // Hardcoded app cards
  document.querySelectorAll('.app-card:not(.placeholder)').forEach(a => {
    const name = a.querySelector('.app-name')?.textContent || ''
    index.push({ name, url: a.href, icon: a.querySelector('.app-icon')?.textContent || '', group: 'Apps', source: 'hardcoded' })
  })

  // Custom links from DB
  tools.forEach(t => {
    index.push({ name: t.name, url: t.url, icon: t.icon, group: t.group, source: 'custom', id: t.id })
  })

  return index
}

// 2. Render filtered results
let searchIndex = [], searchSelectedIdx = 0

function openSearch() {
  searchIndex = buildSearchIndex()
  const overlay = document.getElementById('searchOverlay')
  const input = document.getElementById('searchInput')
  overlay.classList.add('open')
  input.value = ''
  input.focus()
  renderSearchResults('')
}

function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open')
}

function renderSearchResults(query) {
  const results = document.getElementById('searchResults')
  const q = query.toLowerCase().trim()
  const filtered = q ? searchIndex.filter(item =>
    item.name.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
  ) : searchIndex.slice(0, 8) // show first 8 when empty

  searchSelectedIdx = 0
  results.innerHTML = ''
  if (!filtered.length) {
    results.innerHTML = '<div style="padding:20px;text-align:center;font-size:12px;color:var(--text-dim)">No matches</div>'
    return
  }

  filtered.forEach((item, i) => {
    const div = document.createElement('div')
    div.className = 'search-result' + (i === 0 ? ' selected' : '')
    div.innerHTML = `<span class="search-result-icon">${item.icon}</span><span class="search-result-name">${esc(item.name)}</span><span class="search-result-group">${esc(item.group)}</span>`
    div.addEventListener('click', () => { openSearchResult(item); closeSearch() })
    results.appendChild(div)
  })
}

function openSearchResult(item) {
  if (item.group === 'Panel') {
    // Switch to panel tab
    const panelTool = panelTools.find(t => t.id === item.id)
    if (panelTool) { showPanel(); switchTab(panelTool.id) }
  } else {
    window.open(item.url, '_blank')
  }
}

// 3. Keyboard handling
document.getElementById('searchInput').addEventListener('input', e => {
  renderSearchResults(e.target.value)
})

document.getElementById('searchInput').addEventListener('keydown', e => {
  const results = document.querySelectorAll('.search-result')
  if (e.key === 'ArrowDown') { e.preventDefault(); searchSelectedIdx = Math.min(searchSelectedIdx + 1, results.length - 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); searchSelectedIdx = Math.max(searchSelectedIdx - 1, 0) }
  else if (e.key === 'Enter') { e.preventDefault(); results[searchSelectedIdx]?.click() }
  else if (e.key === 'Escape') { closeSearch(); return }
  else return
  results.forEach((r, i) => r.classList.toggle('selected', i === searchSelectedIdx))
})

document.getElementById('searchOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeSearch()
})

// 4. Global hotkey: Cmd+K or Ctrl+K
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
})
```

**API changes**: None.

---

### 4.2 Inline Edit Links

**Goal**: Click an edit button on any link row in the Link Manager to modify its name, URL, icon, or group in-place, then save via the existing `PUT /api/links/:id` endpoint.

#### Frontend Changes (`frontend/index.html`)

**CSS** — Add styles for the edit state:

```css
.link-row.editing { flex-direction:column; align-items:stretch; gap:8px; padding:12px; }
.link-row.editing .edit-fields { display:flex; flex-direction:column; gap:6px; }
.link-row.editing .edit-row { display:flex; gap:6px; align-items:center; }
.link-row.editing .edit-row label { font-size:10px; color:var(--text-dim); width:36px; flex-shrink:0; font-family:'Fira Code',monospace; }
.link-row.editing .edit-row input, .link-row.editing .edit-row select { flex:1; background:var(--surface2); border:1px solid var(--border); border-radius:5px; padding:5px 8px; color:var(--text); font-size:12px; font-family:'DM Sans',sans-serif; outline:none; }
.link-row.editing .edit-row input:focus, .link-row.editing .edit-row select:focus { border-color:var(--orange-border); }
.link-row.editing .edit-actions { display:flex; gap:6px; justify-content:flex-end; }
.edit-save-btn { background:var(--orange); border:none; border-radius:5px; padding:5px 14px; color:#fff; font-size:11px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; }
.edit-save-btn:hover { opacity:0.87; }
.edit-cancel-btn { background:transparent; border:1px solid var(--border); border-radius:5px; padding:5px 14px; color:var(--text-muted); font-size:11px; cursor:pointer; font-family:'DM Sans',sans-serif; }
.edit-cancel-btn:hover { color:var(--text); border-color:var(--border-md); }
```

**JS** — In the `renderList()` function, add an edit button to the `link-row-actions` div (alongside the existing up/down/delete buttons):

```html
<!-- Add this button before the up arrow button in the row innerHTML template -->
<button class="icon-btn edit" data-id="${t.id}" title="Edit">✎</button>
```

Then add the edit click handler after the existing `.del` handler:

```js
list.querySelectorAll('.edit').forEach(b => b.addEventListener('click', e => {
  const id = e.currentTarget.dataset.id
  const link = tools.find(t => t.id === id)
  if (!link) return
  const row = e.currentTarget.closest('.link-row')
  row.className = 'link-row editing'
  row.innerHTML = `
    <div class="edit-fields">
      <div class="edit-row"><label>name</label><input type="text" class="edit-name" value="${esc(link.name)}" maxlength="32"></div>
      <div class="edit-row"><label>url</label><input type="url" class="edit-url" value="${esc(link.url)}"></div>
      <div class="edit-row"><label>group</label><select class="edit-group">${GROUPS.map(g => `<option value="${g}"${g === link.group ? ' selected' : ''}>${g}</option>`).join('')}</select></div>
    </div>
    <div class="edit-actions">
      <button class="edit-cancel-btn">Cancel</button>
      <button class="edit-save-btn">Save</button>
    </div>`

  row.querySelector('.edit-cancel-btn').addEventListener('click', () => renderList())

  row.querySelector('.edit-save-btn').addEventListener('click', async () => {
    const newName = row.querySelector('.edit-name').value.trim()
    const newUrl = row.querySelector('.edit-url').value.trim()
    const newGroup = row.querySelector('.edit-group').value
    if (!newName || !newUrl) return

    const saveBtn = row.querySelector('.edit-save-btn')
    saveBtn.textContent = 'Saving…'; saveBtn.disabled = true
    try {
      const updated = await apiFetch('/api/links/' + id, {
        method: 'PUT',
        body: JSON.stringify({ name: newName, url: newUrl, group: newGroup })
      })
      // Update the local tools array
      const idx = tools.findIndex(t => t.id === id)
      if (idx !== -1) tools[idx] = { ...tools[idx], ...updated }
      derivePanelTools(); renderMain(); renderList(); renderFilterTabs()
      buildPanelTabs(); buildIframeLayers()
    } catch (err) {
      alert('Could not save — check connection')
      saveBtn.textContent = 'Save'; saveBtn.disabled = false
    }
  })

  // Auto-focus the name field
  row.querySelector('.edit-name').focus()
}))
```

**API changes**: None — `PUT /api/links/:id` already handles partial updates.

---

### 4.3 Auto-Favicon Display

**Goal**: Show the real website favicon next to each link instead of (or alongside) the emoji. Use Google's public favicon service as the source. Fall back to the emoji if the favicon fails to load.

#### Frontend Changes (`frontend/index.html`)

**JS** — Create a helper function:

```js
function faviconUrl(url) {
  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
  } catch { return '' }
}
```

**Modify `renderMain()`** — Change the card innerHTML to include a favicon `<img>` with an `onerror` fallback:

```js
// Replace the current icon span:
//   <span class="tool-icon">${t.icon}</span>
// With:
const fav = faviconUrl(t.url)
card.innerHTML = `
  <span class="tool-icon">${fav ? `<img src="${esc(fav)}" width="14" height="14" style="border-radius:2px;vertical-align:middle" onerror="this.replaceWith(document.createTextNode('${t.icon}'))">` : t.icon}</span>
  <span class="custom-tool-label">${esc(t.name)}</span>
  <div class="custom-tool-actions">
    <a class="tool-action-btn" href="${esc(t.url)}" target="_blank" rel="noopener" title="Open in new tab">↗</a>
  </div>`
```

**Modify `renderList()` in the Link Manager** — Same pattern for the link row icon:

```js
// Replace:
//   <span class="link-row-icon">${t.icon}</span>
// With:
const fav = faviconUrl(t.url)
// In the row innerHTML:
`<span class="link-row-icon">${fav ? `<img src="${esc(fav)}" width="14" height="14" style="border-radius:2px" onerror="this.replaceWith(document.createTextNode('${t.icon}'))">` : t.icon}</span>`
```

**Modify `buildPanelTabs()`** — Add favicon to panel tabs:

```js
// In the tab button innerHTML, prepend a favicon:
const fav = faviconUrl(t.url)
btn.innerHTML = `<span>${fav ? `<img src="${esc(fav)}" width="12" height="12" style="border-radius:2px;vertical-align:middle" onerror="this.replaceWith(document.createTextNode('${t.icon}'))">` : t.icon}</span>${esc(t.name)}`
```

**CSS** — No changes needed. The `<img>` inherits layout from existing flex containers.

**API changes**: None.

**Note on `onerror` and XSS**: The `onerror` handler uses `document.createTextNode()` which is safe — it cannot execute injected HTML. The `t.icon` value is always a short emoji string validated by Zod (`max(8)`).

---

### 4.4 Keyboard Shortcuts

**Goal**: Add global keyboard shortcuts for the most common actions.

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open search (covered in 4.1) |
| `Escape` | Close search > Close admin sidebar (already exists) |
| `Cmd/Ctrl + .` | Toggle admin sidebar |
| `Cmd/Ctrl + \` | Toggle side panel |
| `1` – `9` | Switch to panel tab N (only when search is not open and no input is focused) |

#### Frontend Changes (`frontend/index.html`)

**JS** — Replace the existing `keydown` listener and consolidate:

```js
// Remove the existing line:
//   document.addEventListener('keydown', e => { if (e.key==='Escape') closeAdmin() })

// Replace with a unified handler:
document.addEventListener('keydown', e => {
  const searchOpen = document.getElementById('searchOverlay').classList.contains('open')
  const adminOpen = document.getElementById('adminSidebar').classList.contains('open')
  const inInput = ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)

  // Escape: close search first, then admin
  if (e.key === 'Escape') {
    if (searchOpen) { closeSearch(); return }
    if (adminOpen) { closeAdmin(); return }
  }

  // Cmd+K: open search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
    return
  }

  // Cmd+.: toggle admin sidebar
  if ((e.metaKey || e.ctrlKey) && e.key === '.') {
    e.preventDefault()
    adminOpen ? closeAdmin() : openAdmin()
    return
  }

  // Cmd+\: toggle side panel
  if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
    e.preventDefault()
    panelVisible ? hidePanel() : showPanel()
    return
  }

  // Number keys 1-9: switch panel tab (only when not in an input)
  if (!inInput && !searchOpen && e.key >= '1' && e.key <= '9') {
    const idx = parseInt(e.key) - 1
    if (idx < panelTools.length) {
      if (!panelVisible) showPanel()
      switchTab(panelTools[idx].id)
    }
  }
})
```

**Optional CSS** — Add a keyboard shortcut hint to the header area:

```html
<!-- In the .header-right div, before the time block -->
<button class="tool-link" id="searchBtn" style="padding:5px 10px;font-size:11px;gap:5px;cursor:pointer;background:var(--surface);">
  <span style="color:var(--text-dim)">🔍</span>
  <span style="color:var(--text-dim);font-family:'Fira Code',monospace;font-size:10px">⌘K</span>
</button>
```

```js
document.getElementById('searchBtn').addEventListener('click', openSearch)
```

**API changes**: None.
