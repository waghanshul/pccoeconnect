import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Settings, Bell, LogOut, MessageSquare, Home, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { motion } from "framer-motion";

export const Navigation = () => {
  const { signOut: logout, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [notificationCount, setNotificationCount] = useState(0);

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

  const navLinks = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/connections", icon: Users, label: "Connections" },
    { to: "/messages", icon: MessageSquare, label: "Messages" },
    { to: "/notifications", icon: Bell, label: "Notifications", badge: notificationCount },
    { to: "/profile", icon: User, label: "Profile" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <>
      {/* Desktop top bar — single row */}
      <nav className="fixed top-0 left-0 w-full bg-background/70 backdrop-blur-xl border-b border-white/[0.06] z-50 hidden md:block">
        <div className="container max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/home" className="flex items-center space-x-2">
            <Logo />
          </Link>

          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              {navLinks.map(({ to, icon: Icon, label, badge }) => {
                const isActive = currentPath === to || currentPath.startsWith(to + "/");
                return (
                  <Tooltip key={to}>
                    <TooltipTrigger asChild>
                      <Link
                        to={to}
                        className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="desktopNavIndicator"
                            className="absolute inset-0 bg-primary/10 rounded-xl"
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
                        <div className="relative z-10">
                          <Icon size={18} />
                          {badge && badge > 0 && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                              {badge > 99 ? "99+" : badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>

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
      </nav>

      {/* Mobile bottom tab bar */}
      <BottomTabBar notificationCount={notificationCount} />

      {/* Mobile top bar — minimal, logo only */}
      <div className="fixed top-0 left-0 w-full bg-background/70 backdrop-blur-xl border-b border-white/[0.06] z-50 md:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <Link to="/home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/settings" className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Settings size={18} />
            </Link>
            <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
