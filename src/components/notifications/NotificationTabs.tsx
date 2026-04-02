
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "./NotificationList";
import { NotificationItemProps } from "./NotificationItem";
import {
  Bell,
  UserPlus,
  Trophy,
  GraduationCap,
  Calendar,
  Users,
  Briefcase,
  PartyPopper,
} from "lucide-react";

interface NotificationTabsProps {
  notifications: Omit<NotificationItemProps, 'onAcceptConnection' | 'onRejectConnection'>[];
  onAcceptConnection: (connectionId: string) => Promise<void>;
  onRejectConnection: (connectionId: string) => Promise<void>;
  readNotificationIds?: Set<string>;
}

const categoryConfig = [
  { key: "all", label: "All", icon: Bell },
  { key: "connections", label: "Connections", icon: UserPlus },
  { key: "sports", label: "Sports", icon: Trophy },
  { key: "exams", label: "Exams", icon: GraduationCap },
  { key: "events", label: "Events", icon: Calendar },
  { key: "clubs", label: "Clubs", icon: Users },
  { key: "placements", label: "Placements", icon: Briefcase },
  { key: "celebrations", label: "Celebrations", icon: PartyPopper },
];

export const NotificationTabs = ({
  notifications,
  onAcceptConnection,
  onRejectConnection,
  readNotificationIds = new Set(),
}: NotificationTabsProps) => {

  const getNotificationsByCategory = (category: string) => {
    if (category === "all") return notifications;
    if (category === "connections") {
      return notifications.filter((notif) => notif.isConnectionRequest);
    }
    return notifications.filter(
      (notif) => !notif.isConnectionRequest && notif.category?.toLowerCase() === category.toLowerCase()
    );
  };

  const getCount = (category: string) => getNotificationsByCategory(category).length;

  return (
    <Tabs defaultValue="all" className="w-full">
      <div>
        <TabsList className="flex flex-wrap gap-1 mb-6 bg-muted/50 p-1.5 rounded-xl h-auto w-full">
          {categoryConfig.map(({ key, label, icon: Icon }) => {
            const count = getCount(key);
            return (
              <TabsTrigger
                key={key}
                value={key}
                className="rounded-lg text-xs gap-1.5 px-3 py-1.5 capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-primary/15 text-[10px] font-semibold px-1 data-[state=active]:bg-primary-foreground/20">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      {categoryConfig.map(({ key }) => (
        <TabsContent key={key} value={key}>
          <NotificationList
            notifications={getNotificationsByCategory(key)}
            onAcceptConnection={onAcceptConnection}
            onRejectConnection={onRejectConnection}
            category={key}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};
