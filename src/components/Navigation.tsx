import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Bell, LogOut, Menu, X, MessageSquare, Home, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const { signOut: logout, user } = useAuth();
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
      const channel = supabase.channel('navigation-notifications').on('postgres_changes', {
        event: '*', schema: 'public', table: 'connections_v2'
      }, () => {
        fetchNotificationCount();
      }).on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications'
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
      const { count: connectionCount, error: connectionError } = await supabase
        .from('connections_v2').select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id).eq('status', 'pending');
      if (connectionError) throw connectionError;

      const { count: notificationsCount, error: notificationsError } = await supabase
        .from('notifications').select('id', { count: 'exact', head: true });
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

  const navLinks = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/connections", icon: Users, label: "Connections" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: notificationCount },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-background/70 backdrop-blur-xl border-b border-white/[0.06] z-50">
      <div className="container max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center space-x-2">
          <Logo />
        </Link>

        {isMobile && (
          <button onClick={toggleMenu} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`absolute top-full left-0 w-full glass-card border-t-0 rounded-t-none p-3 md:hidden transition-all duration-300 ease-in-out z-50 ${isMenuOpen ? "block opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"}`}>
        <div className="flex flex-col space-y-1">
          {navLinks.map(({ to, icon: Icon, label, badge }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentPath === to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="relative">
                <Icon size={18} />
                {badge && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-medium animate-pulse-glow">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
          <Button 
            variant="ghost" 
            className="flex items-center gap-3 px-4 py-2.5 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex justify-center gap-1 pb-2 px-4">
        {navLinks.map(({ to, icon: Icon, label, badge }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPath === to
                ? "bg-primary/10 text-primary glow-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon size={16} />
              {badge && badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-medium animate-pulse-glow">
                  {badge}
                </span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
