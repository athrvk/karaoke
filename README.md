# 🎤 Karaoke Live - P2P Audio Streamer

A high-performance, low-latency peer-to-peer audio streaming application. Turn any device (phone, tablet, laptop) into a microphone and stream audio directly to another device (connected to speakers/TV) over WiFi.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)

## ✨ Features

- 🎙️ **Ultra-Low Latency**: Direct P2P WebRTC connection (audio doesn't go through the server).
- 📱 **Fully Responsive**: Optimized UI for Mobile, Tablet, Desktop, and **TV** interfaces.
- 🔊 **One-to-Many**: One singer can stream to multiple listener devices simultaneously.
- 🎵 **Audio Effects**: Optional toggleable **Reverb/Echo** effect for karaoke vibes.
- 🔒 **Room System**: Private rooms with unique IDs for isolated sessions.
- 🔗 **Easy Connection**: QR Code generation for instant mobile pairing.
- 🛠️ **Smart Autoplay**: "Silent Audio" unlock mechanism to bypass browser autoplay restrictions.
- ⚡ **Optimized Audio**: 
  - 48kHz Mono (lower bandwidth, lower latency).
  - Disabled browser processing (echo cancellation/noise suppression) for raw audio.
  - Tuned Opus codec settings.

## 🏗️ Architecture

The application uses a **Signaling Server** (Node.js) only to establish the connection. Once connected, audio flows directly between devices.

```mermaid
graph TD
    subgraph "Signaling Phase (Socket.IO)"
    Mic[Microphone Device] -- 1. Register/Offer --> Server[Node.js Server]
    Server -- 2. Forward Offer --> Speaker[Speaker Device]
    Speaker -- 3. Answer --> Server
    Server -- 4. Forward Answer --> Mic
    end

    subgraph "Streaming Phase (WebRTC)"
    Mic == "5. Direct Audio Stream (SRTP)" ==> Speaker
    end
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- SSL Certificates (Required for microphone access on non-localhost devices)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/micToBtSpeaker.git
   cd micToBtSpeaker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Important: SSL Setup**
   Browsers block microphone access on non-secure (HTTP) connections unless it's `localhost`. To use this on your phone/network, you need HTTPS.
   
   Generate self-signed certificates:
   ```bash
   openssl req -nodes -new -x509 -keyout key.pem -out cert.pem
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Access the app:
   - **On your computer (Speaker):** `https://localhost:3000`
   - **On your phone (Mic):** `https://<YOUR_COMPUTER_IP>:3000`
   *(Note: You will see a security warning because of the self-signed cert. Click "Advanced" -> "Proceed" to continue.)*

## 📱 Usage Guide

1. **Open the App**: Navigate to the home page.
2. **Create a Room**: Enter a Room ID or generate a new one.
3. **Join as Listener (Speaker)**:
   - Click "Listener Mode".
   - Connect your device to Bluetooth speakers or a TV.
   - A QR code will appear.
4. **Join as Singer (Mic)**:
   - Scan the QR code with your phone OR navigate to the URL manually.
   - Click "Singer Mode".
   - Grant microphone permissions.
   - Click **"Start Performance"**.
5. **Sing!**: Your voice will be streamed instantly to the speaker. Toggle "Enable Reverb" for effects.

## 🛠️ Technical Details

### Audio Pipeline
1. **Capture**: `navigator.mediaDevices.getUserMedia` (Mono, 48kHz, No Processing).
2. **Processing (Optional)**: Web Audio API `DelayNode` + `GainNode` for Reverb.
3. **Encoding**: Opus Codec (CBR, 510kbps max bitrate).
4. **Transport**: WebRTC `RTCPeerConnection` (UDP).

### Project Structure
```
/
├── server.js           # Node.js Signaling Server
├── package.json        # Dependencies
├── public/
│   ├── index.html      # Landing Page
│   ├── mic.html        # Singer Interface (Sender)
│   ├── speaker.html    # Listener Interface (Receiver)
│   └── style.css       # Shared Responsive Styles
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
