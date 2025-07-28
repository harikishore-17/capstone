import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Bell,
  Moon,
  Sun,
  Home as HomeIcon,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "../components/ui/button";

// Import pages
import AdminHome from "./AdminHome";
import AllPatients from "./AllPatients";

const AdminDashboard = () => {
  useEffect(() => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setDarkMode(isCurrentlyDark);
  }, []);
  const { user, logout } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState("home");
  const [darkMode, setDarkMode] = useState(false);

  // --- Notification Logic ---
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
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
  // --- End Notification Logic ---

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "home":
        return <AdminHome />;
      case "patients":
        return <AllPatients />;
      default:
        return <AdminHome />;
    }
  };

  const sidebarItems = [
    {
      id: "home",
      label: "Admin Overview",
      icon: HomeIcon,
      color: "text-red-500",
    },
    {
      id: "patients",
      label: "Manage Patients",
      icon: User,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-500">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text dark:text-white">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  System Administrator
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 dark:text-white" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.button>

              <div className="relative">
                <Button
                  onClick={() => setIsPopoverOpen((prev) => !prev)}
                  variant="outline"
                  size="icon"
                  className="relative"
                >
                  <Bell className="h-5 w-5 dark:text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
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

              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-600 dark:text-white dark:hover:border-red-500"
              >
                <LogOut className="h-4 w-4 mr-2 dark:text-white" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="flex">
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-72 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-80px)] sticky top-[80px]"
        >
          <nav className="p-6 space-y-3">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMenu(item.id)}
                className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                  selectedMenu === item.id
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon
                  className={`h-6 w-6 ${
                    selectedMenu === item.id ? "text-white" : item.color
                  }`}
                />
                <span className="font-semibold">{item.label}</span>
                {selectedMenu === item.id && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </nav>
        </motion.aside>

        <main className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMenu}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
