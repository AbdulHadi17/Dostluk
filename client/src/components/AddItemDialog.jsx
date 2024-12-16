"use client";
import React, { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

export const AddItemDialog = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("lost");
  const [date, setDate] = useState();
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create form-data object
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("reportDate", date ? format(date, "yyyy-MM-dd") : "");
    formData.append("status", type);
    if (image) {
      formData.append("itemPicture", image);
    }

    try {
      // Send the data to the backend API
      const response = await axios.post(
        "http://localhost:3000/api/v1/LostAndFound/addAnItem", // Replace with your API endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Include cookies for authentication
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
        onClose();
        window.location.reload(); // Refresh the page to show the new item
      } else {
        toast.error(response.data.message || "Failed to add item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setType("lost");
    setDate(undefined);
    setImage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                required
              />
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
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(value) => setType(value)}
                className="col-span-3 flex"
              >
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
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 popover-content"
                  style={{ zIndex: 9999 }}
                  onClick={(e) => e.stopPropagation()}
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
                accept="image/*"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
