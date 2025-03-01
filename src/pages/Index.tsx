import { useState } from "react";
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
import { CreateTextPost } from "@/components/post/CreateTextPost";
import { CreatePollPost } from "@/components/post/CreatePollPost";
import { CreateMediaPost } from "@/components/post/CreateMediaPost";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [showTextPost, setShowTextPost] = useState(false);
  const [showPollPost, setShowPollPost] = useState(false);
  const [showMediaPost, setShowMediaPost] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<number[]>([]);
  
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
    {
      author: "Rahul Kumar",
      content: "Great session on AI/ML today at the tech symposium. Thanks to all who attended! 🤖 #PCCOE #AI #MachineLearning",
      timestamp: "8 hours ago",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      authorId: "3",
    },
    {
      author: "Neha Gupta",
      content: "📢 Reminder: IEEE Student Branch meeting tomorrow at 4 PM in Seminar Hall. Don't forget to bring your project proposals!",
      timestamp: "12 hours ago",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      authorId: "4",
    },
    {
      author: "Vikram Singh",
      content: "Just published my research paper on Quantum Computing! Check it out on the department website. 🎉 #Research #QuantumComputing",
      timestamp: "1 day ago",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      authorId: "5",
    },
  ];

  const suggestedUsers = [
    { id: 3, name: "Rahul Kumar", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e", department: "Computer Science" },
    { id: 4, name: "Anita Desai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", department: "Information Technology" },
    { id: 5, name: "Vikram Singh", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", department: "Mechanical Engineering" },
    { id: 6, name: "Meera Patel", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9", department: "Electronics" },
    { id: 7, name: "Karan Shah", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556", department: "Civil Engineering" },
  ];

  const interests = [
    {
      title: "PCCOE News",
      items: [
        "College ranked in top 100 engineering institutes",
        "New AI Research Center inauguration next week",
        "MoU signed with leading tech companies"
      ]
    },
    {
      title: "Internship Opportunities",
      items: [
        "Google Summer Internship 2024 - Apply by March 30",
        "TCS CodeVita Registration Open",
        "Microsoft Engage Program Starting Soon"
      ]
    },
    {
      title: "PCCOE Events",
      items: [
        "Annual Tech Fest 'Impulse 2024' - April 15-17",
        "Cultural Week - March 25-30",
        "Sports Tournament - Starting April 1"
      ]
    },
    {
      title: "Important Dates",
      items: [
        "Mid-sem Exams: March 20-25",
        "Project Submission Deadline: April 10",
        "End Semester Registration: April 1-5"
      ]
    }
  ];

  const handleProfileClick = (userId: string | number) => {
    navigate(`/profile/${userId}`);
  };

  const handleCreatePost = (type: string) => {
    switch (type) {
      case 'text':
        setShowTextPost(true);
        break;
      case 'poll':
        setShowPollPost(true);
        break;
      case 'media':
        setShowMediaPost(true);
        break;
    }
  };

  const handleTextPost = (content: string) => {
    // This is a placeholder - in a real app, this would send the post to a backend
    toast.success("Text post created!");
    console.log("New text post:", content);
  };

  const handlePollPost = (question: string, options: string[]) => {
    // This is a placeholder - in a real app, this would send the poll to a backend
    toast.success("Poll created!");
    console.log("New poll:", { question, options });
  };

  const handleMediaPost = (file: File, description: string) => {
    // This is a placeholder - in a real app, this would upload the file and create a post
    toast.success("Media post created!");
    console.log("New media post:", { file, description });
  };

  const handleFollowToggle = (userId: number) => {
    setFollowedUsers(prev => {
      const isFollowed = prev.includes(userId);
      const newFollowedUsers = isFollowed
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      toast.success(isFollowed ? "Unfollowed successfully" : "Followed successfully");
      return newFollowedUsers;
    });
  };

  const isUserFollowed = (userId: number) => followedUsers.includes(userId);

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
                  onClick={() => setShowTextPost(true)}
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

            <CreateTextPost 
              isOpen={showTextPost}
              onClose={() => setShowTextPost(false)}
              onPost={handleTextPost}
            />
            <CreatePollPost 
              isOpen={showPollPost}
              onClose={() => setShowPollPost(false)}
              onPost={handlePollPost}
            />
            <CreateMediaPost 
              isOpen={showMediaPost}
              onClose={() => setShowMediaPost(false)}
              onPost={handleMediaPost}
            />

            <div className="space-y-6">
              {posts.map((post, index) => (
                <Post key={index} {...post} />
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 pl-6 space-y-6">
            {/* People to Follow */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">People to Follow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <p className="text-xs text-gray-500">{user.department}</p>
                      </div>
                    </div>
                    <Button 
                      variant={isUserFollowed(user.id) ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFollowToggle(user.id)}
                    >
                      {isUserFollowed(user.id) ? "Following" : "Follow"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Your Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {interests.map((category) => (
                  <div key={category.title} className="space-y-2">
                    <h4 className="font-medium text-sm text-primary">{category.title}</h4>
                    <ul className="space-y-2">
                      {category.items.map((item, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary cursor-pointer transition-colors">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
