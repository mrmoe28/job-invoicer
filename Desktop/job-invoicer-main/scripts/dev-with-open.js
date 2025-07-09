const { spawn } = require('child_process');
const { platform } = require('os');

// Start Next.js dev server
const next = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start, then open browser
setTimeout(() => {
  const url = 'http://localhost:3000';
  
  // Open command based on platform
  const openCommand = platform() === 'darwin' 
    ? 'open' 
    : platform() === 'win32' 
    ? 'start' 
    : 'xdg-open';
  
  spawn(openCommand, [url], {
    stdio: 'ignore',
    detached: true
  }).unref();
  
  console.log(`\n🌐 Opening ${url} in your default browser...\n`);
}, 3000);

// Handle exit
process.on('SIGINT', () => {
  next.kill();
  process.exit();
});