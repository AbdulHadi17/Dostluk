import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash, Mail } from "lucide-react"; // Importing the Mail icon from lucide-react
import { toast } from "sonner";
import axios from "axios";

export const ItemCard = ({ item, CurrentUsername, handleDeleteOrClaimItem }) => {
  
  const handleContact = (item) => {
    const subject = `Regarding your Lost/Found item: ${item.title}`;
    const body = `Hello ${item.reportedBy},\n\nI would like to inquire about the item: ${item.title}.\n\nBest regards,\n[Your Name]`;
    
    // Encode the subject and body to ensure proper handling of special characters and spaces
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
  
    const mailtoLink = `mailto:${item.email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    // Open the default mail client with the encoded subject and body
    window.location.href = mailtoLink;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={item.profilePicture || `https://api.dicebear.com/6.x/initials/svg?seed=${item.reportedBy}`}
              />
              <AvatarFallback>{item.reportedBy.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{item.reportedBy}</span>
          </div>
          <span className="text-sm text-gray-500">{item.date}</span>
        </div>
      </CardContent>
      <CardFooter>
        {item.reportedBy === CurrentUsername ? (
          <Button
            onClick={() => handleDeleteOrClaimItem(item.id)}
            variant="destructive"
            className="flex items-center justify-center w-full"
          >
            <Trash className="w-4 h-4 mr-2" /> Delete / Claim
          </Button>
        ) : (
          <Button
            onClick={() => handleContact(item)}
            className="flex items-center justify-center w-full"
          >
            <Mail className="w-4 h-4 mr-2" /> Mail {item.reportedBy}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
