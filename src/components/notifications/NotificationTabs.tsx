
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "./NotificationList";
import { NotificationItemProps } from "./NotificationItem";

interface NotificationTabsProps {
  notifications: Omit<NotificationItemProps, 'onAcceptConnection' | 'onRejectConnection'>[];
  onAcceptConnection: (connectionId: string) => Promise<void>;
  onRejectConnection: (connectionId: string) => Promise<void>;
}

export const NotificationTabs = ({
  notifications,
  onAcceptConnection,
  onRejectConnection,
}: NotificationTabsProps) => {
  const categories = [
    "connections",
    "sports",
    "exams",
    "events",
    "clubs",
    "placements",
    "celebrations",
  ];
  
  const getNotificationsByCategory = (category: string) => {
    if (category === "connections") {
      return notifications.filter((notif) => notif.isConnectionRequest);
    }
    return notifications.filter(
      (notif) => !notif.isConnectionRequest && notif.category?.toLowerCase() === category.toLowerCase()
    );
  };
  
  return (
    <Tabs defaultValue="connections" className="w-full">
      <TabsList className="w-full justify-start mb-6 overflow-x-auto bg-muted/50 p-1 rounded-xl">
        {categories.map((category) => (
          <TabsTrigger 
            key={category} 
            value={category}
            className="rounded-lg text-xs capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category} value={category}>
          <NotificationList
            notifications={getNotificationsByCategory(category)}
            onAcceptConnection={onAcceptConnection}
            onRejectConnection={onRejectConnection}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};
