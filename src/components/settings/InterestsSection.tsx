
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/services/user";
import { useAuth } from "@/context/AuthContext";

interface InterestsSectionProps {
  interests: string[];
  setInterests: React.Dispatch<React.SetStateAction<string[]>>;
}

export const InterestsSection = ({ interests, setInterests }: InterestsSectionProps) => {
  const { user } = useAuth();
  const { updateUserInterests } = useUserStore();
  const { toast } = useToast();
  const [newInterest, setNewInterest] = useState("");

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) {
      toast({
        title: "Duplicate Interest",
        description: "This interest is already in your list",
        variant: "destructive",
      });
      return;
    }
    
    const updatedInterests = [...interests, newInterest.trim()];
    setInterests(updatedInterests);
    setNewInterest("");
    
    if (user) {
      updateUserInterests(user.id, updatedInterests);
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = interests.filter(i => i !== interest);
    setInterests(updatedInterests);
    
    if (user) {
      updateUserInterests(user.id, updatedInterests);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Interests</h2>
      <div className="space-y-4">
        <div className="flex gap-2 max-w-md">
          <Input 
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            placeholder="Add an interest"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addInterest();
              }
            }}
          />
          <Button onClick={addInterest}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {interests.map((interest, index) => (
            <Badge key={index} className="px-2 py-1 flex items-center gap-1">
              {interest}
              <button onClick={() => removeInterest(interest)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {interests.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No interests added yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
