/**
 * Settings Provider
 * Manages VS Code extension settings and provides settings UI
 */

import * as vscode from 'vscode';

export interface ClipSyncSettings {
    enabled: boolean;
    autoCapture: boolean;
    maxHistory: number;
    syncEnabled: boolean;
    apiUrl: string;
    showNotifications: boolean;
}

export class SettingsProvider {
    private static readonly SECTION = 'clipsync';

    /**
     * Get all settings
     */
    static getSettings(): ClipSyncSettings {
        const config = vscode.workspace.getConfiguration(this.SECTION);
        
        return {
            enabled: config.get<boolean>('enabled', true),
            autoCapture: config.get<boolean>('autoCapture', true),
            maxHistory: config.get<number>('maxHistory', 100),
            syncEnabled: config.get<boolean>('syncEnabled', false),
            apiUrl: config.get<string>('apiUrl', 'http://localhost:3001'),
            showNotifications: config.get<boolean>('showNotifications', true),
        };
    }

    /**
     * Update a setting
     */
    static async updateSetting<K extends keyof ClipSyncSettings>(
        key: K,
        value: ClipSyncSettings[K]
    ): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    /**
     * Update multiple settings
     */
    static async updateSettings(settings: Partial<ClipSyncSettings>): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.SECTION);
        
        for (const [key, value] of Object.entries(settings)) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
    }

    /**
     * Reset all settings to defaults
     */
    static async resetSettings(): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.SECTION);
        
        await config.update('enabled', undefined, vscode.ConfigurationTarget.Global);
        await config.update('autoCapture', undefined, vscode.ConfigurationTarget.Global);
        await config.update('maxHistory', undefined, vscode.ConfigurationTarget.Global);
        await config.update('syncEnabled', undefined, vscode.ConfigurationTarget.Global);
        await config.update('apiUrl', undefined, vscode.ConfigurationTarget.Global);
        await config.update('showNotifications', undefined, vscode.ConfigurationTarget.Global);
    }

    /**
     * Open settings UI
     */
    static async openSettings(): Promise<void> {
        await vscode.commands.executeCommand(
            'workbench.action.openSettings',
            `@id:${this.SECTION}`
        );
    }
}

