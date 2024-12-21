import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

export default function Home() {

const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 to-white rounded-3xl">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Dostluk</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect, share, and build lasting friendships with Dostluk
          </p>
          <Button  onClick={() => navigate("/home/findfriends")} size="lg" className="rounded-full px-8">
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}
