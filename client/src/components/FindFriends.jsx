import { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { User, Star, Check, X, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FindFriends = () => {
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [friendRequests, setFriendRequests] = useState({});
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch suggested profiles and incoming friend requests
  const fetchSuggestedProfiles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/friends/findfriends", {
        withCredentials: true,
      });

      if (response.data.success) {
        setSuggestedProfiles(response.data.data);
        toast.success("Friend suggestions based on your interests!");
      } else {
        toast.error(`Failed to fetch suggestions: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error fetching suggested profiles:", error);
      toast.error("Error fetching friend suggestions. Please try again later.");
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/friends/getFriendRequests", {
        withCredentials: true,
      });

      if (response.data.success) {
        setIncomingRequests(response.data.data);
      } else {
        toast.error(`Failed to fetch incoming requests: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error fetching incoming requests:", error);
      toast.error("Error fetching incoming friend requests. Please try again later.");
    }
  };

  useEffect(() => {
    fetchSuggestedProfiles();
    fetchIncomingRequests();
  }, []);

  // Handle friend request accept/decline
  const handleFriendRequest = async (id, action) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/friends/${action}FriendRequest/${id}`,
        {},
        { withCredentials: true }
      );

      console.log(response.data);

      if (response.data.success) {
        console.log(response.data)
        toast.success(response.data.message);
        // Refresh the data after accepting/declining a friend request
        fetchIncomingRequests();
        fetchSuggestedProfiles();
      } else {
        toast.error(`Failed to ${action} friend request: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast.error(`Error ${action}ing friend request. Please try again later.`);
    }
  };

  // Send or toggle a friend request
  const toggleFriendRequest = async (id) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v1/friends/sendRequest/${id}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setFriendRequests((prev) => ({
          ...prev,
          [id]: response.data.status,
        }));
        toast.success(response.data.message);
      } else {
        toast.error(`Failed to update friendship status: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error toggling friend request:", error);
      toast.error("Error processing friend request. Please try again later.");
    }
  };

  return (
    <div className="h-full bg-white p-6 shadow-2xl">
      <Toaster />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Find Friends</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <Bell className="w-5 h-5" />
              {incomingRequests.length > 0 && (
                <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs">
                  {incomingRequests.length}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incoming Friend Requests</DialogTitle>
            </DialogHeader>
            {incomingRequests.length === 0 ? (
              <p className="text-center text-gray-500 my-4">No incoming friend requests.</p>
            ) : (
              <ul className="space-y-4">
                {incomingRequests.map((request, key) => (
                  <li key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.profilePicture || "https://via.placeholder.com/40"}
                        alt={`${request.name}'s profile`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{request.name}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFriendRequest(request.id, "accept")}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFriendRequest(request.id, "decline")}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <p className="text-gray-600 text-center mb-6">
        Discover and connect with new friends based on your mutual interests.
      </p>

      {suggestedProfiles.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg font-medium">
            Currently, no user matches your interests. Change or add your interests to get friends suggested.
          </p>
        </div>
      ) : (
        <Carousel className="max-w-[330px] md:max-w-md lg:max-w-xl xl:max-w-3xl mx-auto">
          <CarouselContent>
            {suggestedProfiles.map((profile) => (
              <CarouselItem key={profile.id} className="p-4 flex justify-center">
                <Card className="max-w-sm w-full shadow-xl bg-gray-50 rounded-lg">
                  <CardContent className="flex flex-col items-center p-4 py-5">
                    <img
                      src={profile.profilePicture || "https://via.placeholder.com/150"}
                      alt={`${profile.name}'s profile`}
                      className="w-24 h-24 rounded-full object-cover mb-4"
                    />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{profile.name}</h3>
                    <div className="flex gap-2 mb-4 flex-wrap justify-center">
                      {profile.commonInterests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="default"
                          className="px-2 py-1 text-xs font-medium"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {profile.similarityPercentage}% Similar
                      </span>
                    </div>
                    <Button
                      variant={friendRequests[profile.id] === "Requested" ? "secondary" : "default"}
                      className="w-full"
                      onClick={() => toggleFriendRequest(profile.id)}
                    >
                      {friendRequests[profile.id] === "Requested" ? (
                        <span className="flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Requested
                        </span>
                      ) : (
                        "Send Friend Request"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}
    </div>
  );
};

export default FindFriends;
