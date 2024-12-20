'use client';
import React from 'react';
import { motion } from 'framer-motion'; // Import motion
import { Lock, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import axios from 'axios';
import { toast } from 'sonner';

export function ChatroomCard({ chatroom }) {
  const {
    name = '', // Default to empty string
    description = '', // Default to empty string
    type_id = '', // Default to empty string or handle as needed
    interests = [], // Default to an empty array
    members = [], // Default members to an empty array
    isPublic = true, // Default isPublic to true
    friendProfile = '/default-avatar.png', // Default avatar if missing
  } = chatroom;

  const handleJoinChatroom = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/chatrooms/joinchatroom/${type_id}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Successfully joined the chatroom!');
      } else {
        toast.error(response.data.message || 'Failed to join the chatroom.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Unauthorized: Please log in again.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred while joining the chatroom.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col overflow-hidden border-2 border-slate-200 hover:border-slate-400 transition-colors duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100 mb-2">
          <CardTitle className="flex items-center justify-between text-slate-800 mb-4">
            {name}
            {!isPublic && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="h-4 w-4 text-slate-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Private Chatroom</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <Badge
                key={index}
                variant="default"
                className="bg-slate-700 text-slate-50 hover:bg-slate-800 px-3 py-1 rounded-md"
              >
                {interest}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex-grow bg-white">
          <p className="text-slate-600">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-slate-50">
          <div className="flex items-center -space-x-2">
            {members.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="border-2 border-white">
                <AvatarImage src={member.avatar || friendProfile} alt={member.name || 'Unknown'} />
                <AvatarFallback>{member.name ? member.name[0] : '?'}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-medium border-2 border-white">
                +{members.length - 3}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
            onClick={handleJoinChatroom}
          >
            <Users className="mr-2 h-4 w-4" />
            Join
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
