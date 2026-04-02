import { ReactNode, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { Logo } from "@/components/Logo";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/ui/PageTransition";

interface AppLayoutProps {
  children: ReactNode;
  /** If true, content takes full width with no max-w constraint */
  fullWidth?: boolean;
  /** Custom max width class, defaults to max-w-2xl */
  maxWidth?: string;
  /** If true, skip the PageTransition wrapper */
  noTransition?: boolean;
  /** Additional classes on the content container */
  className?: string;
}

export const AppLayout = ({
  children,
  fullWidth = false,
  maxWidth = "max-w-2xl",
  noTransition = false,
  className = "",
}: AppLayoutProps) => {
  const { signOut: logout, user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotificationCount();
      const channel = supabase
        .channel("layout-notifications")
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

  const content = (
    <div className={`${fullWidth ? "w-full" : `w-full mx-auto ${maxWidth}`} ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <AppSidebar />

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50 md:hidden">
        <div className="flex items-center justify-between px-4 h-12">
          <Link to="/home">
            <Logo />
          </Link>
          <button
            onClick={() => logout()}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <main className="md:ml-[240px] pt-14 md:pt-0 pb-20 md:pb-6 px-4 md:px-6">
        {noTransition ? content : <PageTransition>{content}</PageTransition>}
      </main>

      {/* Mobile bottom tab bar */}
      <BottomTabBar notificationCount={notificationCount} />
    </div>
  );
};
