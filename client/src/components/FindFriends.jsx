import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { User, Star, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component from Shadcn.
import { Card, CardContent } from "@/components/ui/card"; // Importing Card components.

const FindFriends = () => {
  // Sample suggested profiles
  const suggestedProfiles = [
    {
      id: 1,
      name: "John Doe",
      profilePic: "https://via.placeholder.com/150",
      hobbies: ["Photography", "Traveling", "Cooking"],
      similarityPercentage: 87,
    },
    {
      id: 2,
      name: "Jane Smith",
      profilePic: "https://via.placeholder.com/150",
      hobbies: ["Music", "Dancing", "Yoga"],
      similarityPercentage: 92,
    },
    {
      id: 3,
      name: "Sam Wilson",
      profilePic: "https://via.placeholder.com/150",
      hobbies: ["Gaming", "Tech", "Sports"],
      similarityPercentage: 78,
    },
    {
      id: 4,
      name: "Emily Davis",
      profilePic: "https://via.placeholder.com/150",
      hobbies: ["Reading", "Writing", "Painting"],
      similarityPercentage: 85,
    },
    {
      id: 5,
      name: "Michael Brown",
      profilePic: "https://via.placeholder.com/150",
      hobbies: ["Hiking", "Fishing", "Camping"],
      similarityPercentage: 88,
    },
    {
      id: 6,
      name: "Sophia Taylor",
      profilePic: "https://via.placeholder.com/150",
      hobbies: ["Fitness", "Meditation", "Cooking"],
      similarityPercentage: 91,
    },
  ];

  const [friendRequests, setFriendRequests] = useState({});

  const toggleFriendRequest = (id) => {
    setFriendRequests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="h-full bg-white p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Find Friends</h2>
      <p className="text-gray-600 text-center mb-6">
        Discover and connect with new friends based on your mutual hobbies.
      </p>

      <Carousel className="max-w-[330px] md:max-w-md lg:max-w-xl xl:max-w-3xl mx-auto">
        <CarouselContent>
          {suggestedProfiles.map((profile) => (
            <CarouselItem key={profile.id} className="p-4 flex justify-center">
              <Card className="max-w-sm w-full shadow-xl bg-gray-50 rounded-lg">
                <CardContent className="flex flex-col items-center p-4 py-5">
                  <img
                    src={profile.profilePic}
                    alt={`${profile.name}'s profile`}
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{profile.name}</h3>
                  <div className="flex gap-2 mb-4 flex-wrap justify-center">
                    {profile.hobbies.map((hobby, index) => (
                      <Badge
                        key={index}
                        className="text-white px-2 py-1 rounded-md text-xs font-medium"
                      >
                        {hobby}
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
