import { Bell, Home, MessageSquare, Search, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary">
              PCCOE Connect
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary flex items-center gap-2">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/messages" className="text-gray-600 hover:text-primary flex items-center gap-2">
              <MessageSquare size={20} />
              <span>Messages</span>
            </Link>
            <Link to="/notifications" className="text-gray-600 hover:text-primary flex items-center gap-2">
              <Bell size={20} />
              <span>Notifications</span>
            </Link>
            <Link to="/profile" className="text-gray-600 hover:text-primary flex items-center gap-2">
              <User size={20} />
              <span>Profile</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};