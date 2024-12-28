import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    },
});

const userSocketMap = new Map();

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Register user with their user ID
    socket.on('register', (userId) => {
        userSocketMap.set(userId, socket.id);
        console.log(`User registered: ${userId} -> ${socket.id}`);
    });

    // Handling chatroom messages
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room: ${room}`);
    });

    socket.on('sendRoomMessage', async ({ room, message, chatroomId }) => {
        const timestamp = new Date().toLocaleTimeString();

        // Emit message to room
        socket.to(room).emit('receiveRoomMessage', {
            message,
            sender: socket.id,
            timestamp,
        });

        // Save message to the database via API
        try {
            await axios.post(`http://localhost:3000/api/v1/message/sendMessage/${chatroomId}`, {
                content: message,
                timestamp,
            });
            console.log(`Message saved to chatroom ${chatroomId}`);
        } catch (error) {
            console.error(`Failed to save message to chatroom ${chatroomId}`, error);
        }
    });

    // Handling private messages
    socket.on('sendPrivateMessage', async ({ recipientId, message,Sender_Name }) => {
        const recipientSocketId = userSocketMap.get(recipientId);
        const timestamp = new Date();
        console.log(`Recipient socket ID: ${recipientSocketId}`);
        console.log(`Recipient socket ID: ${recipientSocketId}`);
        console.log(message);
        console.log(timestamp);
        console.log(Sender_Name);

        if (recipientSocketId) {
            io.to([recipientSocketId,socket.id]).emit('receivePrivateMessage', {
                Content:message,
                Sender_Name: Sender_Name,
                Timestamp:timestamp,
            });

            console.log(`Private message from ${socket.id} to ${recipientSocketId}: ${message}`);
        } else {
            console.log(`Recipient ${recipientId} is not connected.`);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`User ${userId} removed from map.`);
                break;
            }
        }
    });
});

export { app, server, io };
