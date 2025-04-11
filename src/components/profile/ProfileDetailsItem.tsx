
import { ReactNode } from "react";

interface ProfileDetailsItemProps {
  icon: ReactNode;
  title: string;
  content: ReactNode;
}

export const ProfileDetailsItem = ({ icon, title, content }: ProfileDetailsItemProps) => {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
      <div className="text-primary mt-1">{icon}</div>
      <div>
        <p className="font-medium dark:text-gray-200">{title}</p>
        {typeof content === 'string' ? (
          <p className="text-sm text-muted-foreground dark:text-gray-400 whitespace-pre-wrap">
            {content}
          </p>
        ) : (
          content
        )}
      </div>
    </div>
  );
};
