import { Navigation } from "@/components/Navigation";
import { Plus, User, Search } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";

// Temporary mock data - replace with real data when backend is integrated
const mockUsers = [
  { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", timestamp: "2h ago" },
  { id: 2, name: "Jane Smith", lastMessage: "Did you complete the assignment?", timestamp: "5h ago" },
  { id: 3, name: "Alex Johnson", lastMessage: "Thanks for your help!", timestamp: "1d ago" },
];

// Temporary mock friends data - replace with real data when backend is integrated
const mockFriends = [
  { id: 4, name: "Sarah Wilson", department: "Computer Engineering" },
  { id: 5, name: "Mike Brown", department: "Information Technology" },
  { id: 6, name: "Emily Davis", department: "Mechanical Engineering" },
  { id: 7, name: "Chris Lee", department: "Electronics Engineering" },
];

const Messages = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredFriends = mockFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFriendSelect = (friendId: number) => {
    setIsOpen(false);
    navigate(`/messages/${friendId}`);
  };

  const currentUser = [...mockUsers, ...mockFriends].find(
    (user) => user.id === Number(userId)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h1 className="text-xl font-semibold dark:text-white">Messages</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle className="dark:text-white">New Message</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search friends..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </div>
                      <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                        {filteredFriends.map((friend) => (
                          <button
                            key={friend.id}
                            onClick={() => handleFriendSelect(friend.id)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-white"
                          >
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">{friend.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{friend.department}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="divide-y dark:divide-gray-700">
                {mockUsers.map((user) => (
                  <Link
                    key={user.id}
                    to={`/messages/${user.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h2 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.lastMessage}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {userId ? (
              <ChatWindow 
                userId={userId} 
              />
            ) : (
              <div className="h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
