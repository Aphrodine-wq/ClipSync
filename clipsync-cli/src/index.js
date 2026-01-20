#!/usr/bin/env node

/**
 * ClipSync CLI
 * Command-line interface for ClipSync
 */

const { Command } = require('commander');
const chalk = require('chalk');
const config = require('./config');
const copyCommand = require('./commands/copy');
const pasteCommand = require('./commands/paste');
const searchCommand = require('./commands/search');
const listCommand = require('./commands/list');
const syncCommand = require('./commands/sync');
const loginCommand = require('./commands/login');

const program = new Command();

program
  .name('clipsync')
  .description('ClipSync CLI - Professional clipboard manager')
  .version('1.0.0');

// Login command
program
  .command('login')
  .description('Authenticate with ClipSync')
  .action(loginCommand);

// Copy command
program
  .command('copy <content>')
  .alias('c')
  .description('Copy content to clipboard and sync')
  .option('-t, --type <type>', 'Content type (text, code, json, etc.)', 'text')
  .option('-p, --pin', 'Pin the clip')
  .action(copyCommand);

// Paste command
program
  .command('paste [index]')
  .alias('p')
  .description('Paste from clipboard history')
  .option('-i, --interactive', 'Interactive mode to select clip')
  .action(pasteCommand);

// Search command
program
  .command('search <query>')
  .alias('s')
  .description('Search clips')
  .option('-t, --type <type>', 'Filter by type')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(searchCommand);

// List command
program
  .command('list')
  .alias('l')
  .description('List recent clips')
  .option('-l, --limit <number>', 'Number of clips to show', '20')
  .option('-p, --pinned', 'Show only pinned clips')
  .action(listCommand);

// Sync command
program
  .command('sync')
  .description('Force sync with server')
  .action(syncCommand);

// Interactive mode
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    const inquirer = require('inquirer');
    
    while (true) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
          choices: [
            { name: '📋 List clips', value: 'list' },
            { name: '🔍 Search clips', value: 'search' },
            { name: '📝 Copy text', value: 'copy' },
            { name: '📄 Paste clip', value: 'paste' },
            { name: '🔄 Sync', value: 'sync' },
            { name: '❌ Exit', value: 'exit' },
          ],
        },
      ]);

      if (action === 'exit') {
        console.log(chalk.green('Goodbye!'));
        break;
      }

      // Execute action
      try {
        switch (action) {
          case 'list': {
            await listCommand({ limit: '20' });
            break;
          }
          case 'search': {
            const { query } = await inquirer.prompt([
              { type: 'input', name: 'query', message: 'Search query:' },
            ]);
            await searchCommand(query, {});
            break;
          }
          case 'copy': {
            const { content } = await inquirer.prompt([
              { type: 'input', name: 'content', message: 'Content to copy:' },
            ]);
            await copyCommand(content, {});
            break;
          }
          case 'paste': {
            await pasteCommand(undefined, { interactive: true });
            break;
          }
          case 'sync': {
            await syncCommand();
            break;
          }
        }
      } catch (error) {
        console.error(chalk.red('Error:'), error.message);
      }
    }
  });

// Parse arguments
program.parse();

