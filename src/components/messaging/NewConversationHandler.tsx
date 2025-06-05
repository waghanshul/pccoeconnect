
import { useState } from "react";
import { Friend } from "@/hooks/messaging/types";

interface NewConversationHandlerProps {
  selectedUser: Friend | null;
  isCreatingConversation: boolean;
  onSendFirstMessage: (content: string) => void;
}

const NewConversationHandler = ({
  selectedUser,
  isCreatingConversation,
  onSendFirstMessage
}: NewConversationHandlerProps) => {
  const [messageContent, setMessageContent] = useState("");

  if (!selectedUser) return null;

  const handleSendMessage = () => {
    if (messageContent.trim() && !isCreatingConversation) {
      console.log("Sending first message:", messageContent);
      onSendFirstMessage(messageContent);
      setMessageContent("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && messageContent.trim() && !isCreatingConversation) {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {selectedUser.full_name?.charAt(0) || '?'}
          </span>
        </div>
        <div>
          <h2 className="font-semibold dark:text-white">
            {selectedUser.full_name}
          </h2>
          {isCreatingConversation && (
            <p className="text-sm text-blue-500">Setting up conversation...</p>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Start a conversation with {selectedUser.full_name}
        </p>
      </div>
      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={isCreatingConversation ? "Setting up conversation..." : "Type a message..."}
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isCreatingConversation}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isCreatingConversation || !messageContent.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingConversation ? "Creating..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationHandler;
