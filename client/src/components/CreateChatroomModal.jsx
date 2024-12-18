import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const interests = [
  'React', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Python', 'Java', 'C#',
  'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 'JavaScript', 'HTML', 'CSS'
]

export function CreateChatroomModal({
  isOpen,
  onClose,
  onCreate
}) {
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");  
  const [tags, setTags] = useState([])
  const [isPublic, setIsPublic] = useState(true)

  const handleCreate = () => {
    onCreate({
      title,
      description,
      tags,
      isPublic,
    })
    setTitle('')
    setDescription('')
    setTags([])
    setIsPublic(true)
  }

  return (
    (<AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center dark:bg-slate-950/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md dark:bg-slate-950"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create Chatroom</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter chatroom title" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter chatroom description" />
              </div>
              <div>
                <Label htmlFor="tags">Interests (max 2)</Label>
                <Select
                  onValueChange={(value) => setTags(prev => prev.length < 2 ? [...prev, value] : prev)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interests" />
                  </SelectTrigger>
                  <SelectContent>
                    {interests.map((interest) => (
                      <SelectItem key={interest} value={interest}>
                        {interest}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => setTags(prev => prev.filter(t => t !== tag))}>
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public">Public Chatroom</Label>
              </div>
              <Button className="w-full" onClick={handleCreate}>
                Create Chatroom
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>)
  );
}

