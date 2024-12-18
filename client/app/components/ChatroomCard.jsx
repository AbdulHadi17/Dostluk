import React from "'react'"
import { motion } from "'framer-motion'"
import { Lock, Users } from "'lucide-react'"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ChatroomCard({ chatroom }) {
  const { title, description, tags, members, isPublic } = chatroom

  return (
    (<motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}>
      <Card
        className="h-full flex flex-col overflow-hidden border-2 border-slate-200 hover:border-slate-400 transition-colors duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
          <CardTitle className="flex items-center justify-between text-slate-800">
            {title}
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
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-slate-200 text-slate-700">
                {tag}
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
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-medium border-2 border-white">
                +{members.length - 3}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white hover:bg-slate-100 text-slate-700 border-slate-300">
            <Users className="mr-2 h-4 w-4" />
            Join
          </Button>
        </CardFooter>
      </Card>
    </motion.div>)
  );
}

