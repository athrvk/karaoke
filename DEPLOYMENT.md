# Deployment Options

## ⚠️ Important: Vercel Limitations

**Vercel does NOT support persistent WebSocket connections** (Socket.IO) in serverless functions. The server will deploy but Socket.IO connections will fail or be unreliable.

## Recommended Deployment Platforms

### Option 1: Railway (Easiest)
**Best for this project** - Supports WebSockets, auto-deploys from GitHub

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `karaoke` repository
4. Railway auto-detects Node.js and runs `npm start`
5. Get your deployment URL (e.g., `https://your-app.up.railway.app`)

**Cost**: Free tier available

### Option 2: Render
Similar to Railway, supports WebSockets

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Build: `npm install`
5. Start: `npm start`

**Cost**: Free tier available

### Option 3: DigitalOcean App Platform
1. Create new app from GitHub
2. Auto-detects Node.js
3. Deploys with persistent connections

**Cost**: $5/month minimum

### Option 4: Self-hosted VPS
Use any VPS (DigitalOcean Droplet, AWS EC2, etc.)
```bash
# On server
git clone your-repo
cd micToBtSpeaker
npm install
npm start
# Use PM2 or systemd to keep it running
```

## Local Development
```bash
npm start
# Access at https://<YOUR_IP>:3000
```

## Why Not Vercel?
- Vercel is designed for **static sites** and **serverless functions**
- Socket.IO requires **persistent connections**
- Serverless functions timeout after 10-60 seconds
- WebSocket connections get dropped

Use Vercel only for static sites (like the PeerJS version we tried, but that had reliability issues).
