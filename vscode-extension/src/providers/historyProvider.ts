import * as vscode from 'vscode';
import { ClipboardManager, ClipItem } from '../clipboardManager';

export class HistoryProvider implements vscode.TreeDataProvider<ClipTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ClipTreeItem | undefined | null | void> = new vscode.EventEmitter<ClipTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ClipTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private clipboardManager: ClipboardManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ClipTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ClipTreeItem): Promise<ClipTreeItem[]> {
        if (element) {
            return [];
        }

        const history = await this.clipboardManager.getHistory();
        return history.map(clip => new ClipTreeItem(clip));
    }
}

class ClipTreeItem extends vscode.TreeItem {
    constructor(public readonly clip: ClipItem) {
        super(
            clip.content.substring(0, 50) + (clip.content.length > 50 ? '...' : ''),
            vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = clip.content;
        this.description = clip.type;
        this.contextValue = 'clip';
        
        this.command = {
            command: 'clipsync.pasteClip',
            title: 'Paste Clip',
            arguments: [clip]
        };

        // Set icon based on type
        this.iconPath = new vscode.ThemeIcon(this.getIconForType(clip.type));
    }

    private getIconForType(type: string): string {
        const iconMap: Record<string, string> = {
            'code': 'code',
            'json': 'json',
            'url': 'link',
            'email': 'mail',
            'uuid': 'key',
            'color': 'symbol-color',
            'text': 'file-text'
        };
        return iconMap[type] || 'file';
    }
}
