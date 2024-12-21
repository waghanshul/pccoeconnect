import { User, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

// Temporary mock data - replace with real data when backend is integrated
const mockMessages: Message[] = [
  { id: 1, senderId: 1, text: "Hey, how are you?", timestamp: "10:30 AM" },
  { id: 2, senderId: 2, text: "I'm good, thanks! How about you?", timestamp: "10:31 AM" },
  { id: 3, senderId: 1, text: "Doing well! Did you complete the assignment?", timestamp: "10:32 AM" },
  { id: 4, senderId: 2, text: "Yes, just finished it yesterday.", timestamp: "10:33 AM" },
];

// Mock friends data to get receiver's name - replace with real data when backend is integrated
const mockFriends = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Alex Johnson" },
  { id: 4, name: "Sarah Wilson" },
  { id: 5, name: "Mike Brown" },
  { id: 6, name: "Emily Davis" },
  { id: 7, name: "Chris Lee" },
];

interface ChatWindowProps {
  userId: string;
  currentUserId?: number;
}

const ChatWindow = ({ userId, currentUserId = 1 }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [receiverName, setReceiverName] = useState("");

  useEffect(() => {
    // Find the receiver's name from mockFriends
    const receiver = mockFriends.find(friend => friend.id === Number(userId));
    if (receiver) {
      setReceiverName(receiver.name);
    }
  }, [userId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      senderId: currentUserId,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <h2 className="font-semibold dark:text-white">{receiverName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === currentUserId
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;