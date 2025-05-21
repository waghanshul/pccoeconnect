
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
  
  // Function to group notifications by category
  const getNotificationsByCategory = (category: string) => {
    return notifications.filter(
      (notif) => notif.isConnectionRequest || notif.title?.toLowerCase() === category.toLowerCase()
    );
  };
  
  return (
    <Tabs defaultValue="connections" className="w-full">
      <TabsList className="w-full justify-start mb-8 overflow-x-auto bg-white dark:bg-gray-800">
        {categories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
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
