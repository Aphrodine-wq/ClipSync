# ClipSync - Complete Testing & Build Guide

## 🎯 Testing Checklist

### Phase 1: Frontend Application Testing ✅

#### 1.1 Build Verification
```bash
cd Yank/clipsync-app
npm install
npm run build
# ✅ Check: dist/ folder created
# ✅ Check: No build errors
```

#### 1.2 Development Server
```bash
npm run dev
# ✅ Opens at http://localhost:5173
# ✅ No console errors
# ✅ UI loads correctly
```

#### 1.3 Core Features
- [ ] **Clipboard History**
  - [ ] Paste text → appears in history
  - [ ] Click clip → copies to clipboard
  - [ ] Search works
  - [ ] Filter by type works
  - [ ] Delete clip works
  - [ ] Pin/unpin works

- [ ] **Command Palette (Ctrl+K)**
  - [ ] Opens with Ctrl+K
  - [ ] Search works
  - [ ] All 50+ commands listed
  - [ ] Commands execute correctly
  - [ ] Keyboard navigation works
  - [ ] ESC closes palette

- [ ] **Snippet Library (Ctrl+Shift+S)**
  - [ ] Opens with Ctrl+Shift+S
  - [ ] Create snippet works
  - [ ] Edit snippet works
  - [ ] Delete snippet works
  - [ ] Search works
  - [ ] Categories work
  - [ ] Tags work
  - [ ] Favorites work

- [ ] **Developer Tools (Ctrl+Shift+D)**
  - [ ] Opens with Ctrl+Shift+D
  - [ ] **Regex Tester**
    - [ ] Pattern input works
    - [ ] Flags work (g, i, m)
    - [ ] Test string input works
    - [ ] Matches display correctly
    - [ ] Error handling works
  - [ ] **JSON Path Tester**
    - [ ] JSON input works
    - [ ] Path query works
    - [ ] Result displays correctly
    - [ ] Error handling works
  - [ ] **Diff Tool**
    - [ ] Text 1 input works
    - [ ] Text 2 input works
    - [ ] Diff calculation works
    - [ ] Color coding works (added/removed/changed)
  - [ ] **API Tester**
    - [ ] URL input works
    - [ ] Method selection works (GET, POST, PUT, DELETE, PATCH)
    - [ ] Headers input works
    - [ ] Body input works
    - [ ] Request sends successfully
    - [ ] Response displays correctly
  - [ ] **Color Picker**
    - [ ] Color selection works
    - [ ] HEX output correct
    - [ ] RGB output correct
    - [ ] Copy works
  - [ ] **Hash Calculator**
    - [ ] Input works
    - [ ] SHA-256 calculates correctly
    - [ ] SHA-1 calculates correctly
    - [ ] SHA-512 calculates correctly
    - [ ] Copy works
  - [ ] **Base64 Tool**
    - [ ] Encode works
    - [ ] Decode works
    - [ ] Error handling works

- [ ] **Git Helper (Ctrl+Shift+G)**
  - [ ] Opens with Ctrl+Shift+G
  - [ ] **Commit Message Generator**
    - [ ] Type selection works (10 types)
    - [ ] Scope input works
    - [ ] Subject input works
    - [ ] Body input works
    - [ ] Breaking change input works
    - [ ] Message generates correctly
    - [ ] Copy works
  - [ ] **Branch Name Generator**
    - [ ] Type selection works (6 types)
    - [ ] Ticket input works
    - [ ] Description input works
    - [ ] Name generates correctly
    - [ ] Git command shows
    - [ ] Copy works
  - [ ] **PR Template Generator**
    - [ ] Title input works
    - [ ] Description input works
    - [ ] Changes input works
    - [ ] Testing input works
    - [ ] Template generates correctly
    - [ ] Markdown formatted
    - [ ] Copy works
  - [ ] **.gitignore Generator**
    - [ ] Type selection works (4 types)
    - [ ] Content generates correctly
    - [ ] Copy works

- [ ] **Advanced Transforms (50+)**
  - [ ] **Code Formatters**
    - [ ] SQL format works
    - [ ] XML format works
    - [ ] HTML format works
    - [ ] CSS format works
    - [ ] GraphQL format works
    - [ ] YAML format works
  - [ ] **Converters**
    - [ ] Markdown → HTML works
    - [ ] HTML → Markdown works
    - [ ] JSON → YAML works
    - [ ] YAML → JSON works
    - [ ] JSON → CSV works
    - [ ] RGB → HEX works
    - [ ] HEX → RGB works
    - [ ] RGB → HSL works
  - [ ] **Generators**
    - [ ] Password generation works (16-32 chars)
    - [ ] UUID generation works
    - [ ] PIN generation works
    - [ ] Fake name works
    - [ ] Fake email works
    - [ ] Fake phone works
    - [ ] Fake address works
    - [ ] Lorem ipsum works
  - [ ] **Encoders/Decoders**
    - [ ] JWT decode works
    - [ ] HTML entities encode/decode works
    - [ ] Unicode escape works
    - [ ] ROT13 works
    - [ ] Morse code encode/decode works
    - [ ] Base64 encode/decode works
  - [ ] **Text Utilities**
    - [ ] Word count works
    - [ ] Character count works
    - [ ] Line count works
    - [ ] Remove empty lines works
    - [ ] Add line numbers works
    - [ ] Slugify works
    - [ ] Sort lines works
    - [ ] Reverse text works

