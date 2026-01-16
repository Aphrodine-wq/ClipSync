/**
 * Sync command
 */

const fetch = require('node-fetch');
const chalk = require('chalk');
const config = require('../config');

module.exports = async function syncCommand() {
  const token = config.getToken();
  if (!token) {
    console.error(chalk.red('Not authenticated. Run "clipsync login" first.'));
    process.exit(1);
  }

  try {
    console.log(chalk.blue('Syncing with server...'));

    const response = await fetch(`${config.getApiUrl()}/clips?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log(chalk.green('✓ Sync complete'));
    } else {
      throw new Error('Sync failed');
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
};

