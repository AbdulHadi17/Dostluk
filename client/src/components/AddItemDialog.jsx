"'use client'";
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from 'lucide-react'

export const AddItemDialog = ({ isOpen, onClose, onAddItem }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("lost")
  const [date, setDate] = useState()
  const [image, setImage] = useState(null)
  const [reportedBy, setReportedBy] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const newItem = {
      title,
      description,
      type,
      date: date ? format(date, "yyyy-MM-dd") : "",
      image: image ? URL.createObjectURL(image) : "https://via.placeholder.com/150",
      reportedBy,
    }
    onAddItem(newItem)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setType("lost")
    setDate(undefined)
    setImage(null)
    setReportedBy("")
  }

  return (
    (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(value) => setType(value)}
                className="col-span-3 flex">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found">Found</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 justify-start text-left font-normal ${
                      !date && "text-slate-500 dark:text-slate-400"
                    }`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 popover-content"
                  style={{ zIndex: 9999 }}
                  onClick={(e) => e.stopPropagation()} // Prevents dialog from interfering
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => setDate(selectedDate)}
                    initialFocus
                  />
                </PopoverContent>

              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image" className="text-right">
                Image
              </Label>
              <Input
                id="image"
                type="file"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="col-span-3"
                accept="image/*" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportedBy" className="text-right">
                Reported By
              </Label>
              <Input
                id="reportedBy"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="col-span-3"
                required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>)
  );
}

