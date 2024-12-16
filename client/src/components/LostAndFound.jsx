import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { Search, Plus } from "lucide-react";
import { AddItemDialog } from "./AddItemDialog";
import { ItemCard } from "./ItemCard";
import { toast } from "sonner";

const LostAndFound = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("lost");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [items, setItems] = useState([]);

  // Fetch items from the API
  useEffect(() => {
    const fetchLostAndFoundItems = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/LostAndFound/getLostAndFoundItems",
          { withCredentials: true }
        );

        if (response.data.success) {
          const apiItems = response.data.data.map((item) => ({
            ...item,
            type: item.type.toLowerCase(), // Normalize type for tabs
            date: new Date(item.date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
            image: item.image || "https://via.placeholder.com/150", // Default placeholder image
          }));
          setItems(apiItems);
          toast.success("Lost and Found items loaded successfully!");
        } else {
          toast.error(`Failed to fetch items: ${response.data.message}`);
        }
      } catch (error) {
        console.error("Error fetching Lost and Found items:", error);
        toast.error("Error fetching items. Please try again later.");
      }
    };

    fetchLostAndFoundItems();
  }, []);

  // Adjust items per page based on viewport
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const viewportWidth = window.innerWidth;
      if (viewportWidth >= 1024) {
        setItemsPerPage(9);
      } else if (viewportWidth >= 640) {
        setItemsPerPage(6);
      } else {
        setItemsPerPage(3);
      }
    };

    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.type.toLowerCase() === tab &&
      (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddItem = (newItem) => {
    const formattedNewItem = {
      ...newItem,
      id: items.length + 1,
      date: new Date(newItem.date).toISOString().split("T")[0], // Format date as YYYY-MM-DD
      image: newItem.image || "https://via.placeholder.com/150", // Default placeholder image
    };
    setItems([...items, formattedNewItem]);
    setIsAddItemDialogOpen(false);
  };

  const renderPaginationItems = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage > 2) {
        pageNumbers.push(1, "...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 1) {
        pageNumbers.push("...", totalPages);
      }
    }

    return pageNumbers.map((page, index) =>
      typeof page === "string" ? (
        <PaginationItem key={index}>
          <span className="px-3">...</span>
        </PaginationItem>
      ) : (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            className={currentPage === page ? "font-bold" : ""}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Lost and Found</h2>
              <Button onClick={() => setIsAddItemDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <Tabs
              defaultValue="lost"
              onValueChange={(value) => {
                setTab(value);
                setCurrentPage(1);
              }}
              className="mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="lost">Lost Items</TabsTrigger>
                <TabsTrigger value="found">Found Items</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-4 mb-8">
                <Input
                  placeholder={`Search for ${tab} items...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <TabsContent value="lost">
                <ItemGrid items={paginatedItems} />
              </TabsContent>

              <TabsContent value="found">
                <ItemGrid items={paginatedItems} />
              </TabsContent>
            </Tabs>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
      <AddItemDialog
        isOpen={isAddItemDialogOpen}
        onClose={() => setIsAddItemDialogOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

const ItemGrid = ({ items }) => {
  return items.length > 0 ? (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-center">No items found.</p>
  );
};

export default LostAndFound;
