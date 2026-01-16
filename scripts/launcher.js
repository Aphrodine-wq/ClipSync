#!/usr/bin/env node

/**
 * ClipSync Launcher
 * Starts all services and opens the application
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const path = require('path');
const fs = require('fs');

const execPromise = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if Docker is running
async function checkDocker() {
  try {
    await execPromise('docker ps');
    return true;
  } catch (error) {
    return false;
  }
}

// Try to start Docker Desktop (Windows)
async function tryStartDockerDesktop() {
  const os = require('os');
  if (os.platform() !== 'win32') {
    return false;
  }

  const possiblePaths = [
    `${process.env.ProgramFiles}\\Docker\\Docker\\Docker Desktop.exe`,
    `${process.env['ProgramFiles(x86)']}\\Docker\\Docker\\Docker Desktop.exe`,
    `${process.env.LOCALAPPDATA}\\Docker\\Docker Desktop.exe`,
  ];

  const fs = require('fs');
  for (const dockerPath of possiblePaths) {
    if (fs.existsSync(dockerPath)) {
      log('🔍 Docker Desktop found. Attempting to start...', 'cyan');
      try {
        exec(`start "" "${dockerPath}"`, (error) => {
          if (error) {
            log('⚠️  Could not start Docker Desktop automatically', 'yellow');
          }
        });
        return true;
      } catch (error) {
        return false;
      }
    }
  }
  return false;
}

// Wait for Docker to become available
async function waitForDocker(maxWaitSeconds = 60) {
  log('⏳ Waiting for Docker Desktop to start...', 'cyan');
  log('   This may take 30-60 seconds. Please wait...', 'yellow');
  
  const startTime = Date.now();
  const maxWait = maxWaitSeconds * 1000;
  const checkInterval = 3000; // Check every 3 seconds

  while (Date.now() - startTime < maxWait) {
    const isRunning = await checkDocker();
    if (isRunning) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      log(`✅ Docker is now running! (started in ${elapsed} seconds)`, 'green');
      return true;
    }
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed % 6 === 0) { // Log every 6 seconds
      log(`   Still waiting... (${elapsed} seconds)`, 'yellow');
    }
    
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  return false;
}

// Start Docker services
async function startDockerServices() {
  log('\n🐳 Starting Docker services...', 'cyan');
  try {
    const dockerComposePath = path.join(__dirname, '..', 'docker-compose.local.yml');
    if (!fs.existsSync(dockerComposePath)) {
      log('⚠️  docker-compose.local.yml not found, skipping Docker services', 'yellow');
      return;
    }

    // Check if services are already running
    try {
      const { stdout } = await execPromise('docker-compose -f docker-compose.local.yml ps -q');
      if (stdout.trim()) {
        log('✅ Docker services already running', 'green');
        return;
      }
    } catch (e) {
      // Services not running, continue
    }

    const dockerProcess = spawn('docker-compose', ['-f', 'docker-compose.local.yml', 'up', '-d'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve, reject) => {
      dockerProcess.on('close', (code) => {
        if (code === 0) {
          log('✅ Docker services started', 'green');
          // Wait a bit for services to be ready
          setTimeout(resolve, 3000);
        } else {
          log('⚠️  Docker services may not have started correctly', 'yellow');
          resolve(); // Continue anyway
        }
      });
      dockerProcess.on('error', reject);
    });
  } catch (error) {
    log('⚠️  Could not start Docker services. Make sure Docker Desktop is running.', 'yellow');
  }
}

// Check if .env files exist
function checkEnvFiles() {
  const rootDir = path.join(__dirname, '..');
  const backendEnv = path.join(rootDir, 'backend', '.env');
  const frontendEnv = path.join(rootDir, 'clipsync-app', '.env');

  if (!fs.existsSync(backendEnv)) {
    log('⚠️  backend/.env not found. Creating from template...', 'yellow');
    const backendExample = path.join(rootDir, 'backend', '.env.example');
    if (fs.existsSync(backendExample)) {
      fs.copyFileSync(backendExample, backendEnv);
      log('✅ Created backend/.env (please update with your values)', 'green');
    }
  }

  if (!fs.existsSync(frontendEnv)) {
    log('⚠️  clipsync-app/.env not found. Creating from template...', 'yellow');
    const frontendExample = path.join(rootDir, 'clipsync-app', '.env.example');
    if (fs.existsSync(frontendExample)) {
      fs.copyFileSync(frontendExample, frontendEnv);
      log('✅ Created clipsync-app/.env (please update with your values)', 'green');
    }
  }
}

// Start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    log('\n🚀 Starting backend server...', 'cyan');
    const backendPath = path.join(__dirname, '..', 'backend');
    
    if (!fs.existsSync(path.join(backendPath, 'node_modules'))) {
      log('📦 Installing backend dependencies...', 'yellow');
      const installProcess = spawn('npm', ['install'], {
        cwd: backendPath,
        stdio: 'inherit',
        shell: true
      });

      installProcess.on('close', (code) => {
        if (code !== 0) {
          log('❌ Failed to install backend dependencies', 'red');
          reject(new Error('Backend install failed'));
          return;
        }
        startBackendServer();
      });
    } else {
      startBackendServer();
    }

    function startBackendServer() {
      const backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        stdio: 'inherit',
        shell: true
      });

      backendProcess.on('error', reject);
      
      // Wait a bit for server to start
      setTimeout(() => {
        log('✅ Backend server starting on http://localhost:3001', 'green');
        resolve(backendProcess);
      }, 2000);
    }
  });
}

// Start frontend server
function startFrontend() {
  return new Promise((resolve, reject) => {
    log('\n🎨 Starting frontend server...', 'cyan');
    const frontendPath = path.join(__dirname, '..', 'clipsync-app');
    
    if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
      log('📦 Installing frontend dependencies...', 'yellow');
      const installProcess = spawn('npm', ['install'], {
        cwd: frontendPath,
        stdio: 'inherit',
        shell: true
      });

      installProcess.on('close', (code) => {
        if (code !== 0) {
          log('❌ Failed to install frontend dependencies', 'red');
          reject(new Error('Frontend install failed'));
          return;
        }
        startFrontendServer();
      });
    } else {
      startFrontendServer();
    }

    function startFrontendServer() {
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        stdio: 'inherit',
        shell: true
      });

      frontendProcess.on('error', reject);
      
      // Wait a bit for server to start, then open browser
      setTimeout(() => {
        log('✅ Frontend server starting on http://localhost:5173', 'green');
        setTimeout(() => {
          openBrowser();
        }, 3000);
        resolve(frontendProcess);
      }, 2000);
    }
  });
}

// Open browser
function openBrowser() {
  log('\n🌐 Opening browser...', 'cyan');
  const url = 'http://localhost:5173';
  
  const platform = process.platform;
  let command;
  
  if (platform === 'win32') {
    command = `start ${url}`;
  } else if (platform === 'darwin') {
    command = `open ${url}`;
  } else {
    command = `xdg-open ${url}`;
  }
  
  exec(command, (error) => {
    if (error) {
      log(`⚠️  Could not open browser automatically. Please visit ${url}`, 'yellow');
    } else {
      log(`✅ Opened ${url}`, 'green');
    }
  });
}

// Main function
async function main() {
  log('\n╔═══════════════════════════════════════╗', 'cyan');
  log('║   🚀 ClipSync Launcher                ║', 'cyan');
  log('╚═══════════════════════════════════════╝', 'cyan');
  
  // Check Docker
  let dockerRunning = await checkDocker();
  if (!dockerRunning) {
    log('\n╔═══════════════════════════════════════╗', 'yellow');
    log('║   Docker Not Running                  ║', 'yellow');
    log('╚═══════════════════════════════════════╝', 'yellow');
    log('\nDocker Desktop needs to be running for ClipSync.', 'yellow');
    
    const dockerStarted = await tryStartDockerDesktop();
    
    if (dockerStarted) {
      log('\nDocker Desktop is starting...', 'cyan');
      const dockerReady = await waitForDocker(60);
      
      if (!dockerReady) {
        log('\n❌ Docker did not start within 60 seconds.', 'red');
        log('Please start Docker Desktop manually and try again.', 'yellow');
        log('\nDownload Docker Desktop: https://www.docker.com/products/docker-desktop/', 'blue');
        process.exit(1);
      }
      
      dockerRunning = true;
    } else {
      log('\n❌ Could not start Docker Desktop automatically.', 'red');
      log('\nPlease:', 'yellow');
      log('1. Start Docker Desktop manually', 'yellow');
      log('2. Wait for it to fully start (whale icon in system tray)', 'yellow');
      log('3. Run ClipSync again', 'yellow');
      log('\nDownload Docker Desktop: https://www.docker.com/products/docker-desktop/', 'blue');
      process.exit(1);
    }
  }

  // Check/create env files
  checkEnvFiles();

  // Start Docker services
  await startDockerServices();

  // Start backend
  const backendProcess = await startBackend();

  // Start frontend
  const frontendProcess = await startFrontend();

  log('\n╔═══════════════════════════════════════╗', 'green');
  log('║   ✅ ClipSync is running!             ║', 'green');
  log('║   📡 Backend: http://localhost:3001   ║', 'green');
  log('║   🎨 Frontend: http://localhost:5173 ║', 'green');
  log('╚═══════════════════════════════════════╝', 'green');
  log('\nPress Ctrl+C to stop all services\n', 'yellow');

  // Handle cleanup on exit
  process.on('SIGINT', () => {
    log('\n\n🛑 Stopping services...', 'yellow');
    backendProcess.kill();
    frontendProcess.kill();
    log('✅ Services stopped. Goodbye!', 'green');
    process.exit(0);
  });

  // Keep process alive
  process.on('exit', () => {
    backendProcess.kill();
    frontendProcess.kill();
  });
}

// Run main function
main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

