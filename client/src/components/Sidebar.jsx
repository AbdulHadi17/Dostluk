import React from "react";
import { User, Search, MessageCircle, LogOut, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DostlukLogo from "@/assets/dostluksvg.svg"; // Path to the logo

const Sidebar = ({ isSidebarVisible, setIsSidebarVisible }) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`fixed md:relative top-0 left-0 z-50 md:z-0 h-full w-[300px] bg-[#333333] text-[#FCFAF9] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out 
        ${isSidebarVisible ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shadow-lg`}
    >
      {/* Close Button for Small Screens */}
      <button
        onClick={() => setIsSidebarVisible(false)}
        className="absolute top-4 right-4 md:hidden py-1 px-2 hover:scale-125 cursor-pointer text-white rounded-full transition"
      >
        ✕
      </button>

      {/* Top Section */}
      <div>
        {/* App Logo */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-full h-24 rounded-lg flex justify-center items-center overflow-hidden">
            <img src={DostlukLogo} alt="Dostluk Logo" className="w-[12rem]" />
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-700 my-4" />

        {/* User Profile */}
        <div
          onClick={() => navigate("/home/userprofile")}
          className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-[#48E5C2] hover:text-[#333333] transition"
        >
          <div className="w-12 h-12 bg-[#FCFAF9] text-[#333333] rounded-full flex justify-center items-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">You</p>
            <p className="text-sm text-gray-400">View Profile</p>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-700 my-4" />

        {/* Navigation Options */}
        <nav className="space-y-4">
          {/* Lost and Found */}
          <div
            onClick={() => navigate("/home/lostandfound")}
            className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-[#48E5C2] hover:text-[#333333] transition"
          >
            <Box className="w-6 h-6" />
            <span className="font-semibold">Lost & Found</span>
          </div>

          {/* Find Friends */}
          <div
            onClick={() => navigate("/home/findfriends")}
            className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-[#48E5C2] hover:text-[#333333] transition"
          >
            <Search className="w-6 h-6" />
            <span className="font-semibold">Find Friends</span>
          </div>

          {/* Chat */}
          <div
            onClick={() => navigate("/home/chat")}
            className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-[#48E5C2] hover:text-[#333333] transition"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="font-semibold">Chat</span>
          </div>
        </nav>
      </div>

      {/* Footer Section */}
      <div>
        {/* Separator */}
        <div className="border-t border-gray-700 my-4" />

        {/* Logout */}
        <div
          onClick={() => {
            console.log("Logout clicked");
            navigate("/login");
          }}
          className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-[#48E5C2] hover:text-[#333333] transition"
        >
          <LogOut className="w-6 h-6" />
          <span className="font-semibold">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;