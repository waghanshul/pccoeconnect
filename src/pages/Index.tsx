import { Navigation } from "@/components/Navigation";
import { Post } from "@/components/Post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, FileText, BarChart2, Upload } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  
  const posts = [
    {
      author: "Arjun Patel",
      content: "Just submitted my final project for Advanced Algorithms! #PCCOE #ComputerScience",
      timestamp: "2 hours ago",
      avatar: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4",
      authorId: "1",
    },
    {
      author: "Priya Sharma",
      content: "Looking for team members for the upcoming hackathon! DM if interested 🚀 #Hackathon #TeamBuilding",
      timestamp: "5 hours ago",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      authorId: "2",
    },
  ];

  const suggestedUsers = [
    { id: 3, name: "Rahul Kumar", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", followed: false },
    { id: 4, name: "Anita Desai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", followed: true },
    { id: 5, name: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", followed: false },
  ];

  const handleProfileClick = (userId: string | number) => {
    navigate(`/profile/${userId}`);
  };

  const handleCreatePost = (type: string) => {
    // This is a placeholder for future implementation
    toast(`Creating new ${type} post...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 pt-20">
        <div className="flex">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
              <div className="flex gap-4 items-center">
                <Avatar className="cursor-pointer" onClick={() => navigate("/profile")}>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Input 
                  placeholder="What's on your mind?" 
                  className="bg-gray-50 dark:bg-gray-700"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" className="rounded-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleCreatePost('text')} className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Text Post</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreatePost('poll')} className="cursor-pointer">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Create Poll</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCreatePost('media')} className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload Media</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-6">
              {posts.map((post, index) => (
                <Post key={index} {...post} />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 pl-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 dark:text-white">People to follow</h3>
                <div className="space-y-4">
                  {suggestedUsers.map((user) => (
                    <div key={user.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          className="cursor-pointer hover:opacity-90 transition-opacity" 
                          onClick={() => handleProfileClick(user.id)}
                        >
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p 
                            className="text-sm font-medium dark:text-white cursor-pointer hover:text-primary transition-colors"
                            onClick={() => handleProfileClick(user.id)}
                          >
                            {user.name}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={user.followed ? "outline" : "default"}
                        size="sm"
                      >
                        {user.followed ? "Following" : "Follow"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;