import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { Plus } from "lucide-react";
import Cookies from "universal-cookie";


const Layout = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  
  const cookies = new Cookies();
  const profilePicture = cookies.get("profilePicture");
  // Close the sidebar on screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isSidebarVisible={isSidebarVisible}
        setIsSidebarVisible={setIsSidebarVisible}
        profilePicture={profilePicture}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gray-100">
        {/* Header */}
        <header className="bg-[#333333] text-[#FCFAF9] w-full flex justify-between items-center px-6 py-3 border-b">
          <h1 className="text-lg font-bold">Dostluk</h1>

          {/* Plus Button (Visible only on small screens) */}
          <button
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="md:hidden p-2 rounded-lg transition"
          >
            <Plus className="w-6 h-6" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 h-0 overflow-hidden">
          <div className=" overflow-y-auto p-0 md:p-6 h-[100%]">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
