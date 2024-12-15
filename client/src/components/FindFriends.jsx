import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { User, Star, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { toast, Toaster } from "sonner";

const FindFriends = () => {
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [friendRequests, setFriendRequests] = useState({});

  useEffect(() => {
    const fetchSuggestedProfiles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/user/findfriends', {withCredentials: true});

        
        if (response.data.success) {
          setSuggestedProfiles(response.data.data);
          toast.success("Friend suggested based on your interests!");
        } else {
          toast.error(`Failed to fetch suggestions: ${response.data.message}`);
        }
      } catch (error) {
        console.error("Error fetching suggested profiles:", error);
        toast.error("Error fetching friend suggestions. Please try again later.");
      }
    };

    fetchSuggestedProfiles();
  }, []);

  const toggleFriendRequest = (id) => {
    setFriendRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    // Display toast notification for friend request status
    if (!friendRequests[id]) {
      toast.success("Friend request sent!");
    } else {
      toast.info("Friend request canceled.");
    }
  };

  return (
    <div className="h-full bg-white p-6 shadow-2xl">
      {/* Toaster for Toast Notifications */}

      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Find Friends</h2>
      <p className="text-gray-600 text-center mb-6">
        Discover and connect with new friends based on your mutual interests.
      </p>

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
                        className="text-white px-2 py-1 rounded-md text-xs font-medium"
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
                  <button
                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-300 ${
                      friendRequests[profile.id]
                        ? "bg-green-500 text-white"
                        : "bg-slate-800 text-white hover:bg-slate-900"
                    }`}
                    onClick={() => toggleFriendRequest(profile.id)}
                  >
                    {friendRequests[profile.id] ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        Requested
                      </span>
                    ) : (
                      "Send Friend Request"
                    )}
                  </button>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2">
          <User className="w-6 h-6 text-blue-600" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <User className="w-6 h-6 text-blue-600" />
        </CarouselNext>
      </Carousel>
    </div>
  );
};

export default FindFriends;
