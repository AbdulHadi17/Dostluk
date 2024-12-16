import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const ItemCard = ({ item }) => {
  const handleChat = (user) => {
    alert(`Opening chat with ${user}`)
  }

  return (
    (<Card className="overflow-hidden">
      <CardHeader className="p-0">
        <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={ `${item.profilePicture}`||`https://api.dicebear.com/6.x/initials/svg?seed=${item.reportedBy}`} />
              <AvatarFallback>{item.reportedBy.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{item.reportedBy}</span>
          </div>
          <span className="text-sm text-gray-500">{item.date}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => handleChat(item.reportedBy)} className="w-full">
          Chat with {item.reportedBy}
        </Button>
      </CardFooter>
    </Card>)
  );
}

