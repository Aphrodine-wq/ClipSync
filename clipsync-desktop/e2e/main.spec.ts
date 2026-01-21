import { _electron as electron, test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('ClipSync Desktop', () => {
    test('launches successfully', async () => {
        // Launch Electron app
        const electronApp = await electron.launch({
            args: [path.join(__dirname, '../main.js')],
        });

        // Get the first window
        const window = await electronApp.firstWindow();

        // Check title or content
        const title = await window.title();
        expect(title).toBe('ClipSync');

        // Close app
        await electronApp.close();
    });
});
