# ClipSync Browser Extension

Chrome and Firefox browser extension for clipboard management.

## Features

- ✅ Automatic clipboard capture
- ✅ Quick access popup
- ✅ Search and filter clips
- ✅ Real-time sync
- ✅ Keyboard shortcuts
- ✅ Cross-browser support

## Building

### Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension/chrome/` directory

### Firefox

1. Open Firefox and go to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `browser-extension/firefox/manifest.json`

## Development

```bash
# Watch for changes (if using build tool)
npm run watch

# Build for production
npm run build
```

## Configuration

Set API URL in options page (right-click extension → Options).

## Permissions

- `clipboardRead` - Read clipboard content
- `clipboardWrite` - Write to clipboard
- `storage` - Store settings and cache
- `activeTab` - Access current tab for clipboard
- `tabs` - Tab management

