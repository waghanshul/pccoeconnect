import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Bell, LogOut, Menu, X, MessageSquare, Home, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Custom hook to detect mobile view
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  return isMobile;
};
export const Navigation = () => {
  const {
    signOut: logout,
    user
  } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const isMobile = useIsMobile();
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  useEffect(() => {
    if (user) {
      fetchNotificationCount();

      // Setup realtime subscription for notifications
      const channel = supabase.channel('navigation-notifications').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'connections_v2'
      }, () => {
        fetchNotificationCount();
      }).on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => {
        fetchNotificationCount();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  const fetchNotificationCount = async () => {
    if (!user) return;
    try {
      // Count pending connection requests
      const {
        count: connectionCount,
        error: connectionError
      } = await supabase.from('connections_v2').select('id', {
        count: 'exact',
        head: true
      }).eq('receiver_id', user.id).eq('status', 'pending');
      if (connectionError) throw connectionError;

      // Count regular notifications (if applicable)
      const {
        count: notificationsCount,
        error: notificationsError
      } = await supabase.from('notifications').select('id', {
        count: 'exact',
        head: true
      });
      if (notificationsError) throw notificationsError;
      const totalCount = (connectionCount || 0) + (notificationsCount || 0);
      setNotificationCount(totalCount);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };
  const handleLogout = async () => {
    await logout();
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return <nav className="fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-800 z-50">
      <div className="container max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        <Link to="/home" className="flex items-center space-x-2">
          <Logo />
          
        </Link>

        {isMobile && <button onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>}

        <div className="hidden md:flex items-center space-x-4">
          {user ? <div className="flex items-center space-x-4">
              <Link to="/profile">
                
              </Link>
              <Button variant="ghost" className="flex items-center space-x-2 text-white" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            </div> : <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>}
        </div>
      </div>
      
      <div className={`absolute top-full left-0 w-full bg-gray-900 border-b border-gray-800 p-4 md:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-y-0" : "-translate-y-full"} z-50`}>
        <div className="flex flex-col space-y-4">
          <Link to="/home" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPath === "/home" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`} onClick={() => setIsMenuOpen(false)}>
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link to="/connections" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPath === "/connections" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`} onClick={() => setIsMenuOpen(false)}>
            <Users size={20} />
            <span>Connections</span>
          </Link>
          <Link to="/messages" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPath === "/messages" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`} onClick={() => setIsMenuOpen(false)}>
            <MessageSquare size={20} />
            <span>Messages</span>
          </Link>
          <Link to="/notifications" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPath === "/notifications" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`} onClick={() => setIsMenuOpen(false)}>
            <div className="relative">
              <Bell size={20} />
              {notificationCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                  {notificationCount}
                </Badge>}
            </div>
            <span>Notifications</span>
          </Link>
          <Link to="/profile" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPath === "/profile" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`} onClick={() => setIsMenuOpen(false)}>
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/settings" className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentPath === "/settings" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`} onClick={() => setIsMenuOpen(false)}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <Button variant="ghost" className="flex items-center space-x-2 px-4 py-2 w-full justify-start text-white" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      <div className="hidden md:flex justify-center space-x-1 py-2">
        <Link to="/home" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${currentPath === "/home" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`}>
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link to="/connections" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${currentPath === "/connections" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`}>
          <Users size={18} />
          <span>Connections</span>
        </Link>
        <Link to="/messages" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${currentPath === "/messages" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`}>
          <MessageSquare size={18} />
          <span>Messages</span>
        </Link>
        <Link to="/notifications" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${currentPath === "/notifications" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`}>
          <div className="relative">
            <Bell size={18} />
            {notificationCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                {notificationCount}
              </Badge>}
          </div>
          <span>Notifications</span>
        </Link>
        <Link to="/profile" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${currentPath === "/profile" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`}>
          <User size={18} />
          <span>Profile</span>
        </Link>
        <Link to="/settings" className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${currentPath === "/settings" ? "bg-gray-800 text-primary" : "hover:bg-gray-800"}`}>
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </nav>;
};