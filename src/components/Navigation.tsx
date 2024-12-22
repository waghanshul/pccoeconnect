import { Bell, Home, MessageSquare, Search, User, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useEffect, useState } from "react";
import { Toggle } from "./ui/toggle";

export const Navigation = () => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    document.documentElement.classList.toggle("dark");
  };

  const getActiveStyles = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-primary border-b-2 border-primary"
      : "text-gray-600 dark:text-gray-300 hover:text-primary";
  };

  const getTabName = () => {
    switch (location.pathname) {
      case "/":
        return "Home";
      case "/messages":
        return "Messages";
      case "/notifications":
        return "Notifications";
      case "/profile":
        return "Profile";
      default:
        return "";
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`flex items-center gap-2 transition-colors duration-200 pb-1 ${getActiveStyles('/')}`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link 
              to="/messages" 
              className={`flex items-center gap-2 transition-colors duration-200 pb-1 ${getActiveStyles('/messages')}`}
            >
              <MessageSquare size={20} />
              <span>Messages</span>
            </Link>
            <Link 
              to="/notifications" 
              className={`flex items-center gap-2 transition-colors duration-200 pb-1 ${getActiveStyles('/notifications')}`}
            >
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center gap-2 transition-colors duration-200 pb-1 ${getActiveStyles('/profile')}`}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-white dark:bg-gray-800 dark:text-gray-200"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Toggle
              variant="outline"
              size="sm"
              pressed={darkMode}
              onPressedChange={toggleDarkMode}
              className="ml-2"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Toggle>
          </div>
        </div>
        <div className="text-center py-2 font-semibold text-primary">
          {getTabName()}
        </div>
      </div>
    </nav>
  );
};