# ClipSync Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
│                    (Copy text anywhere)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM CLIPBOARD                              │
│                   (Windows Clipboard)                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ELECTRON MAIN PROCESS                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  main.js - Clipboard Monitoring (500ms polling)          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  setInterval(() => {                               │  │  │
│  │  │    const currentText = clipboard.readText();       │  │  │
│  │  │    if (currentText !== lastClipboardText) {        │  │  │
│  │  │      mainWindow.webContents.send(                  │  │  │
│  │  │        'clipboard-changed', currentText            │  │  │
│  │  │      );                                             │  │  │
│  │  │    }                                                │  │  │
│  │  │  }, 500);                                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ IPC Event
                             │ 'clipboard-changed'
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRELOAD BRIDGE                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  preload.js - Context Bridge                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  contextBridge.exposeInMainWorld('electronAPI', {  │  │  │
│  │  │    onClipboardChanged: (callback) => {             │  │  │
│  │  │      const sub = (event, text) => callback(text);  │  │  │
│  │  │      ipcRenderer.on('clipboard-changed', sub);     │  │  │
│  │  │      return () => ipcRenderer.removeListener(...); │  │  │
│  │  │    }                                                │  │  │
│  │  │  });                                                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ window.electronAPI
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REACT RENDERER PROCESS                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  App.jsx - Event Listener                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  useEffect(() => {                                 │  │  │
│  │  │    if (window.electronAPI) {                       │  │  │
│  │  │      const cleanup =                               │  │  │
│  │  │        window.electronAPI.onClipboardChanged(      │  │  │
│  │  │          async (text) => {                         │  │  │
│  │  │            await addClip(text);                    │  │  │
│  │  │          }                                          │  │  │
│  │  │        );                                           │  │  │
│  │  │      return cleanup;                               │  │  │
│  │  │    }                                                │  │  │
│  │  │  }, [addClip]);                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE STORE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  useClipStore.js - State Management                     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  addClip: async (content) => {                     │  │  │
│  │  │    // 1. Validate content                          │  │  │
│  │  │    if (!shouldCapture(content)) return;            │  │  │
│  │  │                                                     │  │  │
│  │  │    // 2. Check duplicates                          │  │  │
│  │  │    if (isDuplicate(content, clips)) return;        │  │  │
│  │  │                                                     │  │  │
│  │  │    // 3. Detect type                               │  │  │
│  │  │    const type = detectClipType(content);           │  │  │
│  │  │                                                     │  │  │
│  │  │    // 4. Save to IndexedDB                         │  │  │
│  │  │    const newClip = await addClipToDB({...});       │  │  │
│  │  │                                                     │  │  │
│  │  │    // 5. Update UI state                           │  │  │
│  │  │    set({ clips: [newClip, ...clips] });            │  │  │
│  │  │                                                     │  │  │
│  │  │    // 6. Sync to backend (if authenticated)        │  │  │
│  │  │    await apiClient.createClip({...});              │  │  │
│  │  │  }                                                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│     INDEXEDDB             │  │    BACKEND API           │
│   (Local Storage)         │  │  (Cloud Sync)            │
│                           │  │                          │
│  • Clips History          │  │  • User Authentication   │
│  • Snippets               │  │  • Cloud Storage         │
│  • Settings               │  │  • Team Sharing          │
│  • Offline Support        │  │  • Real-time Sync        │
└───────────────────────────┘  └──────────────────────────┘
                │                           │
                │                           ▼
                │              ┌──────────────────────────┐
                │              │    WEBSOCKET             │
                │              │  (Real-time Updates)     │
                │              │                          │
                │              │  • clip:created          │
                │              │  • clip:updated          │
                │              │  • clip:deleted          │
                │              │  • team-clip:*           │
                │              └──────────────────────────┘
                │                           │
                └───────────────┬───────────┘
                                ▼
                ┌─────────────────────────────────────┐
                │         REACT UI                    │
                │                                     │
                │  • Navigation (Lucide Icons)        │
                │  • ClipList                         │
                │  • DetailSidebar                    │
                │  • FilterBar                        │
                │  • CommandPalette                   │
                │  • SnippetLibrary                   │
                └─────────────────────────────────────┘
```

---

## 🔄 Data Flow Sequence

### 1. Clipboard Capture Flow
```
User Copies Text
    ↓
System Clipboard Updated
    ↓
Electron Main Process Detects Change (500ms polling)
    ↓
IPC Event: 'clipboard-changed' → Renderer
    ↓
Preload Bridge: window.electronAPI.onClipboardChanged()
    ↓
React useEffect Hook Receives Text
    ↓
useClipStore.addClip(text)
    ↓
Validation & Type Detection
    ↓
Save to IndexedDB
    ↓
Update React State
    ↓
UI Re-renders with New Clip
    ↓
(Optional) Sync to Backend API
    ↓
(Optional) WebSocket Broadcast to Other Devices
```

### 2. Icon Rendering Flow
```
Component Import
    ↓
import { Clipboard } from 'lucide-react'
    ↓
JSX Rendering
    ↓
<Clipboard className="w-4 h-4" strokeWidth={2} />
    ↓
React Component Renders SVG
    ↓
Optimized SVG Path
    ↓
Browser Displays Icon
```

### 3. Release Build Flow
```
Developer Runs: npm run release:build
    ↓
1. Build Web App (React + Vite)
    ↓
2. Build Desktop App (Electron Builder)
    ↓
3. Generate Installers (.exe files)
    ↓
4. Run copy-builds.js Script
    ↓
