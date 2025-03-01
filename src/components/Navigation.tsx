
import { Bell, Home, MessageSquare, Search, User, LogOut, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useToast } from "@/components/ui/use-toast";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    navigate("/");
  };

  const getActiveStyles = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "text-primary border-b-2 border-primary"
      : "text-gray-600 dark:text-gray-300 hover:text-primary";
  };

  return (
    <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/home" className="flex items-center">
            <Logo />
          </Link>
          
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
            <div className="relative">
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
      </div>
    </nav>
  );
};
