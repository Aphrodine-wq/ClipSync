/**
 * Search command
 */

const fetch = require('node-fetch');
const chalk = require('chalk');
const config = require('../config');

module.exports = async function searchCommand(query, options) {
  const token = config.getToken();
  if (!token) {
    console.error(chalk.red('Not authenticated. Run "clipsync login" first.'));
    process.exit(1);
  }

  try {
    const params = new URLSearchParams({
      search: query,
      limit: options.limit || '10',
    });

    if (options.type) {
      params.append('type', options.type);
    }

    const response = await fetch(`${config.getApiUrl()}/clips?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search clips');
    }

    const data = await response.json();
    const clips = data.clips || [];

    if (clips.length === 0) {
      console.log(chalk.yellow('No clips found'));
      return;
    }

    console.log(chalk.blue(`Found ${clips.length} clips:\n`));

    clips.forEach((clip, i) => {
      console.log(chalk.gray(`${i}. [${clip.type}]`));
      console.log(clip.content.substring(0, 100) + (clip.content.length > 100 ? '...' : ''));
      console.log(chalk.gray(`   Created: ${new Date(clip.created_at).toLocaleString()}\n`));
    });
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
};

