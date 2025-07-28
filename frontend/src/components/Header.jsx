import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // --- API Configuration ---
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  // --- Data Fetching ---
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
      setNotifications([]); // Reset on error
    }
  }, [token, BASE_URL]);

  useEffect(() => {
    // Fetch notifications on component mount and then every 30 seconds
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // --- Unread Count Calculation ---
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

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-blue-600 to-emerald-600 text-white flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold whitespace-nowrap">HealthPredict</h1>
      </div>

      <div className="flex items-center space-x-4 flex-shrink-0">
        {/* --- NOTIFICATION BELL --- */}
        <div className="relative">
          <button
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            className="relative text-white text-xl hover:text-blue-200 transition-colors"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* --- NOTIFICATION POPOVER --- */}
          {isPopoverOpen && (
            <div className="absolute top-full right-0 mt-3 w-80 bg-white text-gray-800 rounded-lg shadow-2xl border border-gray-200 z-50">
              <div className="flex justify-between items-center p-3 border-b">
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
                      className={`block p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                        !n.read_by.includes(user.id) ? "bg-blue-50" : ""
                      }`}
                    >
                      <p className="text-sm">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="p-4 text-center text-sm text-gray-500">
                    No notifications yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-sm text-blue-100">Welcome back,</p>
          <p className="font-semibold">{user?.username}</p>
        </div>
        <button
          onClick={logout}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg whitespace-nowrap"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
