import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const SignupPage = () => {
  const [loading, setLoading] = useState(false);

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const { username, email, password, confirmPassword } = input;

      
      // Check for password match
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
      } 
      else {
        alert(`Username: ${username}\nEmail: ${email}\nPassword: ${password}`);
      }

      setLoading(false);
      setInput({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }, 2000);
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
            Signup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitForm} className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={input.username}
                onChange={handleChange}
                type="text"
                name="username"
                placeholder="Username"
                className="pl-10 text-sm sm:text-base"
                required
              />
            </div>
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
                name="password"
                placeholder="Password"
                className="pl-10 text-sm sm:text-base"
                required
              />
            </div>
            {/* Confirm Password Input */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={input.confirmPassword}
                onChange={handleChange}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="pl-10 text-sm sm:text-base"
                required
              />
            </div>
            {/* Submit Button */}
            {loading ? (
              <Button
                disabled
                type="submit"
                className="w-full flex items-center justify-center bg-gray-500"
              >
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Please Wait...
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            )}
            <Link to={"/login"}>
              <p className="text-sm sm:text-md text-center mt-3 cursor-pointer hover:underline underline-offset-4">
                Already have an account?{" "}
                <span className="text-purple-700">Login</span>
              </p>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
