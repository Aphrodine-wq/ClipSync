import * as vscode from 'vscode';
import { SnippetManager, Snippet } from '../snippetManager';

export class SnippetProvider implements vscode.TreeDataProvider<SnippetTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SnippetTreeItem | undefined | null | void> = new vscode.EventEmitter<SnippetTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SnippetTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private snippetManager: SnippetManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SnippetTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: SnippetTreeItem): Promise<SnippetTreeItem[]> {
        if (element) {
            return [];
        }

        const snippets = await this.snippetManager.getSnippets();
        return snippets.map(snippet => new SnippetTreeItem(snippet));
    }
}

class SnippetTreeItem extends vscode.TreeItem {
    constructor(public readonly snippet: Snippet) {
        super(snippet.title, vscode.TreeItemCollapsibleState.None);

        this.tooltip = snippet.description;
        this.description = snippet.language;
        this.contextValue = 'snippet';
        
        this.command = {
            command: 'clipsync.insertSnippetFromTree',
            title: 'Insert Snippet',
            arguments: [snippet]
        };

        this.iconPath = snippet.favorite 
            ? new vscode.ThemeIcon('star-full')
            : new vscode.ThemeIcon('symbol-snippet');
    }
}
