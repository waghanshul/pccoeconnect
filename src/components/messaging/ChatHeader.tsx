
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  receiverProfile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

const ChatHeader = ({ receiverProfile }: ChatHeaderProps) => {
  return (
    <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={receiverProfile?.avatar_url || undefined} />
        <AvatarFallback>
          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-semibold dark:text-white">{receiverProfile?.full_name || 'Loading...'}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
      </div>
    </div>
  );
};

export default ChatHeader;
