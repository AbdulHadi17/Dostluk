import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { FiMail, FiLock } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {

  const navigate = useNavigate();

  const [loading, setloading] = useState(false);
  const [input, setinput] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");  // State to handle error messages

  const handleChange = (e) => {
    setinput({ ...input, [e.target.name]: e.target.value });
  };

  const submitform = async (e) => {
    setloading(true);
    e.preventDefault();
  
    try {
      const res = await axios.post("http://localhost:3000/api/v1/user/login", input, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setError("");  // Clear any previous error messages
        navigate('/home');
        setinput({
          email: "",
          password: "",
        });
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong, please try again later.");
      setError(error.response?.data?.message || "Something went wrong, please try again later.");
    } finally {
      setloading(false);
    }
  };
  
  return (
    <div
      style={{ backgroundColor: "#040F0F" }}
      className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-100"
    >
      <Card
        style={{ backgroundColor: "#ECEBF3" }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg py-5"
      >
        <CardHeader>
          <CardTitle className="text-center text-lg sm:text-xl lg:text-2xl">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitform} className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={input.email}
                onChange={handleChange}
                type="email"
                name="email"
                placeholder="Email"
                className="pl-10 text-sm sm:text-base"
                required
              />
            </div>
            {/* Password Input */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={input.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                name="password"
                className="pl-10 text-sm sm:text-base"
                required
              />
            </div>
                       {/* Submit Button */}
            {loading ? (
              <Button
                disabled={true}
                type="submit"
                className="w-full flex items-center justify-center bg-gray-500"
              >
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Please Wait...
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            )}
            <Link to={"/signup"}>
              <p className="text-sm sm:text-md text-center mt-3 cursor-pointer hover:underline underline-offset-4">
                Don't have an account?{" "}
                <span className="text-purple-700">Signup</span>
              </p>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
