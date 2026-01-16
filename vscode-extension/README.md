# ClipSync for VS Code

Professional clipboard manager with team collaboration, snippets, and developer tools - right in your editor.

## Features

### 📋 Clipboard History
- Automatic clipboard monitoring
- Search and filter history
- Quick paste with `Ctrl+Shift+V`
- Type detection (code, JSON, URL, etc.)
- Pin favorites

### 📚 Snippet Library
- Save code snippets with `Ctrl+Shift+S`
- Organize with categories and tags
- Syntax highlighting
- Quick insert
- Sync across devices

### 🔧 Text Transformations
- 14+ transformations with `Ctrl+Shift+T`
- Case conversions (camelCase, snake_case, etc.)
- Encoding/decoding (Base64, URL)
- Hashing (SHA-256)
- Line operations

### 💻 Code Formatting
- JSON beautify/minify
- SQL formatting
- XML/HTML formatting
- CSS formatting

### 👥 Team Collaboration
- Share clips with team
- Real-time sync
- Team workspaces
- Activity tracking

### 🌿 Git Helpers
- Generate commit messages
- Test regex patterns
- Compare text (diff tool)

## Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search for "ClipSync"
4. Click Install

## Quick Start

1. **Copy something** - It's automatically captured
2. **Press `Ctrl+Shift+V`** - See your clipboard history
3. **Select text and press `Ctrl+Shift+S`** - Save as snippet
4. **Press `Ctrl+Shift+T`** - Transform selected text

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| ClipSync: Open Panel | `Ctrl+Shift+V` | Open ClipSync panel |
| ClipSync: Paste from History | `Ctrl+Shift+H` | Quick paste menu |
| ClipSync: Save as Snippet | `Ctrl+Shift+S` | Save selection |
| ClipSync: Transform Text | `Ctrl+Shift+T` | Transform selection |
| ClipSync: Format Code | - | Format code |
| ClipSync: Share with Team | - | Share with team |
| ClipSync: Generate Commit | - | Generate commit message |
| ClipSync: Test Regex | - | Test regex pattern |
| ClipSync: Compare Text | - | Diff tool |

## Configuration

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

## Requirements

- VS Code 1.80.0 or higher
- Optional: ClipSync desktop app for sync

## Extension Settings

This extension contributes the following settings:

* `clipsync.enabled`: Enable/disable ClipSync
* `clipsync.autoCapture`: Automatically capture clipboard changes
* `clipsync.maxHistory`: Maximum number of clipboard items to store
* `clipsync.syncEnabled`: Enable cloud sync (requires account)
* `clipsync.apiUrl`: ClipSync API URL for sync
* `clipsync.showNotifications`: Show notifications for clipboard actions

## Known Issues

None currently. Report issues at: https://github.com/clipsync/vscode-extension/issues

## Release Notes

### 1.0.0

Initial release:
- Clipboard history
- Snippet library
- Text transformations
- Code formatting
- Team collaboration
- Git helpers

## Support

- **Documentation:** https://docs.clipsync.com
- **Issues:** https://github.com/clipsync/vscode-extension/issues
- **Discord:** https://discord.gg/clipsync
- **Email:** support@clipsync.com

## License

MIT

---

**Enjoy ClipSync!** 🎉
