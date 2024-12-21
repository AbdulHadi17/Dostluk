'use client'

import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { AlertCircle } from 'lucide-react';
import axios from 'axios'; // Ensure axios is installed
import { toast } from "sonner"; // For showing notifications

const NotFound = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/v1/user/logout", {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success(response.data.message);
        navigate("/"); // Navigate to home after successful logout
      }
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to log out. Try again.");
      navigate("/"); // Still navigate to home even if logout fails
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
        >
          <AlertCircle className="mx-auto h-24 w-24 text-red-500" />
        </motion.div>
        
        <motion.h1 
          className="mt-8 text-6xl font-bold text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          404
        </motion.h1>
        
        <motion.p 
          className="mt-4 text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Oops! Page Not Found
        </motion.p>
        
        <motion.p 
          className="mt-2 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Button 
            onClick={handleLogout} // Trigger logout function
            className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Go Back Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
