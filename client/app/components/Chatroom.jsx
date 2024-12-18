"'use client'"

import React, { useState } from "'react'"
import { motion, AnimatePresence } from "'framer-motion'"
import { Plus } from "'lucide-react'"
import { Button } from "@/components/ui/button"
import { ChatroomCard } from "'./ChatroomCard'"
import { CreateChatroomModal } from "'./CreateChatroomModal'"
import { SearchInput } from "'./SearchInput'"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const sampleChatrooms = [
  {
    id: "'1'",
    title: "'React Enthusiasts'",
    description: "'Discuss all things React and frontend development'",
    tags: ["'React'", "'Frontend'"],
    members: [
      { name: "'Alice'", avatar: "'/placeholder.svg?height=32&width=32'" },
      { name: "'Bob'", avatar: "'/placeholder.svg?height=32&width=32'" },
      { name: "'Charlie'", avatar: "'/placeholder.svg?height=32&width=32'" },
    ],
    isPublic: true,
  },
  {
    id: "'2'",
    title: "'Node.js Ninjas'",
    description: "'Backend development with Node.js'",
    tags: ["'Node.js'", "'Backend'"],
    members: [
      { name: "'David'", avatar: "'/placeholder.svg?height=32&width=32'" },
      { name: "'Eve'", avatar: "'/placeholder.svg?height=32&width=32'" },
    ],
    isPublic: true,
  },
  {
    id: "'3'",
    title: "'Python Pioneers'",
    description: "'Explore the world of Python programming'",
    tags: ["'Python'", "'Programming'"],
    members: [
      { name: "'Frank'", avatar: "'/placeholder.svg?height=32&width=32'" },
      { name: "'Grace'", avatar: "'/placeholder.svg?height=32&width=32'" },
    ],
    isPublic: true,
  },
  {
    id: "'4'",
    title: "'UI/UX United'",
    description: "'Discuss user interface and experience design'",
    tags: ["'UI'", "'UX'"],
    members: [
      { name: "'Henry'", avatar: "'/placeholder.svg?height=32&width=32'" },
      { name: "'Ivy'", avatar: "'/placeholder.svg?height=32&width=32'" },
    ],
    isPublic: true,
  },
  {
    id: "'5'",
    title: "'Data Science Explorers'",
    description: "'Dive into data analysis and machine learning'",
    tags: ["'Data Science'", "'ML'"],
    members: [
      { name: "'Jack'", avatar: "'/placeholder.svg?height=32&width=32'" },
      { name: "'Kate'", avatar: "'/placeholder.svg?height=32&width=32'" },
    ],
    isPublic: true,
  },
]

const ITEMS_PER_PAGE = 6

export default function ChatroomList() {
  const [chatrooms, setChatrooms] = useState(sampleChatrooms)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("''")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredChatrooms = chatrooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))

  const totalPages = Math.ceil(filteredChatrooms.length / ITEMS_PER_PAGE)
  const paginatedChatrooms = filteredChatrooms.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleCreateChatroom = (newChatroom) => {
    const id = (chatrooms.length + 1).toString()
    setChatrooms([...chatrooms, { ...newChatroom, id, members: [] }])
    setIsCreateModalOpen(false)
  }

  return (
    (<div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
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
          {paginatedChatrooms.map((room) => (
            <ChatroomCard key={room.id} chatroom={room} />
          ))}
        </motion.div>
      </AnimatePresence>
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "'pointer-events-none opacity-50'" : "''"} />
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
                className={currentPage === totalPages ? "'pointer-events-none opacity-50'" : "''"} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
      <CreateChatroomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateChatroom} />
    </div>)
  );
}

