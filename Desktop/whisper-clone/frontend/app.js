/**
 * Whisper Clone Frontend Application
 * Handles UI interactions and real-time communication with backend
 */

// Use the secure electronAPI exposed through preload script

class WhisperCloneClient {
    constructor() {
        this.socket = null;
        this.isRecording = false;
        this.transcriptData = [];
        this.serverUrl = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Check if we're in Electron environment
            if (typeof window.electronAPI !== 'undefined') {
                // Get server info from main process
                const serverInfo = await window.electronAPI.getServerInfo();
                this.serverUrl = serverInfo.url;
            } else {
                // Fallback for web/development mode
                this.serverUrl = 'http://127.0.0.1:5000';
            }
            
            // Wait a moment for server to be ready
            setTimeout(() => {
                this.connectToServer();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to connect to backend server');
        }
    }

    initializeElements() {
        this.recordBtn = document.getElementById('recordBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.sendToClaudeBtn = document.getElementById('sendToClaudeBtn');
        this.transcript = document.getElementById('transcript');
        this.status = document.getElementById('status');
        this.claudeStatus = document.getElementById('claudeStatus');
    }

    setupEventListeners() {
        // Button event listeners
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.clearBtn.addEventListener('click', () => this.clearTranscript());
        this.saveBtn.addEventListener('click', () => this.saveTranscript());
        this.sendToClaudeBtn.addEventListener('click', () => this.sendToClaude());
        this.settingsBtn.addEventListener('click', () => this.openSettings());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.metaKey || e.ctrlKey) {
                switch(e.key) {
                    case 'r':
                        e.preventDefault();
                        this.toggleRecording();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.sendToClaude();
                        break;
                    case 's':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.toggleRecording();
                        }
                        break;
                }
            }
        });

        // IPC listeners for menu actions (only in Electron)
        if (typeof window.electronAPI !== 'undefined') {
            window.electronAPI.onStartRecording(() => this.startRecording());
            window.electronAPI.onStopRecording(() => this.stopRecording());
            window.electronAPI.onClearTranscript(() => this.clearTranscript());
            window.electronAPI.onSendToClaude(() => this.sendToClaude());
            window.electronAPI.onTestClaudeConnection(() => this.testClaudeConnection());
            window.electronAPI.onOpenPreferences(() => this.openSettings());
        }
    }

    connectToServer() {
        if (!this.serverUrl) {
            this.showError('Server URL not available');
            return;
        }

        this.updateStatus('Connecting...', 'connecting');
        
        // Initialize Socket.IO connection
        this.socket = io(this.serverUrl, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: this.maxReconnectAttempts
        });

        this.setupSocketListeners();
    }

    setupSocketListeners() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.reconnectAttempts = 0;
            this.updateStatus('Connected', 'connected');
            this.showSuccess('Connected to Whisper server');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            this.updateStatus('Disconnected', 'disconnected');
            this.isRecording = false;
            this.updateRecordButton();
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.reconnectAttempts++;
            
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.updateStatus('Connection Failed', 'error');
                this.showError('Failed to connect to server. Please restart the application.');
            } else {
                this.updateStatus(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, 'connecting');
            }
        });

        this.socket.on('transcription', (data) => {
            this.addTranscription(data.text, data.timestamp);
        });

        this.socket.on('transcription_status', (data) => {
            if (data.status === 'started') {
                this.isRecording = true;
                this.updateRecordButton();
                this.updateStatus('Recording...', 'recording');
                this.showSuccess('Recording started');
            } else if (data.status === 'stopped') {
                this.isRecording = false;
                this.updateRecordButton();
                this.updateStatus('Ready', 'ready');
                this.showSuccess('Recording stopped');
            }
        });

        this.socket.on('claude_status', (data) => {
            if (data.status === 'sent') {
                this.updateClaudeStatus('Sent ✓', 'success');
                this.showSuccess('Transcript sent to Claude Code');
                setTimeout(() => this.updateClaudeStatus('Ready'), 3000);
            } else if (data.status === 'error') {
                this.updateClaudeStatus('Error ✗', 'error');
                this.showError(`Claude integration error: ${data.error}`);
                setTimeout(() => this.updateClaudeStatus('Ready'), 5000);
            }
        });

        this.socket.on('error', (data) => {
            console.error('Server error:', data);
            this.showError(data.message || 'Unknown server error');
        });

        this.socket.on('status', (data) => {
            console.log('Server status:', data.message);
        });
    }

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        if (!this.socket || !this.socket.connected) {
            this.showError('Not connected to server');
            return;
        }

        if (this.isRecording) {
            this.showError('Already recording');
            return;
        }

        this.socket.emit('start_transcription');
    }

    stopRecording() {
        if (!this.socket || !this.socket.connected) {
            this.showError('Not connected to server');
            return;
        }

        if (!this.isRecording) {
            this.showError('Not currently recording');
            return;
        }

        this.socket.emit('stop_transcription');
    }

    updateRecordButton() {
        if (this.isRecording) {
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '⏹️';
            this.recordBtn.title = 'Stop Recording (Cmd+R)';
        } else {
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '🎙️';
            this.recordBtn.title = 'Start Recording (Cmd+R)';
        }
    }

    addTranscription(text, timestamp) {
        if (!text || !text.trim()) return;

        const cleanText = text.trim();
        const entry = { text: cleanText, timestamp };
        this.transcriptData.push(entry);

        // Remove placeholder if it exists
        const placeholder = this.transcript.querySelector('[style*="italic"]');
        if (placeholder) {
            placeholder.remove();
        }

        // Create transcript entry element
        const entryElement = document.createElement('div');
        entryElement.className = 'transcript-entry';
        entryElement.innerHTML = `
            <div class="transcript-timestamp">${new Date(timestamp).toLocaleTimeString()}</div>
            <div>${this.escapeHtml(cleanText)}</div>
        `;

        this.transcript.appendChild(entryElement);
        this.transcript.scrollTop = this.transcript.scrollHeight;

        // Update footer status
        this.updateFooterStatus();
    }

    clearTranscript() {
        if (this.transcriptData.length === 0) {
            this.showError('No transcript to clear');
            return;
        }

        this.transcriptData = [];
        this.transcript.innerHTML = `
            <div style="color: #666; font-style: italic; text-align: center; margin-top: 50px;">
                Click the microphone to start recording...
            </div>
        `;
        this.updateFooterStatus();
        this.showSuccess('Transcript cleared');
    }

    saveTranscript() {
        if (this.transcriptData.length === 0) {
            this.showError('No transcript to save');
            return;
        }

        try {
            const content = this.generateTranscriptContent();
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `whisper-transcript-${timestamp}.txt`;

            // Create download
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccess(`Transcript saved as ${filename}`);
        } catch (error) {
            console.error('Save error:', error);
            this.showError('Failed to save transcript');
        }
    }

    generateTranscriptContent() {
        const header = `Whisper Clone Transcript
Generated: ${new Date().toLocaleString()}
Total entries: ${this.transcriptData.length}
${'-'.repeat(50)}

`;

        const content = this.transcriptData.map(entry => {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            return `[${time}] ${entry.text}`;
        }).join('\n\n');

        return header + content;
    }

    sendToClaude() {
        if (this.transcriptData.length === 0) {
            this.showError('No transcript to send');
            return;
        }

        if (!this.socket || !this.socket.connected) {
            this.showError('Not connected to server');
            return;
        }

        try {
            const fullText = this.transcriptData.map(entry => entry.text).join(' ');
            this.updateClaudeStatus('Sending...', 'sending');
            this.socket.emit('send_to_claude', { text: fullText });
        } catch (error) {
            console.error('Send to Claude error:', error);
            this.showError('Failed to send to Claude Code');
            this.updateClaudeStatus('Error ✗', 'error');
        }
    }

    testClaudeConnection() {
        if (!this.socket || !this.socket.connected) {
            this.showError('Not connected to server');
            return;
        }

        this.updateClaudeStatus('Testing...', 'sending');
        this.socket.emit('send_to_claude', { 
            text: 'Test connection from Whisper Clone at ' + new Date().toLocaleTimeString() 
        });
    }

    updateStatus(text, type) {
        const statusElement = this.status.querySelector('span');
        statusElement.textContent = text;
        
        const dot = this.status.querySelector('.status-dot');
        dot.className = 'status-dot';
        
        // Update status indicator color based on type
        switch(type) {
            case 'connected':
            case 'ready':
                dot.style.background = '#4CAF50';
                break;
            case 'recording':
                dot.style.background = '#ff6b6b';
                break;
            case 'connecting':
                dot.style.background = '#ffb347';
                break;
            case 'disconnected':
            case 'error':
                dot.style.background = '#f44336';
                break;
            default:
                dot.style.background = '#4CAF50';
        }
    }

    updateClaudeStatus(text, type) {
        this.claudeStatus.textContent = text;
        this.claudeStatus.className = 'claude-status';
        
        switch(type) {
            case 'success':
                this.claudeStatus.style.background = 'rgba(76, 175, 80, 0.1)';
                this.claudeStatus.style.color = '#4CAF50';
                break;
            case 'error':
                this.claudeStatus.style.background = 'rgba(244, 67, 54, 0.1)';
                this.claudeStatus.style.color = '#f44336';
                break;
            case 'sending':
                this.claudeStatus.style.background = 'rgba(255, 179, 71, 0.1)';
                this.claudeStatus.style.color = '#ff8f00';
                break;
            default:
                this.claudeStatus.style.background = 'rgba(76, 175, 80, 0.1)';
                this.claudeStatus.style.color = '#4CAF50';
        }
    }

    updateFooterStatus() {
        const footerStatus = document.querySelector('.footer span');
        if (this.transcriptData.length > 0) {
            const wordCount = this.transcriptData.reduce((count, entry) => {
                return count + entry.text.split(' ').length;
            }, 0);
            footerStatus.textContent = `${this.transcriptData.length} entries • ${wordCount} words`;
        } else {
            footerStatus.textContent = 'Ready to transcribe';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.error-message, .success-message');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notificationElement = document.createElement('div');
        notificationElement.className = type === 'error' ? 'error-message' : 'success-message';
        notificationElement.textContent = message;
        
        // Insert notification
        const mainContent = document.querySelector('.main-content');
        const controlPanel = document.querySelector('.control-panel');
        mainContent.insertBefore(notificationElement, controlPanel.nextSibling);
        
        // Auto-remove notification
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.remove();
            }
        }, type === 'error' ? 7000 : 4000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    openSettings() {
        // Create a simple settings modal
        const modal = this.createSettingsModal();
        document.body.appendChild(modal);
    }

    createSettingsModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        content.innerHTML = `
            <h2 style="margin-bottom: 20px;">Settings</h2>
            
            <div style="margin-bottom: 20px;">
                <h3>Server Information</h3>
                <p><strong>Server URL:</strong> ${this.serverUrl || 'Not connected'}</p>
                <p><strong>Connection Status:</strong> ${this.socket?.connected ? 'Connected' : 'Disconnected'}</p>
                <p><strong>Recording Status:</strong> ${this.isRecording ? 'Recording' : 'Stopped'}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h3>Transcript Statistics</h3>
                <p><strong>Total Entries:</strong> ${this.transcriptData.length}</p>
                <p><strong>Total Words:</strong> ${this.transcriptData.reduce((count, entry) => count + entry.text.split(' ').length, 0)}</p>
            </div>

            <div style="margin-bottom: 20px;">
                <h3>Keyboard Shortcuts</h3>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 5px 0;"><strong>Cmd+R:</strong> Toggle Recording</li>
                    <li style="padding: 5px 0;"><strong>Cmd+Enter:</strong> Send to Claude Code</li>
                    <li style="padding: 5px 0;"><strong>Cmd+Shift+C:</strong> Clear Transcript</li>
                    <li style="padding: 5px 0;"><strong>Cmd+,:</strong> Open Settings</li>
                </ul>
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="restartServerBtn" style="padding: 10px 20px; border: none; border-radius: 6px; background: #ff6b6b; color: white; cursor: pointer;">
                    Restart Server
                </button>
                <button id="closeSettingsBtn" style="padding: 10px 20px; border: none; border-radius: 6px; background: #667eea; color: white; cursor: pointer;">
                    Close
                </button>
            </div>
        `;

        modal.appendChild(content);

        // Event listeners
        const closeBtn = content.querySelector('#closeSettingsBtn');
        const restartBtn = content.querySelector('#restartServerBtn');

        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        restartBtn.addEventListener('click', async () => {
            this.updateStatus('Restarting server...', 'connecting');
            try {
                if (typeof window.electronAPI !== 'undefined') {
                    const result = await window.electronAPI.restartServer();
                    if (result.success) {
                        this.showSuccess('Server restarted successfully');
                        setTimeout(() => this.connectToServer(), 1000);
                    } else {
                        this.showError(`Failed to restart server: ${result.error}`);
                    }
                } else {
                    this.showError('Server restart only available in Electron app');
                }
            } catch (error) {
                this.showError('Failed to restart server');
            }
            document.body.removeChild(modal);
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });

        return modal;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.whisperApp = new WhisperCloneClient();
    console.log('🎙️ Whisper Clone Frontend initialized');
});

// Handle window focus/blur for better UX
window.addEventListener('focus', () => {
    if (window.whisperApp && window.whisperApp.socket && !window.whisperApp.socket.connected) {
        console.log('Window focused, attempting to reconnect...');
        window.whisperApp.connectToServer();
    }
});

// Export for debugging
window.WhisperCloneClient = WhisperCloneClient;
