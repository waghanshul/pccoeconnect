import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, MessageSquare, Bell, User } from "lucide-react";

const tabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/connections", icon: Users, label: "Connect" },
  { to: "/messages", icon: MessageSquare, label: "Chat" },
  { to: "/notifications", icon: Bell, label: "Alerts" },
  { to: "/profile", icon: User, label: "Profile" },
];

interface BottomTabBarProps {
  notificationCount?: number;
}

export const BottomTabBar = ({ notificationCount = 0 }: BottomTabBarProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-xl border-t border-white/[0.06] px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {tabs.map(({ to, icon: Icon, label }) => {
            const isActive = currentPath === to || currentPath.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomTabIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
                <div className="relative">
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  {to === "/notifications" && notificationCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
