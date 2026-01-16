/**
 * Login command
 */

const fetch = require('node-fetch');
const chalk = require('chalk');
const inquirer = require('inquirer');
const config = require('../config');

module.exports = async function loginCommand() {
  try {
    const { email, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email:',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:',
      },
    ]);

    // In production, use actual auth endpoint
    // For now, this is a placeholder
    console.log(chalk.yellow('Note: CLI login requires API token.'));
    console.log(chalk.yellow('Get your token from: https://clipsync.com/settings/api'));

    const { token } = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: 'API Token:',
      },
    ]);

    // Validate token
    const response = await fetch(`${config.getApiUrl()}/clips?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      config.setToken(token);
      console.log(chalk.green('✓ Login successful'));
    } else {
      throw new Error('Invalid token');
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
};

