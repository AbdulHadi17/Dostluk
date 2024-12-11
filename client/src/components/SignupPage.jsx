import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Input } from "@/components/ui/input.jsx";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios"; // Ensure axios is installed

const SignupPage = () => {
  const [loading, setLoading] = useState(false);

  // Separate state for form data, including department
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "", // Add department directly to the input state (ID)
  });

  const [departments, setDepartments] = useState([]); // State for departments (ensure it starts as an array)
  const navigate = useNavigate(); // Initialize navigate for redirection after successful signup

  useEffect(() => {
    // Fetch departments when the component mounts
    const fetchDepartments = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/department/getdepartments");
        setDepartments(response.data.departments || []); // Ensure it's an array
      } catch (error) {
        toast.error("Failed to load departments");
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if passwords match
    if (input.password !== input.confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    // Find the department ID based on the department name
    const selectedDepartment = departments.find(dept => dept.Department_ID === parseInt(input.department));

    if (!selectedDepartment) {
      toast.error("Please select a valid department.");
      setLoading(false);
      return;
    }

    const payload = {
      ...input, // Spread all form data
      dept_id: selectedDepartment.Department_ID, // Pass the department ID to the backend
    };

    try {
      // Make API request to register the user
      const res = await axios.post("http://localhost:3000/api/v1/user/register", payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Add credentials if necessary
      });


      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/'); // Redirect to login page after successful signup

        // Clear form inputs after successful signup
        setInput({
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
          department: "", // Reset department
        });
      }
    } catch (error) {
      // Handle error from API
      toast.error(error.response?.data?.message || "Something went wrong, please try again.");
    } finally {
      setLoading(false);
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
            {/* Department Combobox (Vanilla Select Dropdown) */}
            <div className="relative">
              <select
                value={input.department}
                onChange={handleChange}
                name="department" // Use name to bind to the input state
                className="pl-10 text-sm sm:text-base bg-slate-800 rounded-md outline-none text-gray-100 border-2 border-slate-600 w-full py-2"
                required
              >
                <option value="" disabled>Select Department</option>
                {departments && departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept.Department_ID} value={dept.Department_ID}>
                      {dept.Name}
                    </option>
                  ))
                ) : (
                  <option>No departments available</option>
                )}
              </select>
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

            <Link to={"/"}>
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
