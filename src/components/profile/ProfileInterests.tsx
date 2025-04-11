
import { Heart } from "lucide-react";
import { ProfileDetailsItem } from "./ProfileDetailsItem";

interface ProfileInterestsProps {
  interests: string[];
}

export const ProfileInterests = ({ interests }: ProfileInterestsProps) => {
  const hasInterests = interests && Array.isArray(interests) && interests.length > 0;

  return (
    <ProfileDetailsItem 
      icon={<Heart className="w-5 h-5" />}
      title="Interests"
      content={
        <div className="flex flex-wrap gap-2 mt-2">
          {hasInterests ? (
            interests.map((interest, index) => (
              <span
                key={index}
                className="px-3 py-1 text-sm bg-primary/10 dark:bg-primary/20 text-primary rounded-full transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
              >
                {interest}
              </span>
            ))
          ) : (
            <p className="text-sm text-muted-foreground dark:text-gray-400">No interests listed</p>
          )}
        </div>
      }
    />
  );
};
