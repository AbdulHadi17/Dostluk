'use client'

import { useState, useEffect } from 'react'
import { User, Camera, X } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const interests = {
  "Sports": [
    "Football", "Basketball", "Cricket", "Badminton", "Table Tennis", "Swimming",
    "Running", "Cycling", "Rock Climbing", "Volleyball", "Futsal"
  ],
  "Entertainment": [
    "Movies", "TV Shows", "Pop Music", "Rock Music", "Hip-Hop Music", "Jazz Music",
    "Video Games", "Board Games", "Card Games", "Stand-Up Comedy", "Anime", "Podcasts"
  ],
  "Fitness and Wellness": [
    "Gym", "Yoga", "Meditation", "Hiking", "Cycling", "Home Workouts", "Dance Fitness (Zumba)"
  ],
  "Travel": [
    "Backpacking", "Road Trips", "Hiking Tours", "Local Cuisine", "Budget Travel", "Cultural Tours"
  ],
  "Technology": [
    "Web Development", "Mobile Apps", "AI and Machine Learning", "PC Gaming",
    "Console Gaming", "VR and AR Games", "Drones", "Smartphones", "3D Printing", "Graphic Design"
  ],
  "Food and Drink": [
    "Baking", "Grilling", "Coffee", "Tea", "Chocolate Tasting", "Pastries",
    "Cooking Challenges", "Food Blogging"
  ],
  "Books and Literature": [
    "Fiction", "Non-Fiction", "Fantasy", "Biographies", "Poetry", "Blogging",
    "Journaling", "Self-Help Books", "E-Books and Audiobooks"
  ],
  "Fashion": [
    "Streetwear", "Casualwear", "Jewelry", "Shoes", "Thrifting", "Personal Styling"
  ],
  "DIY and Crafts": [
    "Knitting", "Embroidery", "Painting", "Decorating", "DIY Home Projects", "Upcycling Clothes"
  ],
  "Science and Nature": [
    "Stargazing", "Bird Watching", "Recycling", "Sustainability Projects", "Gardening", "Urban Farming"
  ],
  "Professional Development": [
    "Resume Building", "Public Speaking", "Networking", "LinkedIn Optimization",
    "Freelancing", "Entrepreneurship", "Personal Finance Management"
  ],
  "Clubs and Societies": [
    "Debate Club", "Drama Society", "Tech Club", "Photography Club",
    "Music Club", "Environment Club", "Entrepreneurship Club"
  ],
  "Social Activities": [
    "Event Hosting", "Volunteering", "Charity Drives", "Peer Mentoring", "Community Cleanups"
  ]
}

const UserProfile = () => {
  const [username, setUsername] = useState('JohnDoe')
  const [profilePicture, setProfilePicture] = useState('/placeholder.svg')
  const [selectedInterests, setSelectedInterests] = useState([])
  const { toast } = useToast()

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePicture(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInterestChange = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest)
      } else if (prev.length < 5) {
        return [...prev, interest]
      } else {
        toast({
          title: "Maximum interests reached",
          description: "You can only select up to 5 interests.",
          variant: "destructive",
        })
        return prev
      }
    })
  }

  const handleSave = () => {
    // Here you would typically send the data to your backend
    console.log({ username, profilePicture, selectedInterests })
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleReset = () => {
    setUsername('JohnDoe')
    setProfilePicture('/placeholder.svg')
    setSelectedInterests([])
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader className="bg-gray-100">
        <CardTitle className="text-2xl font-bold text-black">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 bg-white p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-32 h-32 border-4 border-gray-200">
            <AvatarImage src={profilePicture} alt={username} />
            <AvatarFallback><User className="w-16 h-16 text-gray-400" /></AvatarFallback>
          </Avatar>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="cursor-pointer bg-white text-black border-gray-300 hover:bg-gray-100">
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
          <Label htmlFor="username" className="text-black">Username</Label>
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
              {Object.entries(interests).map(([category, subInterests]) => (
                <AccordionItem value={category} key={category} className="border-b border-gray-200">
                  <AccordionTrigger className="text-black hover:text-gray-700">{category}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2">
                      {subInterests.map((interest) => (
                        <div className="flex items-center space-x-2" key={interest}>
                          <Checkbox
                            id={interest}
                            checked={selectedInterests.includes(interest)}
                            onCheckedChange={() => handleInterestChange(interest)}
                            disabled={selectedInterests.length >= 5 && !selectedInterests.includes(interest)}
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
        <Button variant="outline" onClick={handleReset} className="bg-white text-black border-gray-300 hover:bg-gray-100">Reset</Button>
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">Save Changes</Button>
      </CardFooter>
    </Card>
  )
}

export default UserProfile

