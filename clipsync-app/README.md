# ClipSync - The Clipboard for Developers

A web-first clipboard manager built for developers and teams with cross-device sync, real-time collaboration, local AI-powered organization, and developer-specific text utilities.

## Features

### ✨ Core Features (MVP)
- **Clipboard History**: Automatic capture of copied items with searchable history
- **Smart Type Detection**: Auto-detects JSON, URLs, code, UUIDs, emails, colors, IPs, and more
- **Developer Utilities**: Text transforms (case conversion, base64, URL encoding, hashing)
- **Pinned Clips**: Pin frequently used snippets for quick access
- **Local Storage**: All data stored locally in IndexedDB
- **Beautiful UI**: iOS-inspired design with solid colors and smooth animations

### 🔧 Text Transforms
- Case conversions: lowercase, UPPERCASE, camelCase, snake_case, kebab-case, PascalCase
- Code utilities: JSON beautify/minify, Base64 encode/decode
- Encoding: URL encode/decode, HTML escape/unescape
- Hashing: SHA-256 generation
- Extraction: Extract URLs, emails, numbers from text
- And more!

### 🎨 Design
- iOS-inspired interface with solid colors
- No transparency or gradients
- Crisp micro-animations
- Fully responsive design
- Keyboard shortcuts support

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Storage**: IndexedDB (browser native)
- **Type Detection**: Regex-based pattern matching

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd clipsync-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Capturing Clips
1. Copy any text using `Ctrl+C` (Windows/Linux) or `⌘+C` (Mac)
2. Paste anywhere in the browser using `Ctrl+V` or `⌘+V`
3. ClipSync automatically captures and categorizes your clipboard content

### Keyboard Shortcuts
- `⌘/Ctrl + K` - Focus search
- `⌘/Ctrl + Shift + V` - Quick open (coming soon)
- `Escape` - Clear selection

### Transforms
1. Select any clip from the history
2. View available transforms in the right sidebar
3. Click any transform to apply it
4. The transformed result is automatically added to your clipboard history

### Pinning Clips
1. Select a clip
2. Click the star icon to pin/unpin
3. Access pinned clips from the "Pinned" tab

## Project Structure

```
clipsync-app/
├── src/
│   ├── components/          # React components
│   │   ├── Navigation.jsx
│   │   ├── FilterBar.jsx
│   │   ├── ClipList.jsx
│   │   ├── ClipCard.jsx
│   │   ├── DetailSidebar.jsx
│   │   ├── TransformPanel.jsx
│   │   ├── ShareModal.jsx
│   │   ├── SettingsScreen.jsx
│   │   └── PricingScreen.jsx
│   ├── store/              # Zustand state management
│   │   └── useClipStore.js
│   ├── utils/              # Utility functions
│   │   ├── typeDetection.js
│   │   ├── transforms.js
│   │   ├── storage.js
│   │   └── clipboard.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind configuration
```

## Features Roadmap

### Phase 2 (Coming Soon)
- [ ] Team spaces with real-time collaboration
- [ ] Ollama AI integration for smart summarization
- [ ] Browser extension (Chrome, Firefox, Safari)
- [ ] Image clipboard support
- [ ] Webhook integrations (Slack, Discord)

### Phase 3 (Future)
- [ ] Native desktop apps (Electron/Tauri)
- [ ] Mobile apps (React Native)
- [ ] CLI tool for terminal users
- [ ] API for automation
- [ ] Self-hosted deployment option

## Type Detection

ClipSync automatically detects the following content types:

- **JSON**: Valid JSON objects and arrays
- **URL**: Web URLs and links
- **Code**: Programming code with syntax patterns
- **UUID**: Universally unique identifiers
- **Email**: Email addresses
- **Color**: Hex, RGB, HSL color codes
- **IP**: IPv4 and IPv6 addresses
- **Token**: JWT tokens
- **Env**: Environment variables
- **Path**: File system paths
- **Text**: Plain text (fallback)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Design inspired by Paste, Raycast, and Linear
- Built with React, Vite, and Tailwind CSS
- Icons from Heroicons

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**ClipSync** - The clipboard for developers who work across devices and teams.
