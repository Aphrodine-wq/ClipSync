/**
 * Copy command
 */

const fetch = require('node-fetch');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const config = require('../config');

module.exports = async function copyCommand(content, options) {
  const token = config.getToken();
  if (!token) {
    console.error(chalk.red('Not authenticated. Run "clipsync login" first.'));
    process.exit(1);
  }

  try {
    // Copy to system clipboard
    await clipboardy.write(content);
    console.log(chalk.green('✓ Copied to clipboard'));

    // Sync to server
    const response = await fetch(`${config.getApiUrl()}/clips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        type: options.type || 'text',
        pinned: options.pin || false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(chalk.green('✓ Synced to ClipSync'));
      return data;
    } else {
      console.warn(chalk.yellow('⚠ Failed to sync (clipboard copied locally)'));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
};

