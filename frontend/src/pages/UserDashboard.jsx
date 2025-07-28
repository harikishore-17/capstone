import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useGlobalContext } from "../context/GlobalContext";
import { Button } from "../components/ui/button";
import {
  Home as HomeIcon,
  ClipboardList,
  Brain,
  LogOut,
  Moon,
  Sun,
  Bell,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./Home";
import PredictionForm from "./PredictionForm";
import FollowUps from "./FollowUps";

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { loading } = useGlobalContext();
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = user?.token;

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications.");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Notification fetch error:", error);
      setNotifications([]);
    }
  }, [token, BASE_URL]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setDarkMode(isCurrentlyDark);
  }, []);

  const unreadCount = useMemo(() => {
    if (!user?.id || !notifications.length) return 0;
    return notifications.filter((n) => !n.read_by.includes(user.id)).length;
  }, [notifications, user?.id]);

  // --- Mark as Read Logic ---
  const handleMarkAllAsRead = async () => {
    if (!token || unreadCount === 0) return;

    const unreadNotifications = notifications.filter(
      (n) => !n.read_by.includes(user.id)
    );

    const markAsReadPromises = unreadNotifications.map((n) =>
      fetch(`${BASE_URL}/mark-as-read/${n.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    );

    try {
      await Promise.all(markAsReadPromises);
      await fetchNotifications(); // Refresh the list
      setIsPopoverOpen(false); // Close popover after marking as read
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const menuItems = [
    { id: "home", label: "Dashboard", icon: HomeIcon },
    { id: "followups", label: "Follow Ups", icon: ClipboardList },
    { id: "prediction", label: "Risk Prediction", icon: Brain },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case "home":
        return <Home />;
      case "followups":
        return <FollowUps />;
      case "prediction":
        return <PredictionForm />;
      default:
        return <Home />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-2xl border-r border-gray-200 dark:border-gray-700 flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text dark:text-white">
                HealthPredict
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI Analytics
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMenu(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                selectedMenu === item.id
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 mr-3" />
            ) : (
              <Moon className="h-5 w-5 mr-3" />
            )}
            {darkMode ? "Light Mode" : "Dark Mode"}
          </Button>
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {menuItems.find((item) => item.id === selectedMenu)?.label ||
                  "Dashboard"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome to your healthcare analytics platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  onClick={() => setIsPopoverOpen((prev) => !prev)}
                  variant="ghost"
                  size="icon"
                  className="relative text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {isPopoverOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="flex justify-between items-center p-3 border-b dark:border-gray-600">
                      <h3 className="font-semibold">Notifications</h3>
                      <button
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <Link
                            to={n.link || "#"}
                            key={n.id}
                            onClick={() => setIsPopoverOpen(false)}
                            className={`block p-3 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              !n.read_by.includes(user.id)
                                ? "bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </Link>
                        ))
                      ) : (
                        <p className="p-4 text-center text-sm text-gray-500">
                          You're all caught up!
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMenu}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
