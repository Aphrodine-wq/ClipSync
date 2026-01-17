# ClipSync - IDE Integrations Guide

## 🎯 Overview

ClipSync integrates seamlessly with popular IDEs and code editors, bringing clipboard management, snippets, and developer tools directly into your workflow.

---

## 📦 Available Integrations

### 1. **VS Code Extension** ✅ READY

**Installation:**
```bash
# From VS Code Marketplace
ext install clipsync.clipsync-vscode

# Or build from source
cd Yank/vscode-extension
npm install
npm run compile
npm run package
# Install the .vsix file
```

**Features:**
- ✅ Clipboard history sidebar
- ✅ Snippet library integration
- ✅ Team clips view
- ✅ Quick paste (Ctrl+Shift+V)
- ✅ Save selection as snippet (Ctrl+Shift+S)
- ✅ Transform text (Ctrl+Shift+T)
- ✅ Format code (JSON, SQL, XML, HTML, CSS)
- ✅ Generate commit messages
- ✅ Test regex patterns
- ✅ Compare text (diff)
- ✅ Share with team
- ✅ Context menu integration

**Commands:**
| Command | Shortcut | Description |
|---------|----------|-------------|
| ClipSync: Open Panel | Ctrl+Shift+V | Open ClipSync panel |
| ClipSync: Paste from History | Ctrl+Shift+H | Quick paste menu |
| ClipSync: Save as Snippet | Ctrl+Shift+S | Save selection |
| ClipSync: Transform Text | Ctrl+Shift+T | Transform selection |
| ClipSync: Format Code | - | Format code |
| ClipSync: Share with Team | - | Share with team |
| ClipSync: Generate Commit | - | Generate commit message |
| ClipSync: Test Regex | - | Test regex pattern |
| ClipSync: Compare Text | - | Diff tool |

**Configuration:**
```json
{
  "clipsync.enabled": true,
  "clipsync.autoCapture": true,
  "clipsync.maxHistory": 100,
  "clipsync.syncEnabled": false,
  "clipsync.apiUrl": "http://localhost:3001",
  "clipsync.showNotifications": true
}
```

---

### 2. **Cursor Integration** ✅ COMPATIBLE

**Installation:**
Cursor is VS Code-based, so the VS Code extension works directly!

```bash
# Install from VS Code Marketplace
# Or use the same .vsix file
```

**Additional Features for Cursor:**
- ✅ AI-powered snippet suggestions
- ✅ Context-aware clipboard
- ✅ Smart paste recommendations
- ✅ Integrated with Cursor's AI

**Cursor-Specific Commands:**
- `ClipSync: AI Suggest from Clipboard` - Get AI suggestions
- `ClipSync: Smart Paste` - Context-aware paste
- `ClipSync: Explain Clip` - AI explains clipboard content

---

### 3. **JetBrains IDEs** (IntelliJ, PyCharm, WebStorm, etc.)

**Status:** 🚧 In Development

**Planned Features:**
- Clipboard history tool window
- Snippet library integration
- Live templates sync
- Team collaboration
- Code formatting
- Git helpers

**Installation (When Ready):**
```
Settings → Plugins → Marketplace → Search "ClipSync"
```

**Supported IDEs:**
- IntelliJ IDEA
- PyCharm
- WebStorm
- PhpStorm
- GoLand
- RubyMine
- CLion
- Rider

---

### 4. **Sublime Text**

**Status:** 🚧 Planned

**Package Control Installation:**
```
Cmd+Shift+P → Package Control: Install Package → ClipSync
```

**Features:**
- Clipboard history panel
- Snippet management
- Text transformations
- Team sync

---

### 5. **Vim/Neovim**

**Status:** 🚧 Planned

**Installation:**
```vim
" Using vim-plug
Plug 'clipsync/clipsync.nvim'

" Using packer
use 'clipsync/clipsync.nvim'
```

**Features:**
- `:ClipSyncHistory` - Show clipboard history
- `:ClipSyncSnippets` - Manage snippets
- `:ClipSyncTransform` - Transform text
- `:ClipSyncTeam` - Team collaboration

---

### 6. **Atom**

**Status:** 🚧 Planned

**Installation:**
```bash
apm install clipsync
```

---

### 7. **Emacs**

**Status:** 🚧 Planned

