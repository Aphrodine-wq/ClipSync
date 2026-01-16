import * as vscode from 'vscode';

export interface ClipItem {
    id: string;
    content: string;
    type: string;
    timestamp: number;
}

export class ClipboardManager {
    private history: ClipItem[] = [];
    private maxHistory: number = 100;
    private monitoringInterval: NodeJS.Timeout | null = null;
    private lastClipboard: string = '';

    constructor(private context: vscode.ExtensionContext) {
        this.loadHistory();
        this.maxHistory = vscode.workspace.getConfiguration('clipsync').get('maxHistory') || 100;
    }

    async startMonitoring() {
        this.monitoringInterval = setInterval(async () => {
            try {
                const current = await vscode.env.clipboard.readText();
                if (current && current !== this.lastClipboard) {
                    this.lastClipboard = current;
                    await this.addToHistory(current);
                }
            } catch (error) {
                console.error('Clipboard monitoring error:', error);
            }
        }, 1000);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    async addToHistory(content: string) {
        const item: ClipItem = {
            id: Date.now().toString(),
            content,
            type: this.detectType(content),
            timestamp: Date.now()
        };

        this.history.unshift(item);
        
        if (this.history.length > this.maxHistory) {
            this.history = this.history.slice(0, this.maxHistory);
        }

        await this.saveHistory();

        if (vscode.workspace.getConfiguration('clipsync').get('showNotifications')) {
            vscode.window.setStatusBarMessage(`ClipSync: Captured ${item.type}`, 2000);
        }
    }

    async getHistory(): Promise<ClipItem[]> {
        return this.history;
    }

    async clearHistory() {
        this.history = [];
        await this.saveHistory();
    }

    private detectType(content: string): string {
        // JSON
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            try {
                JSON.parse(content);
                return 'json';
            } catch {}
        }

        // URL
        if (/^https?:\/\//i.test(content)) {
            return 'url';
        }

        // Email
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content)) {
            return 'email';
        }

        // UUID
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(content)) {
            return 'uuid';
        }

        // Color
        if (/^#[0-9a-f]{6}$/i.test(content)) {
            return 'color';
        }

        // Code (contains common programming keywords)
        if (/\b(function|const|let|var|class|import|export|return|if|else|for|while)\b/.test(content)) {
            return 'code';
        }

        return 'text';
    }

    private async loadHistory() {
        const saved = this.context.globalState.get<ClipItem[]>('clipHistory');
        if (saved) {
            this.history = saved;
        }
    }

    private async saveHistory() {
        await this.context.globalState.update('clipHistory', this.history);
    }
}
