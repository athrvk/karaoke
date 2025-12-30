const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');

const app = express();

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(options, app);
// Disable compression for lower latency signaling (though impact is minimal for signaling objects)
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

    socket.join('default');

    socket.on('register-as-mic', async () => {
        console.log(`Socket ${socket.id} registered as Mic`);
        socket.data.role = 'mic';

        // Find existing speakers
        const sockets = await io.in('default').fetchSockets();
        const speakerIds = sockets
            .filter(s => s.data.role === 'speaker' && s.id !== socket.id)
            .map(s => s.id);

        if (speakerIds.length > 0) {
            console.log(`Sending ${speakerIds.length} existing speakers to new Mic`);
            socket.emit('existing-speakers', speakerIds);
        }
    });

    socket.on('register-as-speaker', () => {
        console.log(`Socket ${socket.id} registered as Speaker`);
        socket.data.role = 'speaker';
        // Notify everyone (Mics) that a new speaker joined
        socket.to('default').emit('user-joined', socket.id);
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
        // Notify others to cleanup
        socket.to('default').emit('user-left', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Signaling Server running on https://0.0.0.0:${PORT}`);
});
