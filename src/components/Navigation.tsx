
import {
  Home,
  Book,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Users
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/context/ThemeContext";

const navigationItems = [
  {
    name: "Home",
    to: "/",
    icon: <Home className="h-5 w-5" />,
    activeIcon: <Home className="h-5 w-5 text-primary" />,
  },
  {
    name: "Courses",
    to: "/courses",
    icon: <Book className="h-5 w-5" />,
    activeIcon: <Book className="h-5 w-5 text-primary" />,
  },
  {
    name: "Profile",
    to: "/profile",
    icon: <User className="h-5 w-5" />,
    activeIcon: <User className="h-5 w-5 text-primary" />,
  },
  {
    name: "Settings",
    to: "/settings",
    icon: <Settings className="h-5 w-5" />,
    activeIcon: <Settings className="h-5 w-5 text-primary" />,
  },
  {
    name: "Connections",
    to: "/connections",
    icon: <Users className="h-5 w-5" />,
    activeIcon: <Users className="h-5 w-5 text-primary" />,
  },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow fixed top-0 left-0 w-full z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-primary font-bold text-xl">
                CampusConnect
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 ${
                      location.pathname === item.to
                        ? "bg-gray-100 dark:bg-gray-800 text-primary"
                        : ""
                    }`}
                  >
                    {location.pathname === item.to
                      ? item.activeIcon
                      : item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isMounted && (
                <Switch
                  id="theme"
                  checked={theme === "dark"}
                  onCheckedChange={() => toggleTheme()}
                />
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-2 rounded-md text-sm font-medium ml-4 flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
