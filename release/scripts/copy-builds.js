#!/usr/bin/env node

/**
 * Copy Build Artifacts to Release Folder
 * 
 * This script copies built executables and installers from the dist folder
 * to the release folder for distribution.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const DIST_DIR = path.join(__dirname, '../../clipsync-desktop/dist');
const RELEASE_DIR = path.join(__dirname, '../windows');
const CHECKSUMS_FILE = path.join(__dirname, '../checksums.txt');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function calculateChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    const checksum = calculateChecksum(destination);
    const fileName = path.basename(destination);
    const fileSize = (fs.statSync(destination).size / (1024 * 1024)).toFixed(2);
    
    log(`✓ Copied: ${fileName} (${fileSize} MB)`, 'green');
    return { fileName, checksum, fileSize };
  } catch (error) {
    log(`✗ Failed to copy: ${path.basename(source)} - ${error.message}`, 'red');
    return null;
  }
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`Created directory: ${dirPath}`, 'cyan');
  }
}

function main() {
  log('\n🚀 ClipSync Release Build Copy Script\n', 'cyan');

  // Ensure release directory exists
  ensureDirectoryExists(RELEASE_DIR);

  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    log('✗ Dist directory not found. Please build the app first.', 'red');
    log(`  Run: cd clipsync-desktop && npm run build:win`, 'yellow');
    process.exit(1);
  }

  const checksums = [];
  let copiedCount = 0;

  // Files to copy
  const filesToCopy = [
    { pattern: /ClipSync-Setup-.*\.exe$/, description: 'Windows Installer' },
    { pattern: /ClipSync-Portable-.*\.exe$/, description: 'Portable Version' },
    { pattern: /latest\.yml$/, description: 'Auto-update metadata' },
  ];

  log('📦 Copying build artifacts...\n', 'cyan');

  // Read dist directory
  const distFiles = fs.readdirSync(DIST_DIR);

  filesToCopy.forEach(({ pattern, description }) => {
    const matchingFiles = distFiles.filter(file => pattern.test(file));
    
    if (matchingFiles.length === 0) {
      log(`⚠ No files found matching: ${description}`, 'yellow');
      return;
    }

    matchingFiles.forEach(file => {
      const source = path.join(DIST_DIR, file);
      const destination = path.join(RELEASE_DIR, file);
      
      const result = copyFile(source, destination);
      if (result) {
        checksums.push(result);
        copiedCount++;
      }
    });
  });

  // Generate checksums file
  if (checksums.length > 0) {
    log('\n📝 Generating checksums...\n', 'cyan');
    
    let checksumsContent = '# ClipSync Release Checksums (SHA256)\n';
    checksumsContent += `# Generated: ${new Date().toISOString()}\n\n`;
    
    checksums.forEach(({ fileName, checksum, fileSize }) => {
      checksumsContent += `${checksum}  ${fileName}\n`;
      log(`${fileName}: ${checksum}`, 'green');
    });

    fs.writeFileSync(CHECKSUMS_FILE, checksumsContent);
    log(`\n✓ Checksums saved to: ${CHECKSUMS_FILE}`, 'green');
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log(`✓ Successfully copied ${copiedCount} file(s)`, 'green');
  log(`📁 Release folder: ${RELEASE_DIR}`, 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  if (copiedCount === 0) {
    log('⚠ No files were copied. Please check your build output.', 'yellow');
    process.exit(1);
  }
}

// Run the script
try {
  main();
} catch (error) {
  log(`\n✗ Error: ${error.message}`, 'red');
  process.exit(1);
}
