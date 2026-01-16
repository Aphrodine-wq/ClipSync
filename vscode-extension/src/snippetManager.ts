import * as vscode from 'vscode';

export interface Snippet {
    id: string;
    title: string;
    description: string;
    content: string;
    language: string;
    tags: string[];
    favorite: boolean;
    createdAt: number;
    updatedAt: number;
}

export class SnippetManager {
    private snippets: Snippet[] = [];

    constructor(private context: vscode.ExtensionContext) {
        this.loadSnippets();
    }

    async saveSnippet(snippet: Omit<Snippet, 'id' | 'favorite' | 'createdAt' | 'updatedAt'>): Promise<Snippet> {
        const newSnippet: Snippet = {
            ...snippet,
            id: Date.now().toString(),
            favorite: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.snippets.unshift(newSnippet);
        await this.persist();
        return newSnippet;
    }

    async getSnippets(): Promise<Snippet[]> {
        return this.snippets;
    }

    async updateSnippet(id: string, updates: Partial<Snippet>): Promise<void> {
        const index = this.snippets.findIndex(s => s.id === id);
        if (index !== -1) {
            this.snippets[index] = {
                ...this.snippets[index],
                ...updates,
                updatedAt: Date.now()
            };
            await this.persist();
        }
    }

    async deleteSnippet(id: string): Promise<void> {
        this.snippets = this.snippets.filter(s => s.id !== id);
        await this.persist();
    }

    async toggleFavorite(id: string): Promise<void> {
        const snippet = this.snippets.find(s => s.id === id);
        if (snippet) {
            snippet.favorite = !snippet.favorite;
            await this.persist();
        }
    }

    async searchSnippets(query: string): Promise<Snippet[]> {
        const lowerQuery = query.toLowerCase();
        return this.snippets.filter(s =>
            s.title.toLowerCase().includes(lowerQuery) ||
            s.description.toLowerCase().includes(lowerQuery) ||
            s.content.toLowerCase().includes(lowerQuery) ||
            s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    private async loadSnippets() {
        const saved = this.context.globalState.get<Snippet[]>('snippets');
        if (saved) {
            this.snippets = saved;
        }
    }

    private async persist() {
        await this.context.globalState.update('snippets', this.snippets);
    }
}
