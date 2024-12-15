import { useState, useEffect } from 'react';
import { User, Camera, X } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';
import { toast as mytoast } from 'sonner';

const UserProfile = () => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('/placeholder.svg');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [categories, setCategories] = useState({});
  const [originalData, setOriginalData] = useState(null); // Stores the original data
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get('http://localhost:3000/api/v1/user/getuserdata',{
          headers:{
            'Content-Type':'application/json'
        },
        withCredentials:true,
      });
        const { username, profilePicture, interests } = userResponse.data;

        const userData = {
          username: username || '',
          profilePicture: profilePicture || '/placeholder.svg',
          selectedInterests: interests || [],
        };

        setUsername(userData.username);
        setProfilePicture(userData.profilePicture);
        setSelectedInterests(userData.selectedInterests);
        setOriginalData(userData); // Save the original data

        // Fetch categories and interests
        const categoriesResponse = await axios.get('http://localhost:3000/api/v1/user/getCategoriesAndInterests',{
          headers:{
            'Content-Type':'application/json'
        },
        withCredentials:true,
      });
        setCategories(categoriesResponse.data.categories || {});

        toast({
          title: 'Data Loaded',
          description: 'Your profile data has been loaded successfully.',
          variant: 'success',
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load profile data.',
          variant: 'destructive',
        });
      }
    };

    fetchData();
  }, [toast]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePicture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterestChange = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      } else if (prev.length < 5) {
        return [...prev, interest];
      } else {
        toast({
          title: 'Maximum interests reached',
          description: 'You can only select up to 5 interests.',
          variant: 'destructive',
        });
        return prev;
      }
    });
  };
// Other code remains the same
const handleSave = async () => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('selectedInterests', JSON.stringify(selectedInterests));
  
  if (profilePictureFile) {
    formData.append('profilePicture', profilePictureFile); // Attach file
  }

  try {
    const response = await axios.post('http://localhost:3000/api/v1/user/editprofile', formData, {
      withCredentials: true, // Include cookies
    });

    toast({
      title: 'Success',
      description: response.data.message,
      variant: 'success',
    });

    mytoast(response.data.message);

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error(error);
    toast({
      title: 'Error',
      description: error.response?.data?.message || 'Something went wrong!',
      variant: 'destructive',
    });
    mytoast(error.response?.data?.message || 'Something went wrong!');
  }
};

  const handleReset = () => {
    if (originalData) {
      setUsername(originalData.username);
      setProfilePicture(originalData.profilePicture);
      setProfilePictureFile(null);
      setSelectedInterests(originalData.selectedInterests);
    }
    
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader className="bg-slate-100 shadow-xl border-b-2 border-gray-300">
        <CardTitle className="text-2xl font-bold text-black">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 bg-white p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-32 h-32 border-4 border-gray-200">
            <AvatarImage src={profilePicture} alt={username} />
            <AvatarFallback>
              <User className="w-16 h-16 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer bg-white text-black border-gray-300 hover:bg-gray-100"
            >
              <label htmlFor="picture" className="cursor-pointer flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                Change Picture
              </label>
            </Button>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
            {profilePicture !== '/placeholder.svg' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfilePicture('/placeholder.svg')}
                className="bg-white text-black border-gray-300 hover:bg-gray-100"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-black">
            Username
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border-gray-300 focus:border-black"
          />
        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Label className="text-black">Interests (Max 5)</Label>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedInterests.map((interest) => (
              <Badge key={interest} variant="secondary" className="bg-slate-200 text-black">
                {interest}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-gray-500 hover:text-black"
                  onClick={() => handleInterestChange(interest)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <ScrollArea className="h-[300px] rounded-md border border-gray-200 p-4">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(categories).map(([category, subInterests]) => (
                <AccordionItem value={category} key={category} className="border-b border-gray-200">
                  <AccordionTrigger className="text-black hover:text-gray-700">
                    {category}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      {subInterests.map((interest) => (
                        <div className="flex items-center space-x-2" key={interest}>
                          <Checkbox
                            id={interest}
                            checked={selectedInterests.includes(interest)}
                            onCheckedChange={() => handleInterestChange(interest)}
                            disabled={
                              selectedInterests.length >= 5 &&
                              !selectedInterests.includes(interest)
                            }
                            className="border-gray-400 text-black focus:ring-gray-400"
                          />
                          <label
                            htmlFor={interest}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                          >
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-100">
        <Button
          variant="outline"
          onClick={handleReset}
          className="bg-white text-black border-gray-300 hover:bg-gray-100"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          className="bg-black text-white hover:bg-gray-800"
        >
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserProfile;
