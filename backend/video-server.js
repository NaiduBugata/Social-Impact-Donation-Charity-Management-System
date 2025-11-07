// Simple Video Call Server using Socket.io
// This server handles WebRTC signaling for peer-to-peer video calls

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.VIDEO_PORT || 5001;

// Store active connections
const activeConnections = new Map();

io.on('connection', (socket) => {
  console.log(`[Video Server] Client connected: ${socket.id}`);
  
  // Store socket ID
  activeConnections.set(socket.id, { socketId: socket.id, connectedAt: new Date() });

  // Handle call initiation
  socket.on('callUser', (data) => {
    console.log(`[Video Server] Call request from ${data.from} to ${data.userToCall}`);
    io.to(data.userToCall).emit('callUser', {
      signal: data.signalData,
      from: data.from
    });
  });

  // Handle call answer
  socket.on('answerCall', (data) => {
    console.log(`[Video Server] Call answered, sending signal to ${data.to}`);
    io.to(data.to).emit('callAccepted', data.signal);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`[Video Server] Client disconnected: ${socket.id}`);
    activeConnections.delete(socket.id);
  });

  // Handle call end
  socket.on('endCall', (data) => {
    if (data.to) {
      io.to(data.to).emit('callEnded');
    }
  });

  // Peer discovery (optional - helps find peer IDs)
  socket.on('getPeers', (callback) => {
    const peers = Array.from(activeConnections.keys()).filter(id => id !== socket.id);
    callback(peers);
  });
});

server.listen(PORT, () => {
  console.log(`[Video Server] Listening on port ${PORT}`);
  console.log(`[Video Server] WebRTC signaling ready`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Video Server] SIGTERM received, closing server...');
  server.close(() => {
    console.log('[Video Server] Server closed');
    process.exit(0);
  });
});
