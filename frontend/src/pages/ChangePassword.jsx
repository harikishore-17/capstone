import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { KeyRound, Lock, Unlock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ChangePassword = () => {
  const { user, logout } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/auth/changePassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update password.");
      }

      setSuccess("Password updated successfully! You will be logged out. Please log in again with your new password.");
      setTimeout(() => {
        logout(); // Log out the user
        navigate("/login"); // Redirect to login page
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg">
          <CardHeader className="space-y-4 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
              className="mx-auto p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl w-fit"
            >
              <KeyRound className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold gradient-text">Change Your Password</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
              As a new user, you must update the temporary password provided by your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Current Password
                </label>
                <Input
                  type="password"
                  name="oldPassword"
                  onChange={handleChange}
                  required
                  className="h-12 text-base border-2 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  New Password
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  onChange={handleChange}
                  required
                  className="h-12 text-base border-2 focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm text-center">
                  {success}
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <Unlock className="h-5 w-5 mr-2" />
                Update Password
              </Button>
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full h-12 text-lg bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChangePassword;


