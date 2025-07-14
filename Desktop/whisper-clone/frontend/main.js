const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

class WhisperCloneApp {
    constructor() {
        this.mainWindow = null;
        this.pythonProcess = null;
        this.serverPort = 5000;
        this.serverHost = '127.0.0.1';
    }

    createWindow() {
        // Create the browser window
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
            },
            titleBarStyle: 'hiddenInset',
            show: false
        });

        // Load the app
        this.mainWindow.loadFile(path.join(__dirname, 'index.html'));

        // Show window when ready to prevent visual flash
        this.mainWindow.once('ready-to-show', () => {
            this.mainWindow.show();
        });

        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
            this.cleanup();
        });

        // Development tools
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools();
        }
    }

    startPythonServer() {
        return new Promise((resolve, reject) => {
            const pythonScript = path.join(__dirname, '..', 'backend', 'app.py');
            
            // Check if Python script exists
            if (!fs.existsSync(pythonScript)) {
                reject(new Error(`Python script not found: ${pythonScript}`));
                return;
            }

            console.log('Starting Python server...');
            
            // Start Python server
            this.pythonProcess = spawn('python3', [
                pythonScript,
                '--host', this.serverHost,
                '--port', this.serverPort.toString()
            ], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Handle Python server output
            this.pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('Python:', output);
                
                // Check if server is ready
                if (output.includes('Starting Whisper Clone Server')) {
                    setTimeout(() => resolve(), 2000); // Give server time to start
                }
            });

            this.pythonProcess.stderr.on('data', (data) => {
                const error = data.toString();
                console.error('Python Error:', error);
                
                // Handle common errors
                if (error.includes('Setup Error')) {
                    reject(new Error('Whisper setup incomplete. Please run: npm run setup'));
                } else if (error.includes('Address already in use')) {
                    reject(new Error(`Port ${this.serverPort} is already in use`));
                }
            });

            this.pythonProcess.on('close', (code) => {
                console.log(`Python server exited with code ${code}`);
                if (code !== 0 && this.mainWindow) {
                    dialog.showErrorBox(
                        'Server Error',
                        'The Python server crashed. Please restart the application.'
                    );
                }
            });

            // Timeout after 10 seconds
            setTimeout(() => {
                if (this.pythonProcess && this.pythonProcess.exitCode === null) {
                    reject(new Error('Python server startup timeout'));
                }
            }, 10000);
        });
    }

    setupMenu() {
        const template = [
            {
                label: 'Whisper Clone',
                submenu: [
                    {
                        label: 'About Whisper Clone',
                        click: () => {
                            dialog.showMessageBox(this.mainWindow, {
                                type: 'info',
                                title: 'About Whisper Clone',
                                message: 'Whisper Clone v1.0.0',
                                detail: 'Real-time speech-to-text for Claude Code\n\nBuilt with Electron, Python Flask, and whisper.cpp'
                            });
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Preferences...',
                        accelerator: 'CmdOrCtrl+,',
                        click: () => {
                            // Open preferences window
                            this.mainWindow.webContents.send('open-preferences');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        accelerator: 'CmdOrCtrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Recording',
                submenu: [
                    {
                        label: 'Start Recording',
                        accelerator: 'CmdOrCtrl+R',
                        click: () => {
                            this.mainWindow.webContents.send('start-recording');
                        }
                    },
                    {
                        label: 'Stop Recording',
                        accelerator: 'CmdOrCtrl+S',
                        click: () => {
                            this.mainWindow.webContents.send('stop-recording');
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Clear Transcript',
                        accelerator: 'CmdOrCtrl+Shift+C',
                        click: () => {
                            this.mainWindow.webContents.send('clear-transcript');
                        }
                    }
                ]
            },
            {
                label: 'Claude Code',
                submenu: [
                    {
                        label: 'Send to Claude Code',
                        accelerator: 'CmdOrCtrl+Enter',
                        click: () => {
                            this.mainWindow.webContents.send('send-to-claude');
                        }
                    },
                    {
                        label: 'Test Connection',
                        click: () => {
                            this.mainWindow.webContents.send('test-claude-connection');
                        }
                    }
                ]
            },
            {
                label: 'View',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { type: 'separator' },
                    { role: 'resetZoom' },
                    { role: 'zoomIn' },
                    { role: 'zoomOut' },
                    { type: 'separator' },
                    { role: 'togglefullscreen' }
                ]
            },
            {
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { type: 'separator' },
                    { role: 'front' }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }

    setupIPC() {
        // Handle messages from renderer process
        ipcMain.handle('get-server-info', () => {
            return {
                host: this.serverHost,
                port: this.serverPort,
                url: `http://${this.serverHost}:${this.serverPort}`
            };
        });

        ipcMain.handle('restart-server', async () => {
            try {
                this.cleanup();
                await this.startPythonServer();
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });

        ipcMain.handle('check-server-health', async () => {
            try {
                const response = await fetch(`http://${this.serverHost}:${this.serverPort}/health`);
                const data = await response.json();
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
    }

    cleanup() {
        if (this.pythonProcess) {
            console.log('Terminating Python server...');
            this.pythonProcess.kill('SIGTERM');
            this.pythonProcess = null;
        }
    }

    async initialize() {
        try {
            // Start Python server first
            await this.startPythonServer();
            
            // Create window
            this.createWindow();
            
            // Setup menu and IPC
            this.setupMenu();
            this.setupIPC();
            
            console.log('✅ Whisper Clone initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            
            // Show error dialog
            dialog.showErrorBox(
                'Initialization Error',
                `Failed to start Whisper Clone:\n\n${error.message}\n\nPlease check the installation and try again.`
            );
            
            app.quit();
        }
    }
}

// App event handlers
const whisperApp = new WhisperCloneApp();

app.whenReady().then(() => {
    whisperApp.initialize();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        whisperApp.createWindow();
    }
});

app.on('before-quit', () => {
    whisperApp.cleanup();
});

// Handle certificate errors (for development)
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
        event.preventDefault();
        callback(true);
    } else {
        callback(false);
    }
});
