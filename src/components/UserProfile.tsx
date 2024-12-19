import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Heart, MessageSquare } from "lucide-react";
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.role}</p>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleMessage}
          >
            <MessageSquare className="w-4 h-4" />
            Message
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Academic Details</p>
              <p className="text-sm text-muted-foreground">
                {user.department} • {user.year} Year
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <BookOpen className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium">Bio</p>
              <p className="text-sm text-muted-foreground">{user.bio}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Heart className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium">Interests</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-secondary/10 text-secondary-foreground rounded-full"
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