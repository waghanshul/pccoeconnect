
import { CardContent } from "@/components/ui/card";
import { GraduationCap, BookOpen, Mail, Phone, Globe } from "lucide-react";
import { ProfileDetailsItem } from "./ProfileDetailsItem";
import { ProfileInterests } from "./ProfileInterests";

interface ProfileDetailsProps {
  department: string;
  year: string;
  bio: string;
  interests: string[];
  isPublic: boolean;
  email?: string;
  phone?: string;
}

export const ProfileDetails = ({
  department, 
  year,
  bio,
  interests,
  isPublic,
  email,
  phone
}: ProfileDetailsProps) => {
  return (
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <ProfileDetailsItem 
          icon={<GraduationCap className="w-5 h-5" />}
          title="Academic Details"
          content={`${department || "Not specified"} • ${year || "Not specified"} Year`}
        />
        
        <ProfileDetailsItem 
          icon={<BookOpen className="w-5 h-5" />}
          title="Bio"
          content={bio ? bio : "No bio available"}
        />

        <ProfileInterests interests={interests} />

        {email && (
          <ProfileDetailsItem 
            icon={<Mail className="w-5 h-5" />}
            title="Email"
            content={email}
          />
        )}

        {phone && (
          <ProfileDetailsItem 
            icon={<Phone className="w-5 h-5" />}
            title="Phone"
            content={phone}
          />
        )}

        <ProfileDetailsItem 
          icon={<Globe className="w-5 h-5" />}
          title="Profile Visibility"
          content={isPublic ? 'Public Profile' : 'Private Profile'}
        />
      </div>
    </CardContent>
  );
};
