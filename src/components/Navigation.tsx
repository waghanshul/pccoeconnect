import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobile } from "@/hooks/use-mobile";
import {
  User,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Home,
  Users
} from "lucide-react";

export const Navigation = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="container max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center space-x-2">
          <Logo />
          <span className="font-bold">CampusConnect</span>
        </Link>

        {isMobile && (
          <button onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url as string} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className={`absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 md:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="flex flex-col space-y-4">
          <Link
            to="/home"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentPath === "/home"
                ? "bg-gray-100 dark:bg-gray-800 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link
            to="/connections"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentPath === "/connections"
                ? "bg-gray-100 dark:bg-gray-800 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Users size={20} />
            <span>Connections</span>
          </Link>
          <Link
            to="/messages"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentPath === "/messages"
                ? "bg-gray-100 dark:bg-gray-800 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
          <Link
            to="/notifications"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentPath === "/notifications"
                ? "bg-gray-100 dark:bg-gray-800 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </Link>
          <Link
            to="/profile"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentPath === "/profile"
                ? "bg-gray-100 dark:bg-gray-800 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentPath === "/settings"
                ? "bg-gray-100 dark:bg-gray-800 text-primary"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 px-4 py-2 w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <div className="hidden md:flex justify-center space-x-1 pb-1">
        <Link
          to="/home"
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
            currentPath === "/home"
              ? "bg-gray-100 dark:bg-gray-800 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link
          to="/connections"
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
            currentPath === "/connections"
              ? "bg-gray-100 dark:bg-gray-800 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Users size={18} />
          <span>Connections</span>
        </Link>
        <Link
          to="/messages"
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
            currentPath === "/messages"
              ? "bg-gray-100 dark:bg-gray-800 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <MessageSquare size={18} />
          <span>Messages</span>
        </Link>
        <Link
          to="/notifications"
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
            currentPath === "/notifications"
              ? "bg-gray-100 dark:bg-gray-800 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Bell size={18} />
          <span>Notifications</span>
        </Link>
        <Link
          to="/profile"
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
            currentPath === "/profile"
              ? "bg-gray-100 dark:bg-gray-800 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <User size={18} />
          <span>Profile</span>
        </Link>
        <Link
          to="/settings"
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
            currentPath === "/settings"
              ? "bg-gray-100 dark:bg-gray-800 text-primary"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </nav>
  );
};
