import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Home, Users, MessageSquare, Bell, User, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/connections", icon: Users, label: "Connections" },
  { to: "/messages", icon: MessageSquare, label: "Messages" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const AppSidebar = () => {
  const { signOut: logout, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const channel = supabase
        .channel("sidebar-notifications")
        .on("postgres_changes", { event: "*", schema: "public", table: "connections_v2" }, () => fetchNotificationCount())
        .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotificationCount())
        .on("postgres_changes", { event: "*", schema: "public", table: "notification_reads" }, () => fetchNotificationCount())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchNotificationCount = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("get_unread_notification_count", { user_uuid: user.id });
      if (error) throw error;
      setNotificationCount((data as any)?.total || 0);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] border-r border-border bg-background z-50">
      {/* Logo */}
      <div className="px-5 py-5">
        <Link to="/home">
          <Logo />
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navLinks.map(({ to, icon: Icon, label }) => {
          const isActive = currentPath === to || currentPath.startsWith(to + "/");
          const badge = to === "/notifications" && notificationCount > 0 ? notificationCount : null;

          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {badge && (
                  <span className="absolute -top-1.5 -right-2 bg-destructive text-destructive-foreground rounded-full text-[9px] min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      {user && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
