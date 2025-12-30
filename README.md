# Mic-to-Speaker P2P Audio Streamer

WebRTC-based peer-to-peer audio streaming with Socket.IO signaling. Stream high-quality audio from one device (microphone) to multiple listeners (speakers) with real-time audio processing.

## Features

- 🎙️ **High-Quality Audio**: 48kHz stereo streaming with no compression
- 🔊 **Multiple Listeners**: One broadcaster to unlimited listeners
- 🎵 **Real-Time Effects**: Audio worklet processing with echo effect (300ms delay)
- 🌐 **P2P Connection**: Direct peer-to-peer audio streaming (low latency)
- 🔒 **Room System**: Private rooms with unique IDs for isolated sessions
- 📱 **QR Code Support**: Easy mobile device connection
- 🔄 **Auto-Discovery**: Automatic peer detection and connection
- 📡 **Connection Monitoring**: Real-time connection state tracking
- 📊 **Listener Count**: See how many people are listening live

## How It Works

### Architecture Overview

```
Microphone Device    Signaling Server    Speaker Devices
      │                    │                    │
      ├──register-as-mic──>│                    │
      │                    │<─register-as-speaker─┤
      │<──existing-speakers─┤                    │
      │                    │                    │
      ├──────offer──────>│────offer──────>┤
      │<─────answer──────┤<───answer───────┤
      │                    │                    │
      │    ICE Candidates   │   ICE Candidates   │
      ├─────────────────>│<─────────────────┤
      │                    │                    │
      ╰────────────────────────────────────────╯
             Direct P2P Audio Stream (SRTP)
             Server is NOT in the audio path!
```

### Audio Processing Pipeline

```
Microphone Hardware
      ↓
getUserMedia() - Capture 48kHz stereo
      ↓
AudioWorklet (audio-processor.js)
      │
      ├─> Echo Effect (optional)
      │   - 300ms delay buffer
      │   - 20% feedback
      │   - Float32 → Int16 conversion
      ↓
MediaStreamDestination
      ↓
WebRTC RTCPeerConnection
      ↓
P2P SRTP Transmission
      ↓
Speaker's RTCPeerConnection
      ↓
<audio> element playback
      ↓
Speaker Hardware
```

## Technology Stack

### Server
- **Node.js** + **Express**: Web server
- **Socket.IO**: WebRTC signaling (WebSocket)
- **HTTPS/HTTP**: SSL support for local dev

### Client
- **WebRTC**: P2P audio streaming
- **Web Audio API**: Real-time audio processing
- **AudioWorklet**: Low-latency audio effects
- **MediaStream API**: Microphone capture

## Local Development

### Installation

```bash
npm install
```

### Start Server

```bash
npm start
```

### Access Application

- **Local**: `http://localhost:3000`
- **Network**: `http://<YOUR_IP>:3000`
- **HTTPS** (if certs exist): `https://<YOUR_IP>:3000`

### Generate Self-Signed Certificates (Optional)

For HTTPS in local development:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

## Usage

### 1. Create or Join Room
- Open the application in browser
- Generate a new room ID or enter an existing one
- Share the room ID with others

### 2. Start as Speaker (Listener)
- Click **"Speaker"** card
- Page auto-registers to room
- Wait for microphone to connect
- Audio plays automatically when mic starts

### 3. Start as Microphone (Broadcaster)
- Click **"Microphone"** card
- Click **"Start Streaming"** button
- Grant microphone permissions
- Audio streams to all connected speakers
- Optional: Enable **Echo** effect for reverb

### 4. Multiple Listeners
- Any number of speakers can join the same room
- Each gets a separate P2P connection from the mic
- Mic shows active listener count

## Configuration

### Audio Settings (mic.html)

```javascript
{
  channelCount: 2,          // Stereo
  sampleRate: 48000,        // 48kHz
  echoCancellation: false,  // No processing
  noiseSuppression: false,  // No processing
  autoGainControl: false,   // No processing
  latency: 0                // Minimal latency
}
```

### Echo Effect Parameters (audio-processor.js)

```javascript
bufferSize: 48000 * 0.3   // 300ms delay
feedback: 0.2             // 20% decay
```

### ICE Servers

```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' }
]
```

## Deployment

### Recommended Platforms
- ✅ **Railway**: Full WebSocket support
- ✅ **Render**: Full WebSocket support
- ✅ **Heroku**: Full WebSocket support
- ❌ **Vercel**: Not recommended (serverless, no persistent connections)

### Environment Variables

```bash
PORT=3000                    # Server port
NODE_ENV=production          # Use HTTP (platform handles SSL)
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Render

1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Deploy

## Project Structure

```
.
├── server.js                 # Socket.IO signaling server
├── package.json              # Dependencies
└── public/
    ├── index.html            # Landing page (room selection)
    ├── mic.html              # Microphone broadcaster page
    ├── speaker.html          # Speaker listener page
    └── audio-processor.js    # AudioWorklet processor (echo effect)
```

## How WebRTC Connection Works

### 1. Registration Phase
- Mic and speakers register to server with room ID
- Server tracks all participants per room
- Server notifies mic of existing speakers

### 2. Offer/Answer Exchange
- Mic creates WebRTC offer (SDP) for each speaker
- Server relays offer to target speaker
- Speaker creates answer (SDP)
- Server relays answer back to mic

### 3. ICE Candidate Exchange
- Both peers discover network paths (STUN)
- Candidates exchanged through server
- Best path selected automatically

### 4. P2P Connection Established
- Direct connection formed
- Audio flows peer-to-peer
- Server no longer in data path

## Troubleshooting

### No Audio Heard
- Check browser microphone permissions
- Verify speakers are in same room
- Check browser console for errors
- Ensure WebRTC is supported (modern browsers)

### Connection Failed
- Firewall may block WebRTC
- Try different network
- Check ICE connection state in console
- Verify STUN server is reachable

### Echo/Feedback
- Don't use echo effect with speaker on same device
- Use headphones on speaker devices
- Reduce speaker volume

### High Latency
- P2P should be low latency (~100-300ms)
- Check network quality
- Reduce distance between peers if on same network

## Browser Support

- ✅ Chrome 74+
- ✅ Firefox 76+
- ✅ Safari 14.1+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Use Cases

- 🎸 **Live Music Performance**: Stream to remote audience
- 🎧 **DJ Mixing**: Broadcast live DJ sets
- 🎙️ **Podcasting**: Multi-listener recording sessions
- 🎹 **Remote Jamming**: Musicians collaborate remotely
- 📡 **Audio Monitoring**: Monitor remote audio sources
- 🎭 **Theater/Events**: Wireless audio distribution

## License

MIT

## Contributing

Pull requests welcome! Please ensure:
- Code follows existing style
- Test in multiple browsers
- Update documentation if needed

## Security Notes

- Audio streams are encrypted (SRTP)
- Room IDs are not secret - treat as public
- No authentication implemented
- Server does not store or record audio
- Suitable for trusted networks or add auth layer
