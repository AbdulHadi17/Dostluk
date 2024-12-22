import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Users, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000', { withCredentials: true });

const Chat = () => {
    const [activeChat, setActiveChat] = useState(null);
    const [activeTab, setActiveTab] = useState("direct");
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeRoom, setActiveRoom] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [directMessages, setDirectMessages] = useState([]);

    useEffect(() => {
        // Fetch chat rooms
        axios.get('http://localhost:3000/api/v1/chatrooms/getUserChatrooms', { withCredentials: true })
            .then(response => {
                setChatRooms(response.data.chatrooms || []); // Use response.data.chatrooms
                toast.success("Chat rooms loaded successfully");
            })
            .catch(error => {
                toast.error("Failed to load chat rooms");
            });

        // Fetch friends
        axios.get('http://localhost:3000/api/v1/friends/getfriends', { withCredentials: true })
            .then(response => {
                setDirectMessages(response.data.friendsList || []); // Use response.data.friendsList
                toast.success("Friends list loaded successfully");
                // console.log(directMessages);
            })
            .catch(error => {
                console.error("Error fetching friends:", error);
                toast.error("Failed to load friends list");
            });
    }, []);

    useEffect(() => {
        const handleRoomMessage = ({ message, sender, timestamp }) => {
            setMessages(prev => [
                ...prev,
                { sender, content: message, timestamp },
            ]);
        };

        const handlePrivateMessage = ({ message, sender, timestamp }) => {
            setMessages(prev => [
                ...prev,
                { sender, content: message, timestamp },
            ]);
        };

        socket.on("receiveRoomMessage", handleRoomMessage);
        socket.on("receivePrivateMessage", handlePrivateMessage);

        return () => {
            socket.off("receiveRoomMessage", handleRoomMessage);
            socket.off("receivePrivateMessage", handlePrivateMessage);
        };
    }, []);

    function convertTimestampToTime(timestamp) {
        const date = new Date(timestamp);
    
        // Extract hours and minutes, ensuring two-digit format
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
    
        // Combine into HH:MM format
        return `${hours}:${minutes}`;
    }

    const handleChatClick = (chatId, chatName, isRoom) => {
        setActiveChat(chatName);

        if (isRoom) {
            setActiveRoom(chatName);
            socket.emit("joinRoom", chatName);
        } else {
            setActiveRoom(null); // For private messages, no room is joined
        }

        // Fetch messages from the backend
        alert(chatId);
        axios.get(`http://localhost:3000/api/v1/message/getFullChat/${chatId}`, { withCredentials: true })
            .then(response => {
                setMessages(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
                toast.error("Failed to load messages");
            });
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        if (activeRoom) {
            socket.emit("sendRoomMessage", { room: activeRoom, message: newMessage });
        } else {
            socket.emit("sendPrivateMessage", { recipientId: activeChat, message: newMessage });
        }

        setMessages(prev => [
            ...prev,
            { sender: "You", content: newMessage, timestamp: new Date().toLocaleTimeString() },
        ]);
        setNewMessage("");
    };

    const handleLeaveChatRoom = () => {
        if (activeRoom) {
            socket.emit("leaveRoom", activeRoom);
            setActiveRoom(null);
        }
        setActiveChat(null);
        setMessages([]);
    };

    return (
        <div className="h-full bg-gradient-to-br from-white to-gray-100 text-gray-800 p-4 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-blue-500 pb-2">Chat</h2>
            <AnimatePresence>
                {!activeChat ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2 bg-blue-50 rounded-t-lg">
                                <TabsTrigger value="direct" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2">Direct Messages</TabsTrigger>
                                <TabsTrigger value="rooms" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2">Chat Rooms</TabsTrigger>
                            </TabsList>
                            <TabsContent value="direct">
                                <ScrollArea className="h-[calc(100vh-200px)] bg-white rounded-b-lg shadow-inner">
                                    {directMessages?.length > 0 ? (
                                        directMessages.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-300 transition-colors duration-200"
                                                onClick={() => handleChatClick(chat.chatroom_id, chat.name, false)}
                                            >
                                                <div className="flex items-center">
                                                    <MessageSquare className="mr-3 text-blue-500" />
                                                    <div className="flex-grow">
                                                        <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {chat.lastSender === "-" ? "" : `${chat.lastSender}: `}
                                                            {chat.lastMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center">No direct messages found.</p>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="rooms">
                                <ScrollArea className="h-[calc(100vh-200px)] bg-white rounded-b-lg shadow-inner">
                                    {chatRooms?.length > 0 ? (
                                        chatRooms.map((room) => (
                                            <div
                                                key={room.id}
                                                className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-300 transition-colors duration-200"
                                                onClick={() => handleChatClick(room.id, room.name, true)}
                                            >
                                                <div className="flex items-center">
                                                    <Users className="mr-3 text-green-500" />
                                                    <div className="flex-grow">
                                                        <h3 className="font-semibold text-gray-900">{room.name}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {room.lastSender === "-" ? "" : `${room.lastSender}: `}
                                                            {room.lastMessage}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center">No chat rooms found.</p>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-0 bg-gradient-to-br from-white to-gray-100 p-4 z-50"
                    >
                        <div className="flex justify-between items-center mb-4 border-b-2 border-blue-500 pb-2">
                            <h3 className="text-xl font-bold text-gray-900">{activeChat}</h3>
                            <div>
                                {activeTab === 'rooms' && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleLeaveChatRoom}
                                        className="mr-2"
                                    >
                                        Leave Room
                                    </Button>
                                )}
                                <Button variant="outline" size="icon" onClick={() => setActiveChat(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="h-[calc(100vh-200px)] mb-4 bg-white rounded-lg shadow-inner p-4">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`mb-4 ${message.sender === "You" ? "text-right" : "text-left"}`}
                                >
                                    <div
                                        className={`inline-block p-3 rounded-lg ${
                                            message.Sender_Name === "You"
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                : "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800"
                                        }`}
                                    >
                                        <p className="font-semibold">{message.Sender_Name}</p>
                                        <p>{message.Content}</p>
                                        <div className="text-xs mt-1">{convertTimestampToTime(message.Timestamp)}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </ScrollArea>
                        <div className="flex items-center">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-grow mr-2"
                            />
                            <Button onClick={sendMessage} size="icon" className="bg-slate-900 hover:bg-slate-800 text-white">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Chat;
