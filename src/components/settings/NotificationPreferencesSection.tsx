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
  return <div className="space-y-4">
      
      
    </div>;
};