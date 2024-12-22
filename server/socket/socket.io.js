import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
});

io.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);

    // Handling chatroom messages
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room: ${room}`);
    });

    socket.on('sendRoomMessage', ({ room, message }) => {
        // Broadcast the message to everyone in the room except the sender
        socket.to(room).emit('receiveRoomMessage', {
            message,
            sender: socket.id,
            timestamp: new Date().toLocaleTimeString(),
        });
    });
    
    // Handling private messages
    socket.on('sendPrivateMessage', ({ recipientId, message }) => {
        io.to(recipientId).emit('receivePrivateMessage', {
            message,
            sender: socket.id,
            timestamp: new Date().toLocaleTimeString(),
        });
        console.log(`Private message from ${socket.id} to ${recipientId}: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    });
});

export { app, server ,io};
