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

        this.tooltip = this.getTooltip();
        this.description = `${clip.type} • ${this.formatTime(clip.timestamp)}`;
        this.contextValue = 'clip';
        
        this.command = {
            command: 'clipsync.pasteClip',
            title: 'Paste Clip',
            arguments: [clip]
        };

        // Set icon based on type
        this.iconPath = new vscode.ThemeIcon(this.getIconForType(clip.type));
    }

    private getTooltip(): string {
        const time = new Date(this.clip.timestamp).toLocaleString();
        return `${this.clip.content}\n\nType: ${this.clip.type}\nTime: ${time}`;
    }

    private formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
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