---

### Phase 2: Desktop Application Testing

#### 2.1 Build Desktop App
```bash
cd Yank/clipsync-desktop
npm install
npm run build:web
npm run build:win
# ✅ Check: dist/ClipSync-Setup-1.0.0-x64.exe created
```

#### 2.2 Install & Launch
```bash
# Run the installer
dist/ClipSync-Setup-1.0.0-x64.exe
# ✅ Installs successfully
# ✅ Desktop shortcut created
# ✅ Start menu entry created
```

#### 2.3 Desktop Features
- [ ] **System Tray**
  - [ ] Icon appears in system tray
  - [ ] Right-click menu works
  - [ ] Recent clips show in menu
  - [ ] "Show ClipSync" opens window
  - [ ] "Quit" closes app

- [ ] **Global Shortcuts**
  - [ ] Ctrl+Shift+V opens app
  - [ ] Ctrl+Shift+C copies selected clip
  - [ ] Ctrl+Shift+H shows history

- [ ] **Clipboard Monitoring**
  - [ ] Automatically captures clipboard
  - [ ] Polling works (500ms)
  - [ ] No duplicates
  - [ ] Type detection works

- [ ] **Notifications**
  - [ ] Shows when clip captured
  - [ ] Shows clip type
  - [ ] Dismisses automatically

- [ ] **Window Management**
  - [ ] Minimize to tray works
  - [ ] Restore from tray works
  - [ ] Single instance lock works
  - [ ] Window position remembered

---

### Phase 3: VS Code Extension Testing

#### 3.1 Build Extension
```bash
cd Yank/vscode-extension
npm install
npm run compile
npm run package
# ✅ Check: clipsync-vscode-1.0.0.vsix created
```

#### 3.2 Install Extension
```bash
code --install-extension clipsync-vscode-1.0.0.vsix
# Or: Extensions → Install from VSIX
# ✅ Extension installed
# ✅ ClipSync icon in Activity Bar
```

#### 3.3 Extension Features
- [ ] **Activation**
  - [ ] Extension activates on startup
  - [ ] No errors in console
  - [ ] Status bar shows "ClipSync is ready!"

- [ ] **Clipboard History View**
  - [ ] Tree view shows in sidebar
  - [ ] History items display
  - [ ] Click to paste works
  - [ ] Icons show correctly
  - [ ] Refresh works

- [ ] **Snippet View**
  - [ ] Tree view shows snippets
  - [ ] Click to insert works
  - [ ] Favorites show star icon
  - [ ] Refresh works

- [ ] **Team View**
  - [ ] Tree view shows teams
  - [ ] Expand shows team clips
  - [ ] Click to paste works
  - [ ] Refresh works

- [ ] **Commands**
  - [ ] Ctrl+Shift+V opens panel
  - [ ] Ctrl+Shift+H shows history quick pick
  - [ ] Ctrl+Shift+S saves snippet
  - [ ] Ctrl+Shift+T transforms text
  - [ ] All commands in palette work

- [ ] **Context Menu**
  - [ ] Right-click → "Save as Snippet" works
  - [ ] Right-click → "Transform Text" works
  - [ ] Right-click → "Share with Team" works
  - [ ] Right-click → "Compare Text" works

- [ ] **Text Transformations**
  - [ ] All 14 transforms work
  - [ ] Selection replaced correctly
  - [ ] Notification shows

- [ ] **Code Formatting**
  - [ ] JSON beautify/minify works
  - [ ] SQL format works
  - [ ] XML format works
  - [ ] HTML format works
  - [ ] CSS format works

- [ ] **Git Helpers**
  - [ ] Commit message generator works
  - [ ] Message copied to clipboard
  - [ ] Conventional format correct

- [ ] **Developer Tools**
  - [ ] Regex tester works
  - [ ] Diff tool works
  - [ ] Results show correctly

---

### Phase 4: Integration Testing

#### 4.1 Desktop ↔ VS Code
- [ ] Start desktop app
- [ ] Copy in VS Code
- [ ] Appears in desktop app
- [ ] Copy in desktop app
- [ ] Appears in VS Code

#### 4.2 Backend API (if running)
- [ ] Start backend server
- [ ] Configure API URL in settings
- [ ] Authentication works
- [ ] Sync works
- [ ] Team features work

#### 4.3 Cross-Device Sync
- [ ] Install on Device 1
- [ ] Install on Device 2
- [ ] Copy on Device 1
- [ ] Appears on Device 2
- [ ] Real-time sync works

