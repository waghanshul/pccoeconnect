
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface NotificationPreferencesProps {
  notifications: {
    email: boolean;
    browser: boolean;
    app: boolean;
  };
  setNotifications: React.Dispatch<React.SetStateAction<{
    email: boolean;
    browser: boolean;
    app: boolean;
  }>>;
}

export const NotificationPreferencesSection = ({ 
  notifications, 
  setNotifications 
}: NotificationPreferencesProps) => {
  
  const handleNotificationChange = (value: boolean, type: string) => {
    setNotifications({
      ...notifications,
      [type]: value,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between max-w-md">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
          </div>
          <Switch 
            checked={notifications.email} 
            onCheckedChange={(value) => handleNotificationChange(value, "email")} 
          />
        </div>
        <div className="flex items-center justify-between max-w-md">
          <div>
            <p className="font-medium">Browser Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications in browser</p>
          </div>
          <Switch 
            checked={notifications.browser} 
            onCheckedChange={(value) => handleNotificationChange(value, "browser")} 
          />
        </div>
        <div className="flex items-center justify-between max-w-md">
          <div>
            <p className="font-medium">Mobile App Notifications</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications on mobile app</p>
          </div>
          <Switch 
            checked={notifications.app} 
            onCheckedChange={(value) => handleNotificationChange(value, "app")} 
          />
        </div>
        <Button>Save Notification Preferences</Button>
      </div>
    </div>
  );
};
