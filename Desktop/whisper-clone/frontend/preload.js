/**
 * Whisper Clone Preload Script
 * Secure bridge between main and renderer processes
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Server management
    getServerInfo: () => ipcRenderer.invoke('get-server-info'),
    restartServer: () => ipcRenderer.invoke('restart-server'),
    checkServerHealth: () => ipcRenderer.invoke('check-server-health'),

    // Menu event listeners
    onStartRecording: (callback) => ipcRenderer.on('start-recording', callback),
    onStopRecording: (callback) => ipcRenderer.on('stop-recording', callback),
    onClearTranscript: (callback) => ipcRenderer.on('clear-transcript', callback),
    onSendToClaude: (callback) => ipcRenderer.on('send-to-claude', callback),
    onTestClaudeConnection: (callback) => ipcRenderer.on('test-claude-connection', callback),
    onOpenPreferences: (callback) => ipcRenderer.on('open-preferences', callback),

    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Also expose a simple way to check if we're in Electron
contextBridge.exposeInMainWorld('isElectron', true);