---

### Phase 5: Performance Testing

#### 5.1 Memory Usage
```bash
# Desktop App
Task Manager → ClipSync.exe
# ✅ Idle: <100MB
# ✅ Active: <150MB
# ✅ With 100 clips: <200MB
```

#### 5.2 CPU Usage
```bash
# ✅ Idle: <1%
# ✅ Monitoring: <2%
# ✅ Active use: <5%
```

#### 5.3 Startup Time
```bash
# ✅ Desktop app: <2 seconds
# ✅ VS Code extension: <1 second
```

#### 5.4 Large Data
- [ ] 1000 clips in history
- [ ] 500 snippets
- [ ] 50 team members
- [ ] Still responsive
- [ ] Search still fast

---

### Phase 6: Error Handling

#### 6.1 Network Errors
- [ ] Offline mode works
- [ ] Sync queue works
- [ ] Error messages clear
- [ ] Retry logic works

#### 6.2 Invalid Input
- [ ] Invalid JSON → error message
- [ ] Invalid regex → error message
- [ ] Invalid URL → error message
- [ ] Empty input → validation

#### 6.3 Edge Cases
- [ ] Very long text (>10MB)
- [ ] Special characters
- [ ] Unicode text
- [ ] Binary data
- [ ] Empty clipboard

---

### Phase 7: Security Testing

#### 7.1 Data Storage
- [ ] Local data encrypted
- [ ] Passwords hashed
- [ ] Tokens secure
- [ ] No sensitive data in logs

#### 7.2 API Security
- [ ] JWT tokens work
- [ ] Rate limiting works
- [ ] CORS configured
- [ ] SQL injection prevented

#### 7.3 Permissions
- [ ] Clipboard access only
- [ ] No unnecessary permissions
- [ ] User consent for sync

---

## 🔧 Build Commands Reference

### Frontend
```bash
cd Yank/clipsync-app
npm install          # Install dependencies
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview build
```

### Desktop
```bash
cd Yank/clipsync-desktop
npm install          # Install dependencies
npm run dev          # Development mode
npm run build:web    # Build web app
npm run build:win    # Build Windows installer
npm run build:mac    # Build macOS app
npm run build:linux  # Build Linux app
```

### VS Code Extension
```bash
cd Yank/vscode-extension
npm install          # Install dependencies
npm run compile      # Compile TypeScript
npm run watch        # Watch mode
npm run package      # Create .vsix
npm run publish      # Publish to marketplace
```

### Backend
```bash
cd Yank/backend
npm install          # Install dependencies
npm run dev          # Development server
npm start            # Production server
npm run db:migrate   # Run migrations
```

---

## 🐛 Common Issues & Solutions

### Issue: Build fails
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Extension not loading
**Solution:**
```bash
# Reload VS Code
Ctrl+Shift+P → "Developer: Reload Window"
# Check console
Help → Toggle Developer Tools → Console
```

### Issue: Clipboard not capturing
**Solution:**
- Check permissions
- Restart app
- Check antivirus settings
- Verify `autoCapture` setting

### Issue: Sync not working
**Solution:**
- Check API URL in settings
- Verify backend is running
- Check network connection
- Re-authenticate

---

## ✅ Testing Completion Criteria

### Minimum (Critical Path)
- [ ] Frontend builds successfully
- [ ] Desktop app installs and runs
- [ ] VS Code extension installs
- [ ] Basic clipboard capture works
- [ ] Command palette works
- [ ] At least 5 transforms work
- [ ] No critical errors

### Complete (Thorough)
- [ ] All 50+ transforms tested
- [ ] All DevTools utilities tested
- [ ] All GitHelper generators tested
- [ ] All keyboard shortcuts work
- [ ] All UI components functional
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Security verified
- [ ] Documentation accurate

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Frontend Application
- Build: ✅ / ❌
- Dev Server: ✅ / ❌
- Clipboard History: ✅ / ❌
- Command Palette: ✅ / ❌
- Snippet Library: ✅ / ❌
- Developer Tools: ✅ / ❌
- Git Helper: ✅ / ❌
- Transforms: ✅ / ❌

### Desktop Application
- Build: ✅ / ❌
- Installation: ✅ / ❌
- System Tray: ✅ / ❌
- Global Shortcuts: ✅ / ❌
- Clipboard Monitoring: ✅ / ❌
- Notifications: ✅ / ❌

### VS Code Extension
- Build: ✅ / ❌
- Installation: ✅ / ❌
- Activation: ✅ / ❌
- Commands: ✅ / ❌
- Tree Views: ✅ / ❌
- Transformations: ✅ / ❌

### Performance
- Memory Usage: ✅ / ❌
- CPU Usage: ✅ / ❌
- Startup Time: ✅ / ❌
- Large Data: ✅ / ❌

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Additional observations]
```

---

**Ready to test!** Follow this guide systematically for complete coverage.
