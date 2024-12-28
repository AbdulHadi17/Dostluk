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
    socket.on('joinRoom', (roomid) => {
        console.log(`User ${socket.id} joining room: ${roomid}`);
        socket.join(roomid);
        console.log(`User ${socket.id} joined room: ${roomid}`);
    });

    socket.on('leaveRoom', (room) => {
        socket.leave(room);
        console.log(`User ${socket.id} left room: ${room}`);
    });

    socket.on('sendRoomMessage', async ({ room, message, chatroomId, Sender_Name }) => {
        const timestamp = new Date();
        // console.log(`Recipient socket ID: ${recipientSocketId}`);
        // console.log(`Recipient socket ID: ${recipientSocketId}`);
        // console.log(message);
        // console.log(timestamp);
        // console.log(Sender_Name);
        console.log(`Room: ${room}`);
        console.log(`Chatroom: ${chatroomId}`);
        console.log(`Message: ${message}`);
        console.log(`Sender: ${Sender_Name}`);


        if (room) { // Emit message to room
            console.log('inside room')
            io.to(chatroomId).emit('receiveRoomMessage', {
                Content: message,
                Sender_Name: Sender_Name,
                Timestamp: timestamp,
            });

            console.log(`Room Message from ${Sender_Name} to ${chatroomId}: ${message}`);
        } else {
            console.log(`Chatroom ${chatroomId} error.`);
        }
    });

    // Handling private messages
    socket.on('sendPrivateMessage', async ({ recipientId, message,Sender_Name }) => {
        const recipientSocketId = userSocketMap.get(recipientId);
        const timestamp = new Date();
        // console.log(`Recipient socket ID: ${recipientSocketId}`);
        // console.log(`Recipient socket ID: ${recipientSocketId}`);
        // console.log(message);
        // console.log(timestamp);
        // console.log(Sender_Name);

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
