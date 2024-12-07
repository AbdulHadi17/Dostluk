import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Button } from "@/components/ui/button.jsx";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination.jsx";
import { Search } from "lucide-react";

const LostAndFound = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [tab, setTab] = useState("lost");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const items = [
    {
      id: 1,
      type: "lost",
      title: "Lost Wallet",
      reportedBy: "Ali Khan",
      image: "https://via.placeholder.com/150/FF5733",
    },
    {
      id: 2,
      type: "found",
      title: "Found Watch",
      reportedBy: "Ayesha Ahmed",
      image: "https://via.placeholder.com/150/33FF57",
    },
    {
      id: 3,
      type: "lost",
      title: "Lost Keys",
      reportedBy: "Bilal Siddiqui",
      image: "https://via.placeholder.com/150/5733FF",
    },
    {
      id: 4,
      type: "lost",
      title: "Lost Backpack",
      reportedBy: "Zara Malik",
      image: "https://via.placeholder.com/150/FF33A1",
    },
    {
      id: 5,
      type: "found",
      title: "Found Glasses",
      reportedBy: "Hamza Ali",
      image: "https://via.placeholder.com/150/A1FF33",
    },
    {
      id: 6,
      type: "lost",
      title: "Lost Umbrella",
      reportedBy: "Sara Javed",
      image: "https://via.placeholder.com/150/33A1FF",
    },
    {
      id: 7,
      type: "found",
      title: "Found Notebook",
      reportedBy: "Usman Raza",
      image: "https://via.placeholder.com/150/FF5733",
    },
    {
      id: 8,
      type: "lost",
      title: "Lost Headphones",
      reportedBy: "Hina Nawaz",
      image: "https://via.placeholder.com/150/33FF57",
    },
    {
      id: 9,
      type: "found",
      title: "Found Phone Case",
      reportedBy: "Farhan Iqbal",
      image: "https://via.placeholder.com/150/5733FF",
    },
  ];

  useEffect(() => {
    const calculateItemsPerPage = () => {
      const viewportHeight = window.innerHeight;
      const itemHeight = 200; // Approximate item height
      const padding = 200; // Top and bottom padding
      const items = Math.floor((viewportHeight - padding) / itemHeight);
      setItemsPerPage(items > 0 ? items : 1);
    };

    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);
    return () => window.removeEventListener("resize", calculateItemsPerPage);
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.type === tab &&
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleChat = (user) => {
    alert(`Opening chat with ${user}`);
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
    <div className="h-full bg-gray-100 py-4 px-2">
      <div className="max-w-screen-lg mx-auto bg-white shadow-lg rounded-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
          Lost and Found
        </h2>

        {/* Tabs */}
        <Tabs
          defaultValue="lost"
          onValueChange={(value) => {
            setTab(value);
            setCurrentPage(1);
          }}
        >
          <TabsList className="mb-4 flex flex-wrap justify-center">
            <TabsTrigger value="lost">Lost Items</TabsTrigger>
            <TabsTrigger value="found">Found Items</TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-6 w-full">
            <Input
              placeholder={`Search for ${tab} items...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button className="flex-none">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Tab Content for Lost Items */}
          <TabsContent value="lost">
            {paginatedItems.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-100 p-4 rounded-md shadow-md"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      Reported by: {item.reportedBy}
                    </p>
                    <Button
                      onClick={() => handleChat(item.reportedBy)}
                      className="mt-3 w-full"
                    >
                      Chat with {item.reportedBy}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No items found.</p>
            )}

            {/* Pagination */}
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
          </TabsContent>

          {/* Tab Content for Found Items */}
          <TabsContent value="found">
            {paginatedItems.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-100 p-4 rounded-md shadow-md"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      Reported by: {item.reportedBy}
                    </p>
                    <Button
                      onClick={() => handleChat(item.reportedBy)}
                      className="mt-3 w-full"
                    >
                      Chat with {item.reportedBy}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No items found.</p>
            )}

            {/* Pagination */}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LostAndFound;
