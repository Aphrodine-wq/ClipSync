# ClipSync IDE Integrations

Integrations for various IDEs and text editors.

## Vim

1. Copy plugin to `~/.vim/plugin/clipsync.vim`
2. Configure API key: `let g:clipsync_api_key = 'your_key'`
3. Use commands:
   - `:ClipSyncSearch` - Search clips
   - `:ClipSyncPaste` - Paste from history
   - `:ClipSyncCopy` - Copy current clipboard to ClipSync

## Neovim

1. Install as Lua plugin:
```lua
require('clipsync').setup({
  api_url = 'http://localhost:3001/api',
  api_key = 'your_key',
})
```

2. Use commands or key mappings:
   - `<leader>cs` - Search
   - `<leader>cp` - Paste
   - `<leader>cc` - Copy

## Sublime Text

See `sublime/clipsync.py` for Sublime Text plugin.

## JetBrains

See `jetbrains/` directory for IntelliJ Platform plugin.

