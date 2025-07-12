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
      [type]: value
    });
  };
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notification Preferences</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Email notifications</span>
          <Switch
            checked={notifications.email}
            onCheckedChange={(value) => handleNotificationChange(value, 'email')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Browser notifications</span>
          <Switch
            checked={notifications.browser}
            onCheckedChange={(value) => handleNotificationChange(value, 'browser')}
          />
        </div>
        <div className="flex items-center justify-between">
          <span>App notifications</span>
          <Switch
            checked={notifications.app}
            onCheckedChange={(value) => handleNotificationChange(value, 'app')}
          />
        </div>
      </div>
    </div>
  );
};