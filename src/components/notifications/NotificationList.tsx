import React from "react";
import { NotificationItem, NotificationItemProps } from "./NotificationItem";
import { AnimatedList } from "@/components/ui/AnimatedList";
import { BellOff } from "lucide-react";

interface NotificationListProps {
  notifications: Omit<NotificationItemProps, 'onAcceptConnection' | 'onRejectConnection'>[];
  onAcceptConnection: (connectionId: string) => Promise<void>;
  onRejectConnection: (connectionId: string) => Promise<void>;
  category?: string;
}

const emptyMessages: Record<string, string> = {
  all: "You're all caught up — no notifications yet.",
  connections: "No connection requests right now.",
  sports: "No sports updates yet.",
  exams: "No exam notifications.",
  events: "No upcoming event alerts.",
  clubs: "No club activity.",
  placements: "No placement updates.",
  celebrations: "Nothing to celebrate… yet!",
};

export const NotificationList = ({
  notifications,
  onAcceptConnection,
  onRejectConnection,
  category = "all",
}: NotificationListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <BellOff className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          {emptyMessages[category] || "No notifications found."}
        </p>
      </div>
    );
  }

  return (
    <AnimatedList className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onAcceptConnection={onAcceptConnection}
          onRejectConnection={onRejectConnection}
        />
      ))}
    </AnimatedList>
  );
};
