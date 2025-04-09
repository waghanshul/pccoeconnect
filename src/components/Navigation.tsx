
import { Bell, Home, MessageSquare, Search, User, LogOut, Settings, Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast("Logged out successfully", {
      description: "See you soon!",
    });
  };

  const getActiveStyles = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-primary border-b-2 border-primary"
      : "text-gray-600 dark:text-gray-300 hover:text-primary";
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center">
            <Logo />
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/home" 
              className={`flex items-center gap-2 transition-colors duration-200 pb-1 ${getActiveStyles('/home')}`}
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
            <Link 
              to="/settings" 
              className={`flex items-center gap-2 transition-colors duration-200 pb-1 ${getActiveStyles('/settings')}`}
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-gray-300 hover:text-primary"
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </button>
            
            {/* Search and Logout for all screens */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-800 text-gray-200"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-300 hover:text-primary"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 py-2 px-4 rounded-b-lg">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/home" 
                className={`flex items-center gap-2 p-2 rounded-md ${location.pathname === '/home' ? 'bg-gray-700 text-primary' : 'text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link 
                to="/messages" 
                className={`flex items-center gap-2 p-2 rounded-md ${location.pathname === '/messages' ? 'bg-gray-700 text-primary' : 'text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare size={20} />
                <span>Messages</span>
              </Link>
              <Link 
                to="/notifications" 
                className={`flex items-center gap-2 p-2 rounded-md ${location.pathname === '/notifications' ? 'bg-gray-700 text-primary' : 'text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell size={20} />
                <span>Notifications</span>
              </Link>
              <Link 
                to="/profile" 
                className={`flex items-center gap-2 p-2 rounded-md ${location.pathname === '/profile' ? 'bg-gray-700 text-primary' : 'text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
              <Link 
                to="/settings" 
                className={`flex items-center gap-2 p-2 rounded-md ${location.pathname === '/settings' ? 'bg-gray-700 text-primary' : 'text-gray-300'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>
              
              {/* Mobile search */}
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-gray-800 text-gray-200"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
