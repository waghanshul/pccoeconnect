import { Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

// Temporary mock data - replace with real data when backend is integrated
const mockUsers = [
  { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", timestamp: "2h ago" },
  { id: 2, name: "Jane Smith", lastMessage: "Did you complete the assignment?", timestamp: "5h ago" },
  { id: 3, name: "Alex Johnson", lastMessage: "Thanks for your help!", timestamp: "1d ago" },
];

const Messages = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-semibold">Messages</h1>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
          
          <div className="divide-y">
            {mockUsers.map((user) => (
              <Link
                key={user.id}
                to={`/messages/${user.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h2 className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </h2>
                    <span className="text-xs text-gray-500">{user.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;