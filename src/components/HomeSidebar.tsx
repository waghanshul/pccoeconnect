import { Home, MessageSquare, User, Bookmark, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const HomeSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, path: "/home", label: "Home" },
    { icon: MessageSquare, path: "/messages", label: "Messages" },
    { icon: User, path: "/profile", label: "Profile" },
    { icon: Bookmark, path: "/saved", label: "Saved" },
    { icon: Settings, path: "/settings", label: "Settings" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 space-y-8">
      <div className="w-10 h-10">
        <img src="/lovable-uploads/ba5bc064-b28d-4065-b1d2-07e7acc789f9.png" alt="Logo" className="w-full h-full object-cover" />
      </div>
      
      <nav className="flex flex-col space-y-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-2 rounded-lg transition-colors duration-200 group ${
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
};