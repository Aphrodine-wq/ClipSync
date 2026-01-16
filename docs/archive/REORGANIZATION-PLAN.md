# ClipSync - Codebase Reorganization Plan

## Overview

This document outlines the plan for reorganizing the ClipSync codebase into a cleaner, more maintainable structure while keeping launchers and launch scripts at the root level.

## Goals

1. **Organize by Feature/Function** - Group related files together
2. **Separate Concerns** - Clear separation between apps, services, and infrastructure
3. **Maintain Launchers** - Keep all `.bat` files and launchers at root
4. **Update Imports** - Update all import paths after reorganization
5. **Document Everything** - Update all documentation to reflect new structure

## Current vs. Recommended Structure

### Root Level (Keep As-Is)

```
Root/
├── START.bat                    ✅ Keep
├── START-ELECTRON.bat           ✅ Keep
├── launcher.bat                 ✅ Keep
├── ClipSync.exe                 ✅ Keep (if exists)
├── docker-compose.local.yml     ✅ Keep
├── docker-compose.prod.yml      ✅ Keep
├── README.md                    ✅ Keep
├── PROJECT-STRUCTURE.md         ✅ Keep
└── package.json                 ✅ Keep (root launcher package)
```

### Recommended Structure

```
Yank-main/
├── apps/                        # Application source code
│   ├── web/                     # ← Move clipsync-app/ here
│   ├── desktop/                 # ← Move clipsync-desktop/ here
│   └── vscode-extension/        # ← Move vscode-extension/ here
│
├── services/                    # Backend services
│   └── api/                     # ← Move backend/ here
│
├── infrastructure/              # Infrastructure configuration
│   ├── docker/                  # ← Move Dockerfiles here
│   ├── nginx/                   # ← Move nginx/ here
│   └── scripts/                 # ← Move scripts/ here (keep launcher.js at root/tools)
│
├── docs/                        # Documentation (keep as-is)
├── tools/                       # Development tools
│   └── launcher.js              # ← Move scripts/launcher.js here
└── release/                     # Release builds (keep as-is)
```

## Detailed Reorganization Steps

### Step 1: Create New Directory Structure

```powershell
# Create new directories
mkdir apps
mkdir apps\web
mkdir apps\desktop
mkdir apps\vscode-extension
mkdir services
mkdir services\api
mkdir infrastructure
mkdir infrastructure\docker
mkdir infrastructure\nginx
mkdir infrastructure\scripts
mkdir tools
```

### Step 2: Move Applications

```powershell
# Move web application
Move-Item -Path clipsync-app\* -Destination apps\web\ -Force

# Move desktop application
Move-Item -Path clipsync-app\* -Destination apps\desktop\ -Force

# Move VS Code extension
Move-Item -Path vscode-extension\* -Destination apps\vscode-extension\ -Force
```

### Step 3: Move Services

```powershell
# Move backend API
Move-Item -Path backend\* -Destination services\api\ -Force
```

### Step 4: Move Infrastructure

```powershell
# Move Dockerfiles
Move-Item -Path apps\web\Dockerfile -Destination infrastructure\docker\Dockerfile.web
Move-Item -Path services\api\Dockerfile -Destination infrastructure\docker\Dockerfile.api

# Move nginx config
Move-Item -Path nginx\* -Destination infrastructure\nginx\ -Force

# Move scripts (except launcher.js)
Move-Item -Path scripts\*.sh -Destination infrastructure\scripts\ -Force
Move-Item -Path scripts\*.ps1 -Destination infrastructure\scripts\ -Force
Move-Item -Path scripts\*.js -Exclude launcher.js -Destination infrastructure\scripts\ -Force
```

### Step 5: Move Tools

```powershell
# Move launcher script to tools
Move-Item -Path scripts\launcher.js -Destination tools\launcher.js
```

### Step 6: Organize Frontend Components

Reorganize `apps/web/src/components/` into feature-based folders:

```
apps/web/src/components/
├── auth/
│   └── AuthModal.jsx
├── clipboard/
│   ├── ClipCard.jsx
│   ├── ClipCardModern.jsx
│   ├── ClipList.jsx
│   ├── ClipListSkeleton.jsx
│   ├── ClipBubble.jsx
│   ├── FilterBar.jsx
│   ├── FilterBarModern.jsx
│   ├── DetailSidebar.jsx
│   ├── DetailSidebarModern.jsx
│   ├── CreateClipModal.jsx
│   ├── TransformPanel.jsx
│   └── HistoryScreen.jsx
├── teams/
│   ├── TeamsListScreen.jsx
│   ├── TeamSpaceScreen.jsx
│   └── ShareModal.jsx
├── settings/
│   ├── SettingsScreen.jsx
│   └── PaywallModal.jsx
├── snippets/
│   └── SnippetLibrary.jsx
├── dev-tools/
│   ├── DevTools.jsx
│   ├── GitHelper.jsx
│   └── WorkflowAutomation.jsx
├── shared/
│   ├── Navigation.jsx
│   ├── NavigationModern.jsx
│   ├── CommandPalette.jsx
│   ├── LandingPage.jsx
│   ├── PricingScreen.jsx
│   ├── FloatingActionButton.jsx
│   ├── KeyboardShortcutHint.jsx
│   ├── UserAvatar.jsx
│   └── Toast.jsx
└── ui/
    ├── Button.jsx
    ├── Input.jsx
    ├── Modal.jsx
    ├── Toast.jsx
    ├── Card.jsx
    ├── Badge.jsx
    └── index.js
```

