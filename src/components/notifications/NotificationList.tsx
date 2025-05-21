
import React from "react";
import { NotificationItem, NotificationItemProps } from "./NotificationItem";

interface NotificationListProps {
  notifications: Omit<NotificationItemProps, 'onAcceptConnection' | 'onRejectConnection'>[];
  onAcceptConnection: (connectionId: string) => Promise<void>;
  onRejectConnection: (connectionId: string) => Promise<void>;
}

export const NotificationList = ({
  notifications,
  onAcceptConnection,
  onRejectConnection,
}: NotificationListProps) => {
  return (
    <div className="space-y-4">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onAcceptConnection={onAcceptConnection}
            onRejectConnection={onRejectConnection}
          />
        ))
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
          <p className="text-gray-600 dark:text-gray-300">No notifications found</p>
        </div>
      )}
    </div>
  );
};
