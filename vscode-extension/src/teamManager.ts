import * as vscode from 'vscode';
import axios from 'axios';

export interface Team {
    id: string;
    name: string;
    memberCount: number;
}

export interface TeamClip {
    id: string;
    teamId: string;
    content: string;
    type: string;
    userId: string;
    userName: string;
    timestamp: number;
}

export class TeamManager {
    private teams: Team[] = [];
    private teamClips: Map<string, TeamClip[]> = new Map();
    private apiUrl: string;

    constructor(private context: vscode.ExtensionContext) {
        this.apiUrl = vscode.workspace.getConfiguration('clipsync').get('apiUrl') || 'http://localhost:3001';
        this.loadTeams();
    }

    async getTeams(): Promise<Team[]> {
        try {
            const response = await axios.get(`${this.apiUrl}/api/teams`, {
                headers: this.getAuthHeaders()
            });
            this.teams = response.data;
            return this.teams;
        } catch (error) {
            console.error('Failed to fetch teams:', error);
            return this.teams;
        }
    }

    async getTeamClips(teamId: string): Promise<TeamClip[]> {
        try {
            const response = await axios.get(`${this.apiUrl}/api/teams/${teamId}/clips`, {
                headers: this.getAuthHeaders()
            });
            const clips = response.data;
            this.teamClips.set(teamId, clips);
            return clips;
        } catch (error) {
            console.error('Failed to fetch team clips:', error);
            return this.teamClips.get(teamId) || [];
        }
    }

    async shareClip(teamId: string, content: string): Promise<void> {
        try {
            await axios.post(`${this.apiUrl}/api/teams/${teamId}/clips`, {
                content,
                type: this.detectType(content)
            }, {
                headers: this.getAuthHeaders()
            });
        } catch (error) {
            console.error('Failed to share clip:', error);
            throw error;
        }
    }

    async createTeam(name: string): Promise<Team> {
        try {
            const response = await axios.post(`${this.apiUrl}/api/teams`, {
                name
            }, {
                headers: this.getAuthHeaders()
            });
            const team = response.data;
            this.teams.push(team);
            return team;
        } catch (error) {
            console.error('Failed to create team:', error);
            throw error;
        }
    }

    private detectType(content: string): string {
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
            try {
                JSON.parse(content);
                return 'json';
            } catch {
                // Ignore JSON parse errors
            }
        }
        if (/^https?:\/\//i.test(content)) return 'url';
        if (/\b(function|const|let|var|class)\b/.test(content)) return 'code';
        return 'text';
    }

    private getAuthHeaders(): Record<string, string> {
        const token = this.context.globalState.get<string>('authToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    private async loadTeams() {
        const saved = this.context.globalState.get<Team[]>('teams');
        if (saved) {
            this.teams = saved;
        }
    }
}
