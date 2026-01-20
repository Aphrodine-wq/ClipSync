import * as vscode from 'vscode';
import { TeamManager, Team, TeamClip } from '../teamManager';

type TeamTreeNode = TeamTreeItem | TeamClipTreeItem;

export class TeamProvider implements vscode.TreeDataProvider<TeamTreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TeamTreeNode | undefined | null | void> = new vscode.EventEmitter<TeamTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TeamTreeNode | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private teamManager: TeamManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TeamTreeNode): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TeamTreeNode): Promise<TeamTreeNode[]> {
        if (!element) {
            const teams = await this.teamManager.getTeams();
            return teams.map(team => new TeamTreeItem(team, this.teamManager));
        }

        if (element instanceof TeamTreeItem) {
            const clips = await this.teamManager.getTeamClips(element.team.id);
            return clips.map(clip => new TeamClipTreeItem(clip));
        }

        return [];
    }
}

class TeamTreeItem extends vscode.TreeItem {
    constructor(
        public readonly team: Team,
        private teamManager: TeamManager
    ) {
        super(team.name, vscode.TreeItemCollapsibleState.Collapsed);

        this.description = `${team.memberCount} members`;
        this.contextValue = 'team';
        this.iconPath = new vscode.ThemeIcon('organization');
    }
}

class TeamClipTreeItem extends vscode.TreeItem {
    constructor(public readonly clip: TeamClip) {
        super(
            clip.content.substring(0, 50) + (clip.content.length > 50 ? '...' : ''),
            vscode.TreeItemCollapsibleState.None
        );

        this.tooltip = `${clip.userName}: ${clip.content}`;
        this.description = clip.type;
        this.contextValue = 'teamClip';
        
        this.command = {
            command: 'clipsync.pasteTeamClip',
            title: 'Paste Team Clip',
            arguments: [clip]
        };

        this.iconPath = new vscode.ThemeIcon('file');
    }
}