**Installation:**
```elisp
(use-package clipsync
  :ensure t
  :config
  (clipsync-mode 1))
```

---

## 🔧 VS Code Extension - Detailed Guide

### Installation Steps

**Method 1: From Marketplace**
1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search for "ClipSync"
4. Click Install

**Method 2: From .vsix File**
1. Build the extension:
   ```bash
   cd Yank/vscode-extension
   npm install
   npm run compile
   npm run package
   ```
2. Install the .vsix:
   ```bash
   code --install-extension clipsync-vscode-1.0.0.vsix
   ```

**Method 3: Development Mode**
1. Open `Yank/vscode-extension` in VS Code
2. Press `F5` to launch Extension Development Host
3. Test the extension

---

### Usage Guide

#### 1. **Clipboard History**

**Access:**
- Click ClipSync icon in Activity Bar
- Or press `Ctrl+Shift+V`

**Features:**
- View all clipboard history
- Click to paste
- Search and filter
- Delete items
- Pin favorites

**Example:**
```
1. Copy some code
2. Copy something else
3. Press Ctrl+Shift+V
4. Select previous clip
5. Paste!
```

#### 2. **Snippets**

**Save Snippet:**
1. Select code
2. Right-click → "ClipSync: Save as Snippet"
3. Enter title and description
4. Done!

**Insert Snippet:**
1. Press `Ctrl+Shift+S`
2. Search for snippet
3. Select and insert

**Manage Snippets:**
- View in ClipSync sidebar
- Edit, delete, organize
- Sync across devices

#### 3. **Text Transformations**

**Transform Selection:**
1. Select text
2. Press `Ctrl+Shift+T`
3. Choose transformation:
   - Case conversions
   - Encoding/decoding
   - Formatting
   - Hashing

**Example:**
```javascript
// Select this
const myVariable = "hello world";

// Transform to snake_case
const my_variable = "hello world";
```

#### 4. **Code Formatting**

**Format Code:**
1. Select code
2. Command Palette → "ClipSync: Format Code"
3. Choose format:
   - JSON Beautify/Minify
   - SQL Format
   - XML/HTML Format
   - CSS Format

**Example:**
```json
// Before
{"name":"John","age":30}

// After (Beautify)
{
  "name": "John",
  "age": 30
}
```

#### 5. **Team Collaboration**

**Share with Team:**
1. Select code
2. Right-click → "ClipSync: Share with Team"
3. Choose team
4. Shared!

**View Team Clips:**
- Open ClipSync sidebar
- Click "Team Clips" tab
- See what team members shared

#### 6. **Git Helpers**

**Generate Commit Message:**
1. Command Palette → "ClipSync: Generate Commit"
2. Select type (feat, fix, docs, etc.)
3. Enter scope (optional)
4. Enter subject
5. Message copied to clipboard!

**Example:**
```
feat(api): add user authentication endpoint
```

#### 7. **Developer Tools**

**Test Regex:**
1. Command Palette → "ClipSync: Test Regex"
2. Enter pattern
3. Enter test string
4. See matches!

**Compare Text:**
1. Select text
2. Command Palette → "ClipSync: Compare Text"
3. Enter text to compare
4. View diff!

---

### Configuration

**Settings:**
```json
{
  // Enable/disable extension
  "clipsync.enabled": true,
  
  // Auto-capture clipboard changes
  "clipsync.autoCapture": true,
  
  // Maximum history items
  "clipsync.maxHistory": 100,
  
  // Enable cloud sync
  "clipsync.syncEnabled": false,
  
  // API URL for sync
  "clipsync.apiUrl": "http://localhost:3001",
  
  // Show notifications
  "clipsync.showNotifications": true
}
```

**Keyboard Shortcuts:**
```json
{
  "key": "ctrl+shift+v",
  "command": "clipsync.openPanel"
},
{
  "key": "ctrl+shift+h",
  "command": "clipsync.pasteFromHistory"
},
{
  "key": "ctrl+shift+s",
  "command": "clipsync.saveSnippet",
  "when": "editorHasSelection"
},
{
  "key": "ctrl+shift+t",
  "command": "clipsync.transformText",
  "when": "editorHasSelection"
}
```

---

## 🔌 API Integration

### Connect to ClipSync Desktop

