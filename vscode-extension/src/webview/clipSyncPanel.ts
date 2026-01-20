/**
 * ClipSync Panel Webview
 * Manages the main ClipSync panel webview
 */

import * as vscode from 'vscode';
import { ClipboardManager, ClipItem } from '../clipboardManager';
import { SnippetManager } from '../snippetManager';
import { TeamManager } from '../teamManager';

export class ClipSyncPanel {
    private static currentPanel: ClipSyncPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    private constructor(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        private clipboardManager: ClipboardManager,
        private snippetManager: SnippetManager,
        private teamManager: TeamManager
    ) {
        this._panel = panel;
        this._extensionUri = extensionUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'getClips': {
                        const clips = await this.clipboardManager.getHistory();
                        this._panel.webview.postMessage({
                            command: 'clips',
                            data: clips,
                        });
                        break;
                    }
                    case 'copyClip': {
                        await vscode.env.clipboard.writeText(message.text);
                        vscode.window.showInformationMessage('Copied to clipboard!');
                        break;
                    }
                    case 'deleteClip': {
                        // Implement delete functionality
                        break;
                    }
                    case 'getSnippets': {
                        const snippets = await this.snippetManager.getSnippets();
                        this._panel.webview.postMessage({
                            command: 'snippets',
                            data: snippets,
                        });
                        break;
                    }
                    case 'insertSnippet': {
                        const editor = vscode.window.activeTextEditor;
                        if (editor) {
                            editor.edit(editBuilder => {
                                editBuilder.insert(editor.selection.active, message.content);
                            });
                        }
                        break;
                    }
                    case 'search': {
                        const searchResults = await this._searchClips(message.query);
                        this._panel.webview.postMessage({
                            command: 'searchResults',
                            data: searchResults,
                        });
                        break;
                    }
                }
            },
            null,
            this._disposables
        );
    }

    private async _searchClips(query: string): Promise<ClipItem[]> {
        const clips = await this.clipboardManager.getHistory();
        if (!query) {
            return clips;
        }
        
        const lowerQuery = query.toLowerCase();
        return clips.filter(clip => 
            clip.content.toLowerCase().includes(lowerQuery) ||
            clip.type.toLowerCase().includes(lowerQuery)
        );
    }

    public static createOrShow(
        extensionUri: vscode.Uri,
        clipboardManager: ClipboardManager,
        snippetManager: SnippetManager,
        teamManager: TeamManager
    ) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ClipSyncPanel.currentPanel) {
            ClipSyncPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'clipsyncPanel',
            'ClipSync',
            column || vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
            }
        );

        ClipSyncPanel.currentPanel = new ClipSyncPanel(
            panel,
            extensionUri,
            clipboardManager,
            snippetManager,
            teamManager
        );
    }

    public static revive(
        panel: vscode.WebviewPanel,
        extensionUri: vscode.Uri,
        clipboardManager: ClipboardManager,
        snippetManager: SnippetManager,
        teamManager: TeamManager
    ) {
        ClipSyncPanel.currentPanel = new ClipSyncPanel(
            panel,
            extensionUri,
            clipboardManager,
            snippetManager,
            teamManager
        );
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // const theme = vscode.window.activeColorTheme;
        // const isDark = theme.kind === vscode.ColorThemeKind.Dark;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClipSync</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 16px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            font-size: 18px;
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
        }

        .search-bar {
            width: 100%;
            padding: 8px 12px;
            margin-bottom: 16px;
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            font-size: 13px;
        }

        .search-bar:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }

        .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .tab {
            padding: 8px 16px;
            background: none;
            border: none;
            color: var(--vscode-foreground);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.2s;
        }

        .tab:hover {
            background-color: var(--vscode-list-hoverBackground);
        }

        .tab.active {
            color: var(--vscode-textLink-foreground);
            border-bottom-color: var(--vscode-textLink-foreground);
        }

        .clip-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .clip-item {
            padding: 12px;
            background-color: var(--vscode-list-inactiveSelectionBackground);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .clip-item:hover {
            background-color: var(--vscode-list-hoverBackground);
            border-color: var(--vscode-focusBorder);
        }

        .clip-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .clip-type {
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 3px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            text-transform: uppercase;
        }

        .clip-time {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
        }

        .clip-content {
            font-size: 13px;
            color: var(--vscode-foreground);
            white-space: pre-wrap;
            word-break: break-word;
            max-height: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .clip-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }

        .btn {
            padding: 4px 12px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }

        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }

        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>ClipSync</h1>
    </div>

    <input type="text" class="search-bar" id="searchInput" placeholder="Search clips...">

    <div class="tabs">
        <button class="tab active" data-tab="clips">Clips</button>
        <button class="tab" data-tab="snippets">Snippets</button>
        <button class="tab" data-tab="teams">Teams</button>
    </div>

    <div id="content">
        <div class="clip-list" id="clipList"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentTab = 'clips';
        let clips = [];

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length > 0) {
                vscode.postMessage({ command: 'search', query });
            } else {
                renderClips(clips);
            }
        });

        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentTab = tab.dataset.tab;
                
                if (currentTab === 'clips') {
                    loadClips();
                } else if (currentTab === 'snippets') {
                    loadSnippets();
                } else if (currentTab === 'teams') {
                    loadTeams();
                }
            });
        });

        function loadClips() {
            vscode.postMessage({ command: 'getClips' });
        }

        function loadSnippets() {
            vscode.postMessage({ command: 'getSnippets' });
        }

        function loadTeams() {
            // Implement team loading
        }

        function renderClips(clipList) {
            const container = document.getElementById('clipList');
            
            if (clipList.length === 0) {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No clips yet. Copy something to get started!</p></div>';
                return;
            }

            container.innerHTML = clipList.map(clip => \`
                <div class="clip-item" data-clip-id="\${clip.id}">
                    <div class="clip-header">
                        <span class="clip-type">\${clip.type}</span>
                        <span class="clip-time">\${formatTime(clip.timestamp)}</span>
                    </div>
                    <div class="clip-content">\${escapeHtml(clip.content.substring(0, 200))}\${clip.content.length > 200 ? '...' : ''}</div>
                    <div class="clip-actions">
                        <button class="btn" onclick="copyClip('\${clip.id}')">Copy</button>
                        <button class="btn btn-secondary" onclick="deleteClip('\${clip.id}')">Delete</button>
                    </div>
                </div>
            \`).join('');
        }

        function copyClip(clipId) {
            const clip = clips.find(c => c.id === clipId);
            if (clip) {
                vscode.postMessage({ command: 'copyClip', text: clip.content });
            }
        }

        function deleteClip(clipId) {
            vscode.postMessage({ command: 'deleteClip', id: clipId });
            clips = clips.filter(c => c.id !== clipId);
            renderClips(clips);
        }

        function formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
            if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
            return date.toLocaleDateString();
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Listen for messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'clips':
                    clips = message.data;
                    renderClips(clips);
                    break;
                case 'searchResults':
                    renderClips(message.data);
                    break;
            }
        });

        // Load clips on startup
        loadClips();
    </script>
</body>
</html>`;
    }

    public dispose() {
        ClipSyncPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

