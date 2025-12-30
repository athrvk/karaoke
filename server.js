const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();

// Use HTTPS for local development, HTTP for production (Render handles SSL)
let server;
const useHTTPS = process.env.NODE_ENV !== 'production' && fs.existsSync('key.pem');

if (useHTTPS) {
    const options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };
    server = https.createServer(options, app);
    console.log('Using HTTPS (local development)');
} else {
    server = http.createServer(app);
    console.log('Using HTTP (production - SSL handled by platform)');
}

const io = new Server(server, {
    httpCompression: false,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from 'public' directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register-as-mic', async (data) => {
        const room = data?.room || 'default';
        console.log(`Socket ${socket.id} registered as Mic in room: ${room}`);
        socket.data.role = 'mic';
        socket.data.room = room;
        socket.join(room);

        // Find existing speakers in this room
        const sockets = await io.in(room).fetchSockets();
        const speakerIds = sockets
            .filter(s => s.data.role === 'speaker' && s.id !== socket.id)
            .map(s => s.id);

        if (speakerIds.length > 0) {
            console.log(`Sending ${speakerIds.length} existing speakers to Mic in room ${room}`);
            socket.emit('existing-speakers', speakerIds);
        }
    });

    socket.on('register-as-speaker', (data) => {
        const room = data?.room || 'default';
        console.log(`Socket ${socket.id} registered as Speaker in room: ${room}`);
        socket.data.role = 'speaker';
        socket.data.room = room;
        socket.join(room);
        // Notify mics in this room that a new speaker joined
        socket.to(room).emit('user-joined', socket.id);
    });

    // Signaling Events - Now Targeted
    socket.on('offer', (payload) => {
        // payload: { target: targetSocketId, sdp: ... }
        console.log(`Relaying Offer from ${socket.id} to ${payload.target}`);
        io.to(payload.target).emit('offer', {
            sender: socket.id,
            sdp: payload.sdp
        });
    });

    socket.on('answer', (payload) => {
        // payload: { target: targetSocketId, sdp: ... }
        console.log(`Relaying Answer from ${socket.id} to ${payload.target}`);
        io.to(payload.target).emit('answer', {
            sender: socket.id,
            sdp: payload.sdp
        });
    });

    socket.on('ice-candidate', (payload) => {
        // payload: { target: targetSocketId, candidate: ... }
        console.log(`Relaying Candidate from ${socket.id} to ${payload.target}`);
        io.to(payload.target).emit('ice-candidate', {
            sender: socket.id,
            candidate: payload.candidate
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const room = socket.data.room;
        if (room) {
            socket.to(room).emit('user-left', socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Signaling Server running on ${useHTTPS ? 'https' : 'http'}://0.0.0.0:${PORT}`);
});