**Setup:**
1. Start ClipSync desktop app
2. In VS Code settings, set:
   ```json
   {
     "clipsync.syncEnabled": true,
     "clipsync.apiUrl": "http://localhost:3001"
   }
   ```
3. Authenticate (if required)
4. Sync enabled!

**Benefits:**
- Sync between desktop and IDE
- Access team clips
- Cloud backup
- Cross-device sync

---

## 🎨 Customization

### Custom Themes

**Light Theme:**
```json
{
  "workbench.colorCustomizations": {
    "[ClipSync Light]": {
      "clipsync.historyBackground": "#ffffff",
      "clipsync.snippetBackground": "#f5f5f5"
    }
  }
}
```

**Dark Theme:**
```json
{
  "workbench.colorCustomizations": {
    "[ClipSync Dark]": {
      "clipsync.historyBackground": "#1e1e1e",
      "clipsync.snippetBackground": "#252526"
    }
  }
}
```

### Custom Commands

**Add Custom Transform:**
```json
{
  "clipsync.customTransforms": [
    {
      "name": "My Transform",
      "command": "myExtension.transform"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Extension Not Working

**Check:**
1. Extension is enabled
2. VS Code version >= 1.80.0
3. No conflicting extensions
4. Restart VS Code

**Debug:**
```
Help → Toggle Developer Tools → Console
Look for ClipSync errors
```

### Clipboard Not Capturing

**Solutions:**
1. Check `clipsync.autoCapture` setting
2. Grant clipboard permissions
3. Restart extension
4. Check antivirus settings

### Sync Not Working

**Solutions:**
1. Check `clipsync.apiUrl` setting
2. Verify desktop app is running
3. Check network connection
4. Re-authenticate

---

## 📊 Performance

### Resource Usage

**Memory:**
- Idle: ~10MB
- Active: ~20MB
- With 100 clips: ~30MB

**CPU:**
- Idle: <1%
- Monitoring: <2%
- Active use: <5%

**Storage:**
- History: ~1MB per 100 clips
- Snippets: ~500KB per 50 snippets

### Optimization Tips

1. **Reduce History:**
   ```json
   {
     "clipsync.maxHistory": 50
   }
   ```

2. **Disable Auto-Capture:**
   ```json
   {
     "clipsync.autoCapture": false
   }
   ```

3. **Disable Notifications:**
   ```json
   {
     "clipsync.showNotifications": false
   }
   ```

---

## 🚀 Advanced Features

### Workspace-Specific Snippets

**Setup:**
```json
// .vscode/settings.json
{
  "clipsync.workspaceSnippets": true,
  "clipsync.snippetsPath": ".vscode/snippets"
}
```

### Team Workspaces

**Setup:**
```json
{
  "clipsync.teamWorkspace": true,
  "clipsync.teamId": "team-123"
}
```

### Custom Integrations

**API:**
```typescript
import { clipsync } from 'clipsync-vscode';

// Add clip programmatically
await clipsync.addClip('content');

// Get history
const history = await clipsync.getHistory();

// Transform text
const result = await clipsync.transform('text', 'uppercase');
```

---

## 📞 Support

### Resources
- **Documentation:** https://docs.clipsync.com/ide
- **Issues:** https://github.com/clipsync/vscode-extension/issues
- **Discord:** https://discord.gg/clipsync
- **Email:** support@clipsync.com

### Common Questions

**Q: Does it work offline?**
A: Yes! Local features work offline. Sync requires connection.

**Q: Is my data secure?**
A: Yes! End-to-end encryption for synced data.

**Q: Can I use it with multiple accounts?**
A: Yes! Switch accounts in settings.

**Q: Does it support remote development?**
A: Yes! Works with VS Code Remote.

---

## 🎉 Coming Soon

### Planned Features

- **AI-Powered Suggestions** - Smart clipboard recommendations
- **Code Completion** - Snippet-based completions
- **Multi-Cursor Support** - Paste different clips to multiple cursors
- **Clipboard Macros** - Record and replay clipboard sequences
- **Advanced Search** - Semantic search across history
- **Clip Templates** - Variables in snippets
- **Workflow Automation** - Trigger actions on clipboard events

---

**ClipSync IDE Integrations** - Bringing professional clipboard management to your favorite editor!

*Version 1.0.0 - December 2024*