### Step 7: Update Import Paths

After moving files, update all import statements:

**Before:**
```javascript
import ClipCard from '../components/ClipCard';
```

**After:**
```javascript
import ClipCard from '../components/clipboard/ClipCard';
```

### Step 8: Update Configuration Files

Update paths in:
- `vite.config.js` - Build paths
- `package.json` - Script paths
- `docker-compose.yml` - Volume mounts
- `nginx.conf` - Static file paths
- `.env` files - Path references

### Step 9: Update Documentation

Update documentation files to reflect new structure:
- `README.md`
- `docs/SYSTEM-OVERVIEW.md`
- `PROJECT-STRUCTURE.md`
- All setup/deployment guides

### Step 10: Update Launcher Scripts

Update `.bat` files to use new paths:

**Before:**
```batch
cd clipsync-app
```

**After:**
```batch
cd apps\web
```

## Migration Checklist

### Phase 1: Preparation
- [ ] Create new directory structure
- [ ] Backup current codebase
- [ ] Document current import paths
- [ ] Create test plan

### Phase 2: Move Files
- [ ] Move applications (`apps/`)
- [ ] Move services (`services/`)
- [ ] Move infrastructure (`infrastructure/`)
- [ ] Move tools (`tools/`)

### Phase 3: Update Code
- [ ] Update frontend component imports
- [ ] Update backend imports (if any)
- [ ] Update service imports
- [ ] Update configuration files

### Phase 4: Update Configuration
- [ ] Update `vite.config.js`
- [ ] Update `package.json` files
- [ ] Update Docker configurations
- [ ] Update Nginx configuration

### Phase 5: Update Scripts
- [ ] Update `.bat` launchers
- [ ] Update shell scripts (`.sh`)
- [ ] Update PowerShell scripts (`.ps1`)
- [ ] Update `launcher.js`

### Phase 6: Update Documentation
- [ ] Update `README.md`
- [ ] Update `PROJECT-STRUCTURE.md`
- [ ] Update `docs/SYSTEM-OVERVIEW.md`
- [ ] Update setup guides
- [ ] Update deployment guides

### Phase 7: Testing
- [ ] Test web application
- [ ] Test desktop application
- [ ] Test VS Code extension
- [ ] Test all launchers
- [ ] Test build process
- [ ] Test deployment

### Phase 8: Cleanup
- [ ] Remove old empty directories
- [ ] Update `.gitignore`
- [ ] Commit changes
- [ ] Tag release

## Import Path Update Examples

### Frontend Components

**AuthModal:**
```javascript
// Before
import AuthModal from './components/AuthModal';

// After
import AuthModal from './components/auth/AuthModal';
```

**ClipCard:**
```javascript
// Before
import ClipCard from './components/ClipCard';

// After
import ClipCard from './components/clipboard/ClipCard';
```

**SettingsScreen:**
```javascript
// Before
import SettingsScreen from './components/SettingsScreen';

// After
import SettingsScreen from './components/settings/SettingsScreen';
```

### Services

**API Client:**
```javascript
// Before (if referenced from outside)
import apiClient from '../clipsync-app/src/services/api';

// After
import apiClient from '../apps/web/src/services/api';
```

### Tools

**Launcher:**
```javascript
// package.json
// Before
"main": "scripts/launcher.js"

// After
"main": "tools/launcher.js"
```

## Configuration Updates

### Vite Config

```javascript
// vite.config.js
// Update build output path if needed
build: {
  outDir: 'dist', // Still relative to apps/web/
}
```

### Package.json

```json
{
  "name": "clipsync-web",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### Docker Compose

```yaml
# docker-compose.local.yml
services:
  web:
    build:
      context: ./apps/web
      dockerfile: ../../infrastructure/docker/Dockerfile.web
  api:
    build:
      context: ./services/api
      dockerfile: ../../infrastructure/docker/Dockerfile.api
```

## Testing After Reorganization

1. **Start Services**
   ```bash
   # Test launchers still work
   START.bat
   START-ELECTRON.bat
   ```

2. **Build Applications**
   ```bash
   cd apps/web && npm run build
   cd ../../services/api && npm run build
   ```

3. **Run Tests**
   ```bash
   # Frontend tests
   cd apps/web && npm test
   
   # Backend tests
   cd ../../services/api && npm test
   ```

4. **Verify Imports**
   - Check browser console for import errors
   - Check build output for warnings
   - Verify all features still work

## Rollback Plan

If reorganization causes issues:

1. **Restore from Backup**
   ```bash
   git checkout <previous-commit>
   ```

2. **Or Restore Individual Files**
   ```bash
   git checkout <previous-commit> -- clipsync-app/
   git checkout <previous-commit> -- backend/
   ```

## Benefits of Reorganization

1. **Better Organization** - Files grouped by feature/function
2. **Easier Navigation** - Clear structure, easier to find files
3. **Scalability** - Easy to add new apps or services
4. **Maintainability** - Clear separation of concerns
5. **Professional Structure** - Industry-standard monorepo structure

## Notes

- **Launchers Stay at Root** - All `.bat` files remain at root level
- **Gradual Migration** - Can be done incrementally
- **Import Updates Required** - All imports must be updated after moving files
- **Test Thoroughly** - Verify everything works after reorganization
- **Update Documentation** - Keep docs in sync with actual structure

---

**Status**: Planning Phase  
**Created**: December 2024  
**Last Updated**: December 2024

