import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Heart, MessageSquare, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UserProfileProps {
  user: {
    name: string;
    avatar: string;
    role: string;
    department: string;
    year: string;
    bio: string;
    interests: string[];
  };
}

export const UserProfile = ({ user }: UserProfileProps) => {
  const navigate = useNavigate();

  const handleMessage = () => {
    navigate("/messages");
    toast.success("Redirecting to messages with " + user.name);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 shadow-xl">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24 ring-4 ring-white dark:ring-gray-700">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold dark:text-white">{user.name}</CardTitle>
          <div className="flex items-center justify-center gap-2 text-primary">
            <Cpu className="w-4 h-4" />
            <p className="text-muted-foreground dark:text-gray-400">{user.role}</p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2 hover:bg-primary hover:text-white dark:text-gray-200 dark:hover:text-white transition-colors duration-200"
            onClick={handleMessage}
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium dark:text-gray-200">Academic Details</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                {user.department} • {user.year} Year
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <BookOpen className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium dark:text-gray-200">Bio</p>
              <p className="text-sm text-muted-foreground dark:text-gray-400">{user.bio}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <Heart className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium dark:text-gray-200">Interests</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-primary/10 dark:bg-primary/20 text-primary rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};