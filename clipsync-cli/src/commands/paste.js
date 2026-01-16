/**
 * Paste command
 */

const fetch = require('node-fetch');
const clipboardy = require('clipboardy');
const chalk = require('chalk');
const inquirer = require('inquirer');
const config = require('../config');

module.exports = async function pasteCommand(index, options) {
  const token = config.getToken();
  if (!token) {
    console.error(chalk.red('Not authenticated. Run "clipsync login" first.'));
    process.exit(1);
  }

  try {
    // Fetch clips
    const response = await fetch(`${config.getApiUrl()}/clips?limit=50`, {
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

    let selectedClip;

    if (options.interactive || index === undefined) {
      // Interactive selection
      const choices = clips.map((clip, i) => ({
        name: `${clip.content.substring(0, 50)}${clip.content.length > 50 ? '...' : ''} [${clip.type}]`,
        value: i,
      }));

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: 'Select clip to paste:',
          choices,
        },
      ]);

      selectedClip = clips[selected];
    } else {
      // Use index
      const idx = parseInt(index);
      if (idx < 0 || idx >= clips.length) {
        console.error(chalk.red(`Invalid index. Use 0-${clips.length - 1}`));
        process.exit(1);
      }
      selectedClip = clips[idx];
    }

    // Copy to clipboard
    await clipboardy.write(selectedClip.content);
    console.log(chalk.green('✓ Pasted to clipboard'));
    console.log(chalk.gray(selectedClip.content.substring(0, 100)));
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
};

