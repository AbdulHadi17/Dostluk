import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ChatroomCard } from './ChatroomCard';
import { CreateChatroomModal } from './CreateChatroomModal';
import { SearchInput } from './SearchInput';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from 'axios';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 6;

export function Chatroom() {
  const [chatrooms, setChatrooms] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchChatrooms = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3000/api/v1/chatrooms/suggestedChatrooms', { withCredentials: true });
        const { data } = response;
  
        if (data.success && Array.isArray(data.chatrooms)) {
          const formattedChatrooms = data.chatrooms.map(room => ({
            id: room.chatroomId || '', // Use id directly
            name: room.name || '', // Use the name directly
            description: room.description || '', // Use description directly
            type_id: room.type_id || '', // Use type_id for unique ID
            interests: Array.isArray(room.interests) ? room.interests : [], // Ensure interests is an array
            members: [], // Default to empty array as members aren't provided
            isPublic: true, // Assume public if not provided
            friendProfile: '/default-avatar.png', // Default profile picture
          }));
          setChatrooms(formattedChatrooms);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchChatrooms();
  }, []);
  
  const filteredChatrooms = chatrooms.filter(room => {
    const id = room.id || ''; // Default to empty string if undefined
    const title = room.title || ''; // Default to empty string if undefined
    const description = room.description || ''; // Default to empty string if undefined
    const tags = Array.isArray(room.tags) ? room.tags : []; // Ensure tags is an array

    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredChatrooms.length / ITEMS_PER_PAGE);
  const paginatedChatrooms = filteredChatrooms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCreateChatroom = (newChatroom) => {
    const id = (chatrooms.length + 1).toString();
    setChatrooms([...chatrooms, { ...newChatroom, id, members: [] }]);
    setIsCreateModalOpen(false);
    toast.success('Chatroom created successfully!');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <motion.h2
        className="text-3xl font-bold mb-6 text-slate-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        Chatrooms
      </motion.h2>
      <div className="flex justify-between items-center mb-6">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-slate-700 hover:bg-slate-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Create Chatroom
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          {paginatedChatrooms.map((room,index) => (
            <ChatroomCard key={index} chatroom={room} />
          ))}
        </motion.div>
      </AnimatePresence>
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}>
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <CreateChatroomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateChatroom} />
    </div>
  );
}
