/**
 * List command
 */

const fetch = require('node-fetch');
const chalk = require('chalk');
const config = require('../config');

module.exports = async function listCommand(options) {
  const token = config.getToken();
  if (!token) {
    console.error(chalk.red('Not authenticated. Run "clipsync login" first.'));
    process.exit(1);
  }

  try {
    const params = new URLSearchParams({
      limit: options.limit || '20',
    });

    if (options.pinned) {
      params.append('pinned', 'true');
    }

    const response = await fetch(`${config.getApiUrl()}/clips?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch clips');
    }

    const data = await response.json();
    const clips = data.clips || [];

    if (clips.length === 0) {
      console.log(chalk.yellow('No clips found'));
      return;
    }

    console.log(chalk.blue(`Recent clips (${clips.length}):\n`));

    clips.forEach((clip, i) => {
      const pin = clip.pinned ? chalk.yellow('📌 ') : '';
      console.log(chalk.gray(`${i}. ${pin}[${clip.type}]`));
      console.log(clip.content.substring(0, 80) + (clip.content.length > 80 ? '...' : ''));
      console.log(chalk.gray(`   ${new Date(clip.created_at).toLocaleString()}\n`));
    });
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
};

