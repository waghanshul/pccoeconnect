import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Heart } from "lucide-react";

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
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
          <p className="text-muted-foreground">{user.role}</p>
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
                    className="px-3 py-1 text-sm bg-secondary rounded-full"
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