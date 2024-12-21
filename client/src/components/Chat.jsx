import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { X, Send, Check, CheckCheck, Users, MessageSquare, MoreVertical, Trash2 } from 'lucide-react';

// Mock data for demonstration
const chatRooms = [
  { id: 1, name: "General", lastMessage: "Hello everyone!", lastSender: "Alice" },
  { id: 2, name: "Random", lastMessage: "What's up?", lastSender: "You" },
];

const directMessages = [
  { id: 1, name: "Alice", lastMessage: "Hey, how are you?", lastSender: "Alice" },
  { id: 2, name: "Bob", lastMessage: "Did you see the game last night?", lastSender: "You" },
];

const messages = [
  { id: 1, sender: "Alice", content: "Hey there!", timestamp: "10:30 AM", isRead: true, isSent: false },
  { id: 2, sender: "You", content: "Hi Alice! How are you?", timestamp: "10:31 AM", isRead: true, isSent: true },
  { id: 3, sender: "Alice", content: "I'm good, thanks! How about you?", timestamp: "10:32 AM", isRead: false, isSent: false },
];

const Chat = () => {
  const [activeChat, setActiveChat] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState("direct");

  const handleChatClick = (chatName) => {
    setActiveChat(chatName);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  const handleDeleteMessage = (messageId) => {
    console.log(`Delete message with ID: ${messageId}`);
    // Implement delete logic here
  };

  const handleLeaveChatRoom = () => {
    console.log(`Leave chat room: ${activeChat}`);
    setActiveChat(null);
    // Implement leave chat room logic here
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
              <TabsList className="grid w-full grid-cols-2  bg-blue-50 rounded-t-lg">
                <TabsTrigger value="direct" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white py-2 ">Direct Messages</TabsTrigger>
                <TabsTrigger value="rooms" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white   py-2">Chat Rooms</TabsTrigger>
              </TabsList>
              <TabsContent value="direct">
                <ScrollArea className="h-[calc(100vh-200px)] bg-white rounded-b-lg shadow-inner">
                  {directMessages.map((chat) => (
                    <div
                      key={chat.id}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-300 transition-colors duration-200"
                      onClick={() => handleChatClick(chat.name)}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="mr-3 text-blue-500" />
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                          <p className="text-sm text-gray-600">
                            {chat.lastSender === "You" ? "You: " : `${chat.name}: `}
                            {chat.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="rooms">
                <ScrollArea className="h-[calc(100vh-200px)] bg-white rounded-b-lg shadow-inner">
                  {chatRooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-300 transition-colors duration-200"
                      onClick={() => handleChatClick(room.name)}
                    >
                      <div className="flex items-center">
                        <Users className="mr-3 text-green-500" />
                        <div className="flex-grow">
                          <h3 className="font-semibold text-gray-900">{room.name}</h3>
                          <p className="text-sm text-gray-600">
                            {room.lastSender === "You" ? "You: " : `${room.lastSender}: `}
                            {room.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                <Button variant="outline" size="icon" onClick={handleCloseChat}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-200px)] mb-4 bg-white rounded-lg shadow-inner p-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-4 ${
                    message.isSent ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.isSent
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-semibold">
                        {message.isSent ? 'You' : message.sender}
                      </p>
                      {message.isSent && (
                        <DropdownMenu className>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)} className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p>{message.content}</p>
                    <div className="text-xs mt-1 flex justify-end items-center">
                      <span className="mr-1">{message.timestamp}</span>
                      {message.isSent && (
                        message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </ScrollArea>
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="Type your message..."
                className="flex-grow mr-2 bg-white text-gray-800 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <Button size="icon" className="bg-slate-900 hover:bg-slate-800 text-white">
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