5. Copy Files to /release/windows/
    ↓
6. Calculate SHA256 Checksums
    ↓
7. Generate checksums.txt
    ↓
8. Display Summary
    ↓
Ready for Distribution
```

---

## 🔧 Component Architecture

```
App.jsx (Root)
├── Navigation.jsx
│   ├── Logo (Clipboard Icon)
│   ├── Tabs (History, Team, Pinned)
│   ├── Search Input (Search Icon)
│   ├── Sync Status (CheckCircle2/AlertCircle/WifiOff)
│   ├── Settings Button (Settings Icon)
│   └── User Menu / Login (LogIn Icon)
│
├── FilterBar.jsx
│   └── Type Filters (All, Code, JSON, URL, etc.)
│
├── ClipList.jsx
│   └── ClipCard.jsx (Multiple)
│       ├── Content Preview
│       ├── Type Badge
│       ├── Timestamp
│       └── Actions (Copy, Pin, Delete)
│
├── DetailSidebar.jsx
│   ├── Clip Details
│   ├── Metadata
│   ├── Transformations
│   └── Share Button
│
├── FloatingActionButton.jsx
│   └── Quick Actions
│
├── CommandPalette.jsx (Modal)
│   ├── Search Input
│   ├── Recent Clips
│   └── Quick Actions
│
├── SnippetLibrary.jsx (Modal)
│   ├── Snippet List
│   ├── Categories
│   └── Create/Edit Forms
│
├── DevTools.jsx (Modal)
│   ├── Code Formatters
│   ├── Encoders/Decoders
│   └── Utilities
│
├── GitHelper.jsx (Modal)
│   ├── Commit Message Generator
│   ├── Branch Name Generator
│   └── PR Description Generator
│
└── WorkflowAutomation.jsx (Modal)
    ├── Workflow List
    ├── Workflow Editor
    └── Trigger Configuration
```

---

## 🗄️ State Management

```
Zustand Stores
├── useClipStore
│   ├── clips: Clip[]
│   ├── selectedClip: Clip | null
│   ├── searchQuery: string
│   ├── activeTab: 'history' | 'team' | 'pinned'
│   ├── activeFilter: string
│   ├── isLoading: boolean
│   ├── error: string | null
│   └── Actions:
│       ├── initialize()
│       ├── addClip(content)
│       ├── deleteClip(id)
│       ├── togglePin(id)
│       ├── copyClip(clip)
│       ├── selectClip(clip)
│       ├── setSearchQuery(query)
│       ├── setActiveTab(tab)
│       └── setActiveFilter(filter)
│
├── useAuthStore
│   ├── user: User | null
│   ├── isAuthenticated: boolean
│   ├── isLoading: boolean
│   ├── token: string | null
│   └── Actions:
│       ├── initialize()
│       ├── login(credentials)
│       ├── logout()
│       └── updateProfile(data)
│
└── useTeamStore
    ├── teams: Team[]
    ├── activeTeam: Team | null
    ├── teamClips: Map<teamId, Clip[]>
    └── Actions:
        ├── fetchTeams()
        ├── createTeam(data)
        ├── joinTeam(code)
        ├── leaveTeam(id)
        └── shareClip(teamId, clipId)
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

1. Context Isolation (Electron)
   ├── Preload script runs in isolated context
   ├── Only exposed APIs available to renderer
   └── No direct Node.js access from renderer

2. Content Security Policy
   ├── Restrict script sources
   ├── Prevent XSS attacks
   └── Validate all external resources

3. Data Sanitization
   ├── Detect sensitive patterns (passwords, API keys)
   ├── Redact before storage
   └── Warn user about sensitive data

4. Encryption (Backend)
   ├── End-to-end encryption for synced data
   ├── TLS for all API communications
   └── Encrypted storage for sensitive settings

5. Authentication
   ├── JWT tokens for API access
   ├── Secure token storage
   └── Automatic token refresh
```

---

## 📊 Performance Optimizations

```
1. Clipboard Monitoring
   ├── Polling interval: 500ms (balanced)
   ├── Duplicate detection (skip redundant processing)
   └── Debounced UI updates

2. React Rendering
   ├── Virtualized lists for large clip history
   ├── Memoized components (React.memo)
   ├── Lazy loading for modals
   └── Code splitting for routes

3. Storage
   ├── IndexedDB for local persistence
   ├── Indexed queries for fast search
   ├── Pagination for large datasets
   └── Background sync for cloud storage

4. Icons
   ├── Tree-shaking (only used icons bundled)
   ├── SVG optimization
   ├── Cached rendering
   └── Consistent sizing (reduced reflows)

5. Build Optimization
   ├── Vite for fast builds
   ├── Code minification
   ├── Asset compression
   └── Lazy loading of non-critical code
```

---

## 🚀 Deployment Architecture

```
Development
├── Local Dev Server (Vite)
├── Hot Module Replacement
├── Source Maps
└── Dev Tools Enabled

Production Build
├── Optimized Bundle
├── Minified Code
├── Compressed Assets
└── Source Maps (optional)

Distribution
├── Windows Installer (.exe)
│   ├── NSIS Installer
│   ├── Desktop Shortcut
│   ├── Start Menu Entry
│   └── Auto-update Support
│
├── Portable Version (.exe)
│   ├── No Installation Required
│   ├── USB Drive Compatible
│   └── Standalone Executable
│
└── Release Folder
    ├── Checksums (SHA256)
    ├── Release Notes
    ├── Changelog
    └── Documentation
```

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Architecture:** Electron + React + Zustand + IndexedDB
