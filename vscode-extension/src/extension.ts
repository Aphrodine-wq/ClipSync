import * as vscode from 'vscode';
import { ClipboardManager } from './clipboardManager';
import { SnippetManager } from './snippetManager';
import { TeamManager } from './teamManager';
import { TransformManager } from './transformManager';
import { HistoryProvider } from './providers/historyProvider';
import { SnippetProvider } from './providers/snippetProvider';
import { TeamProvider } from './providers/teamProvider';

let clipboardManager: ClipboardManager;
let snippetManager: SnippetManager;
let teamManager: TeamManager;
let transformManager: TransformManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('ClipSync extension is now active!');

    // Initialize managers
    clipboardManager = new ClipboardManager(context);
    snippetManager = new SnippetManager(context);
    teamManager = new TeamManager(context);
    transformManager = new TransformManager();

    // Register tree data providers
    const historyProvider = new HistoryProvider(clipboardManager);
    const snippetProvider = new SnippetProvider(snippetManager);
    const teamProvider = new TeamProvider(teamManager);

    vscode.window.registerTreeDataProvider('clipsync.history', historyProvider);
    vscode.window.registerTreeDataProvider('clipsync.snippets', snippetProvider);
    vscode.window.registerTreeDataProvider('clipsync.team', teamProvider);

    // Register commands
    
    // Open Panel
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.openPanel', async () => {
            const panel = vscode.window.createWebviewPanel(
                'clipsyncPanel',
                'ClipSync',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            panel.webview.html = getWebviewContent();
        })
    );

    // Paste from History
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.pasteFromHistory', async () => {
            const history = await clipboardManager.getHistory();
            
            const items = history.map(item => ({
                label: item.content.substring(0, 50) + (item.content.length > 50 ? '...' : ''),
                description: item.type,
                detail: new Date(item.timestamp).toLocaleString(),
                content: item.content
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select clip to paste'
            });

            if (selected) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, selected.content);
                    });
                }
            }
        })
    );

    // Save as Snippet
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.saveSnippet', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showErrorMessage('No text selected');
                return;
            }

            const title = await vscode.window.showInputBox({
                prompt: 'Enter snippet title',
                placeHolder: 'My Snippet'
            });

            if (!title) return;

            const description = await vscode.window.showInputBox({
                prompt: 'Enter snippet description (optional)',
                placeHolder: 'Description'
            });

            const language = editor.document.languageId;

            await snippetManager.saveSnippet({
                title,
                description: description || '',
                content: selection,
                language,
                tags: []
            });

            vscode.window.showInformationMessage(`Snippet "${title}" saved!`);
            snippetProvider.refresh();
        })
    );

    // Insert Snippet
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.insertSnippet', async () => {
            const snippets = await snippetManager.getSnippets();
            
            const items = snippets.map(snippet => ({
                label: snippet.title,
                description: snippet.language,
                detail: snippet.description,
                content: snippet.content
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select snippet to insert'
            });

            if (selected) {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, selected.content);
                    });
                }
            }
        })
    );

    // Format Code
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.formatCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) return;

            const language = editor.document.languageId;
            
            const formatOptions = [
                { label: 'Beautify JSON', value: 'json-beautify' },
                { label: 'Minify JSON', value: 'json-minify' },
                { label: 'Format SQL', value: 'sql-format' },
                { label: 'Format XML', value: 'xml-format' },
                { label: 'Format HTML', value: 'html-format' },
                { label: 'Format CSS', value: 'css-format' }
            ];

            const selected = await vscode.window.showQuickPick(formatOptions, {
                placeHolder: 'Select format option'
            });

            if (selected) {
                try {
                    const formatted = await transformManager.format(selection, selected.value);
                    editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, formatted);
                    });
                    vscode.window.showInformationMessage('Code formatted!');
                } catch (error: any) {
                    vscode.window.showErrorMessage(`Format error: ${error.message}`);
                }
            }
        })
    );

    // Transform Text
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.transformText', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) return;

            const transforms = [
                { label: 'lowercase', value: 'lowercase' },
                { label: 'UPPERCASE', value: 'uppercase' },
                { label: 'Title Case', value: 'titlecase' },
                { label: 'camelCase', value: 'camelcase' },
                { label: 'snake_case', value: 'snakecase' },
                { label: 'kebab-case', value: 'kebabcase' },
                { label: 'PascalCase', value: 'pascalcase' },
                { label: 'Base64 Encode', value: 'base64-encode' },
                { label: 'Base64 Decode', value: 'base64-decode' },
                { label: 'URL Encode', value: 'url-encode' },
                { label: 'URL Decode', value: 'url-decode' },
                { label: 'SHA-256 Hash', value: 'sha256' },
                { label: 'Reverse', value: 'reverse' },
                { label: 'Sort Lines', value: 'sort-lines' }
            ];

            const selected = await vscode.window.showQuickPick(transforms, {
                placeHolder: 'Select transformation'
            });

            if (selected) {
                try {
                    const transformed = await transformManager.transform(selection, selected.value);
                    editor.edit(editBuilder => {
                        editBuilder.replace(editor.selection, transformed);
                    });
                    vscode.window.showInformationMessage('Text transformed!');
                } catch (error: any) {
                    vscode.window.showErrorMessage(`Transform error: ${error.message}`);
                }
            }
        })
    );

    // Share with Team
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.shareWithTeam', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) return;

            const teams = await teamManager.getTeams();
            
            if (teams.length === 0) {
                vscode.window.showInformationMessage('No teams available. Create a team first.');
                return;
            }

            const teamItems = teams.map(team => ({
                label: team.name,
                description: `${team.memberCount} members`,
                id: team.id
            }));

            const selected = await vscode.window.showQuickPick(teamItems, {
                placeHolder: 'Select team to share with'
            });

            if (selected) {
                await teamManager.shareClip(selected.id, selection);
                vscode.window.showInformationMessage(`Shared with ${selected.label}!`);
                teamProvider.refresh();
            }
        })
    );

    // Generate Commit Message
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.generateCommit', async () => {
            const types = [
                { label: '✨ feat', description: 'A new feature', value: 'feat' },
                { label: '🐛 fix', description: 'A bug fix', value: 'fix' },
                { label: '📝 docs', description: 'Documentation changes', value: 'docs' },
                { label: '♻️ refactor', description: 'Code refactoring', value: 'refactor' },
                { label: '⚡ perf', description: 'Performance improvements', value: 'perf' },
                { label: '✅ test', description: 'Adding tests', value: 'test' },
                { label: '🔨 build', description: 'Build system changes', value: 'build' },
                { label: '🔧 chore', description: 'Other changes', value: 'chore' }
            ];

            const type = await vscode.window.showQuickPick(types, {
                placeHolder: 'Select commit type'
            });

            if (!type) return;

            const scope = await vscode.window.showInputBox({
                prompt: 'Enter scope (optional)',
                placeHolder: 'api, ui, auth'
            });

            const subject = await vscode.window.showInputBox({
                prompt: 'Enter commit subject',
                placeHolder: 'Brief description of the change'
            });

            if (!subject) return;

            let message = type.value;
            if (scope) {
                message += `(${scope})`;
            }
            message += `: ${subject}`;

            await vscode.env.clipboard.writeText(message);
            vscode.window.showInformationMessage('Commit message copied to clipboard!');
        })
    );

    // Test Regex
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.testRegex', async () => {
            const pattern = await vscode.window.showInputBox({
                prompt: 'Enter regex pattern',
                placeHolder: '\\d{3}-\\d{3}-\\d{4}'
            });

            if (!pattern) return;

            const flags = await vscode.window.showInputBox({
                prompt: 'Enter flags (optional)',
                placeHolder: 'g, i, m'
            });

            const testString = await vscode.window.showInputBox({
                prompt: 'Enter test string',
                placeHolder: 'Text to test against the pattern',
                value: vscode.window.activeTextEditor?.document.getText(vscode.window.activeTextEditor.selection)
            });

            if (!testString) return;

            try {
                const regex = new RegExp(pattern, flags || '');
                const matches = testString.match(regex);
                
                if (matches) {
                    vscode.window.showInformationMessage(`Found ${matches.length} match(es): ${matches.join(', ')}`);
                } else {
                    vscode.window.showInformationMessage('No matches found');
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`Regex error: ${error.message}`);
            }
        })
    );

    // Compare Text (Diff)
    context.subscriptions.push(
        vscode.commands.registerCommand('clipsync.compareText', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            const selection = editor.document.getText(editor.selection);
            if (!selection) return;

            const compareWith = await vscode.window.showInputBox({
                prompt: 'Enter text to compare with',
                placeHolder: 'Text to compare',
                value: ''
            });

            if (!compareWith) return;

            // Create temporary documents for diff
            const doc1 = await vscode.workspace.openTextDocument({
                content: selection,
                language: editor.document.languageId
            });

            const doc2 = await vscode.workspace.openTextDocument({
                content: compareWith,
                language: editor.document.languageId
            });

            await vscode.commands.executeCommand('vscode.diff', doc1.uri, doc2.uri, 'ClipSync Diff');
        })
    );

    // Start clipboard monitoring
    if (vscode.workspace.getConfiguration('clipsync').get('autoCapture')) {
        clipboardManager.startMonitoring();
    }

    // Refresh providers periodically
    setInterval(() => {
        historyProvider.refresh();
        snippetProvider.refresh();
        teamProvider.refresh();
    }, 5000);

    vscode.window.showInformationMessage('ClipSync is ready! Press Ctrl+Shift+V to open.');
}

export function deactivate() {
    if (clipboardManager) {
        clipboardManager.stopMonitoring();
    }
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ClipSync</title>
        <style>
            body {
                font-family: var(--vscode-font-family);
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
                padding: 20px;
            }
            h1 {
                color: var(--vscode-textLink-foreground);
            }
            .clip-item {
                padding: 10px;
                margin: 10px 0;
                background-color: var(--vscode-editor-inactiveSelectionBackground);
                border-radius: 4px;
                cursor: pointer;
            }
            .clip-item:hover {
                background-color: var(--vscode-list-hoverBackground);
            }
        </style>
    </head>
    <body>
        <h1>ClipSync Panel</h1>
        <p>Clipboard history and snippets will appear here.</p>
        <div id="clips"></div>
    </body>
    </html>`;
}
