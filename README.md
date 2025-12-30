# Mic-to-Speaker P2P Audio Streamer

WebRTC-based peer-to-peer audio streaming with Socket.IO signaling.

## Features
- 🎙️ High-quality audio streaming (48kHz stereo)
- 🔊 Multiple simultaneous listeners
- 📱 iOS background audio support
- 🔒 HTTPS with self-signed certificates
- 🌐 P2P WebRTC connections

## Local Development

```bash
npm install
npm start
```

Access at `https://<YOUR_MAC_IP>:3000`

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment options.

**TL;DR**: Use Railway or Render (not Vercel) because this app requires persistent WebSocket connections.

## Architecture

- **Server**: Node.js + Express + Socket.IO (signaling only)
- **Client**: WebRTC for P2P media streaming
- **Signaling**: Socket.IO for WebRTC handshake (offer/answer/ICE)
