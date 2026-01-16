# ClipSync CLI

Command-line interface for ClipSync.

## Installation

```bash
npm install -g clipsync-cli
```

## Usage

### Login

```bash
clipsync login
```

### Copy

```bash
clipsync copy "Hello, world!"
clipsync copy "console.log('test')" --type code
clipsync copy "text" --pin
```

### Paste

```bash
clipsync paste 0        # Paste clip at index 0
clipsync paste --interactive  # Interactive selection
```

### Search

```bash
clipsync search "query"
clipsync search "query" --type code
clipsync search "query" --limit 20
```

### List

```bash
clipsync list
clipsync list --limit 50
clipsync list --pinned
```

### Sync

```bash
clipsync sync
```

### Interactive Mode

```bash
clipsync interactive
```

## Configuration

Set API URL via environment variable:

```bash
export CLIPSYNC_API_URL=https://api.clipsync.com
```

