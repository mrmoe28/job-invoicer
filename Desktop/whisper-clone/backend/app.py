#!/usr/bin/env python3
"""
Whisper Clone Backend Server
Real-time speech-to-text processing using whisper.cpp
"""

import os
import sys
import threading
import subprocess
import tempfile
import wave
import json
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import pyaudio
import numpy as np
import requests

# Configuration
SAMPLE_RATE = 16000
CHUNK_SIZE = 1024
CHANNELS = 1
RECORD_SECONDS = 5  # Process audio in 5-second chunks
WHISPER_MODEL = "base"

class WhisperCloneServer:
    def __init__(self):
        self.app = Flask(__name__)
        CORS(self.app)
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        
        self.is_recording = False
        self.audio_thread = None
        self.whisper_path = self._find_whisper_executable()
        self.model_path = self._find_model_path()
        
        self._setup_routes()
        self._setup_socket_events()
        
    def _find_whisper_executable(self):
        """Find the whisper.cpp executable"""
        possible_paths = [
            "../whisper.cpp/build/bin/whisper-cli",
            "./whisper.cpp/build/bin/whisper-cli",
            "whisper.cpp/build/bin/whisper-cli",
            "../whisper.cpp/main",
            "./whisper.cpp/main",
            "whisper.cpp/main"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return os.path.abspath(path)
        
        raise FileNotFoundError("whisper.cpp executable not found")
    
    def _find_model_path(self):
        """Find the Whisper model file"""
        model_name = f"ggml-{WHISPER_MODEL}.bin"
        possible_paths = [
            f"../whisper.cpp/models/{model_name}",
            f"./whisper.cpp/models/{model_name}",
            f"whisper.cpp/models/{model_name}",
            f"../models/{model_name}",
            f"./models/{model_name}"
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                return os.path.abspath(path)
        
        # Provide helpful error message with download instructions
        available_models = []
        for base_path in ["../whisper.cpp/models/", "./whisper.cpp/models/", "whisper.cpp/models/"]:
            if os.path.exists(base_path):
                available_models.extend([f for f in os.listdir(base_path) if f.endswith('.bin')])
        
        error_msg = f"Whisper model {model_name} not found."
        if available_models:
            error_msg += f" Available models: {', '.join(available_models)}"
        else:
            error_msg += " No models found. Please run: ./scripts/install-whisper.sh"
        
        raise FileNotFoundError(error_msg)
    
    def _setup_routes(self):
        """Setup Flask HTTP routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({
                'status': 'healthy',
                'whisper_path': self.whisper_path,
                'model_path': self.model_path,
                'is_recording': self.is_recording
            })
        
        @self.app.route('/start-recording', methods=['POST'])
        def start_recording():
            if self.is_recording:
                return jsonify({'error': 'Already recording'}), 400
            
            self.is_recording = True
            self.audio_thread = threading.Thread(target=self._record_audio)
            self.audio_thread.daemon = True
            self.audio_thread.start()
            
            return jsonify({'status': 'Recording started'})
        
        @self.app.route('/stop-recording', methods=['POST'])
        def stop_recording():
            self.is_recording = False
            if self.audio_thread:
                self.audio_thread.join(timeout=1)
            
            return jsonify({'status': 'Recording stopped'})
        
        @self.app.route('/transcribe-file', methods=['POST'])
        def transcribe_file():
            if 'audio' not in request.files:
                return jsonify({'error': 'No audio file provided'}), 400
            
            audio_file = request.files['audio']
            
            try:
                # Save uploaded file temporarily
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                    audio_file.save(temp_file.name)
                    
                    # Convert to proper format for Whisper
                    processed_file = self._prepare_audio_for_whisper(temp_file.name)
                    
                    # Transcribe
                    transcription = self._run_whisper(processed_file)
                    
                    # Clean up
                    os.unlink(temp_file.name)
                    if processed_file != temp_file.name:
                        os.unlink(processed_file)
                    
                    return jsonify({
                        'transcription': transcription,
                        'status': 'success'
                    })
                    
            except Exception as e:
                return jsonify({'error': str(e)}), 500
    
    def _setup_socket_events(self):
        """Setup WebSocket events for real-time communication"""
        
        @self.socketio.on('connect')
        def handle_connect():
            print(f"Client connected: {request.sid}")
            emit('status', {'message': 'Connected to Whisper Clone server'})
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            print(f"Client disconnected: {request.sid}")
            self.is_recording = False
        
        @self.socketio.on('start_transcription')
        def handle_start_transcription():
            if not self.is_recording:
                self.is_recording = True
                self.audio_thread = threading.Thread(target=self._record_audio)
                self.audio_thread.daemon = True
                self.audio_thread.start()
                emit('transcription_status', {'status': 'started'})
        
        @self.socketio.on('stop_transcription')
        def handle_stop_transcription():
            self.is_recording = False
            if self.audio_thread:
                self.audio_thread.join(timeout=1)
            emit('transcription_status', {'status': 'stopped'})
        
        @self.socketio.on('send_to_claude')
        def handle_send_to_claude(data):
            """Send transcription to Claude Code terminal"""
            text = data.get('text', '')
            if text:
                try:
                    # This would integrate with Claude Code's API
                    # For now, we'll just emit back to confirm
                    self._send_to_claude_code(text)
                    emit('claude_status', {
                        'status': 'sent',
                        'text': text
                    })
                except Exception as e:
                    emit('claude_status', {
                        'status': 'error',
                        'error': str(e)
                    })
    
    def _record_audio(self):
        """Record audio from microphone in real-time"""
        try:
            # Initialize PyAudio
            audio = pyaudio.PyAudio()
            
            # Open audio stream
            stream = audio.open(
                format=pyaudio.paInt16,
                channels=CHANNELS,
                rate=SAMPLE_RATE,
                input=True,
                frames_per_buffer=CHUNK_SIZE
            )
            
            print("🎙️ Recording started...")
            frames = []
            frame_count = 0
            
            while self.is_recording:
                data = stream.read(CHUNK_SIZE)
                frames.append(data)
                frame_count += 1
                
                # Process every 5 seconds of audio
                if frame_count >= (SAMPLE_RATE * RECORD_SECONDS) // CHUNK_SIZE:
                    self._process_audio_chunk(frames, audio)
                    frames = []
                    frame_count = 0
            
            # Process remaining frames
            if frames:
                self._process_audio_chunk(frames, audio)
            
            # Clean up
            stream.stop_stream()
            stream.close()
            audio.terminate()
            
            print("🛑 Recording stopped...")
            
        except Exception as e:
            print(f"❌ Audio recording error: {e}")
            self.socketio.emit('error', {'message': f'Recording error: {e}'})
    
    def _process_audio_chunk(self, frames, audio):
        """Process a chunk of audio and transcribe it"""
        try:
            # Convert frames to numpy array
            audio_data = np.frombuffer(b''.join(frames), dtype=np.int16)
            
            # Save to temporary WAV file
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                with wave.open(temp_file.name, 'wb') as wf:
                    wf.setnchannels(CHANNELS)
                    wf.setsampwidth(audio.get_sample_size(pyaudio.paInt16))
                    wf.setframerate(SAMPLE_RATE)
                    wf.writeframes(b''.join(frames))
                
                # Transcribe the audio
                transcription = self._run_whisper(temp_file.name)
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
                # Emit transcription to frontend
                if transcription.strip():
                    self.socketio.emit('transcription', {
                        'text': transcription,
                        'timestamp': self._get_timestamp()
                    })
                    
        except Exception as e:
            print(f"❌ Audio processing error: {e}")
            self.socketio.emit('error', {'message': f'Processing error: {e}'})
    
    def _prepare_audio_for_whisper(self, input_path):
        """Convert audio to format suitable for whisper.cpp"""
        try:
            import subprocess
            
            # Check if ffmpeg is available
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
            
            # Create output path with .wav extension
            output_path = input_path.rsplit('.', 1)[0] + '_converted.wav'
            
            # Convert to 16kHz mono WAV format using ffmpeg
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-ar', '16000',  # 16kHz sample rate
                '-ac', '1',      # Mono channel
                '-c:a', 'pcm_s16le',  # 16-bit PCM encoding
                '-y',            # Overwrite output file
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                return output_path
            else:
                print(f"⚠️ ffmpeg conversion failed: {result.stderr}")
                return input_path
                
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️ ffmpeg not available, using original audio format")
            return input_path
    
    def _run_whisper(self, audio_file_path):
        """Run whisper.cpp on audio file and return transcription"""
        try:
            # Prepare whisper.cpp command
            cmd = [
                self.whisper_path,
                '-m', self.model_path,
                '-f', audio_file_path,
                '--output-txt',
                '--no-timestamps'
            ]
            
            # Run whisper.cpp
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                raise Exception(f"Whisper error: {result.stderr}")
            
            # Read output file
            output_file = audio_file_path.replace('.wav', '.txt')
            if os.path.exists(output_file):
                with open(output_file, 'r') as f:
                    transcription = f.read().strip()
                os.unlink(output_file)  # Clean up
                return transcription
            else:
                return result.stdout.strip()
                
        except subprocess.TimeoutExpired:
            return "Transcription timeout"
        except Exception as e:
            print(f"❌ Whisper transcription error: {e}")
            return f"Error: {str(e)}"
    
    def _send_to_claude_code(self, text):
        """Send transcribed text to Claude Code terminal"""
        # This is where we'd integrate with Claude Code
        # For now, we'll implement a basic HTTP endpoint approach
        
        try:
            # Option 1: Send via HTTP to a local Claude Code server (if available)
            # claude_code_url = "http://localhost:8080/api/input"
            # response = requests.post(claude_code_url, json={'text': text})
            
            # Option 2: Write to a file that Claude Code can monitor
            claude_input_file = os.path.expanduser("~/.claude-code-input.txt")
            with open(claude_input_file, 'w') as f:
                f.write(text)
            
            # Option 3: Use AppleScript to send to terminal (macOS specific)
            if sys.platform == "darwin":
                self._send_to_terminal_via_applescript(text)
                
            print(f"📤 Sent to Claude Code: {text[:50]}...")
            
        except Exception as e:
            print(f"❌ Claude Code integration error: {e}")
            raise e
    
    def _send_to_terminal_via_applescript(self, text):
        """Send text to the active terminal using AppleScript (macOS)"""
        # Escape the text for AppleScript
        escaped_text = text.replace('"', '\\"').replace('\\', '\\\\')
        
        applescript = f'''
        tell application "Terminal"
            if (count of windows) = 0 then
                do script "{escaped_text}"
            else
                do script "{escaped_text}" in front window
            end if
        end tell
        '''
        
        try:
            subprocess.run(['osascript', '-e', applescript], check=True)
        except subprocess.CalledProcessError as e:
            print(f"❌ AppleScript error: {e}")
    
    def _get_timestamp(self):
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def run(self, host='127.0.0.1', port=5000, debug=False):
        """Start the Flask server"""
        print(f"🚀 Starting Whisper Clone Server on {host}:{port}")
        print(f"📂 Whisper executable: {self.whisper_path}")
        print(f"🤖 Model: {self.model_path}")
        
        self.socketio.run(
            self.app,
            host=host,
            port=port,
            debug=debug,
            allow_unsafe_werkzeug=True
        )

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Whisper Clone Backend Server')
    parser.add_argument('--host', default='127.0.0.1', help='Host to bind to')
    parser.add_argument('--port', type=int, default=5000, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--model', default='base', help='Whisper model to use')
    
    args = parser.parse_args()
    
    global WHISPER_MODEL
    WHISPER_MODEL = args.model
    
    try:
        server = WhisperCloneServer()
        server.run(host=args.host, port=args.port, debug=args.debug)
    except FileNotFoundError as e:
        print(f"❌ Setup Error: {e}")
        print("💡 Please run the installation script first: ./scripts/install-whisper.sh")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down Whisper Clone Server...")
        sys.exit(0)

if __name__ == '__main__':
    main()
