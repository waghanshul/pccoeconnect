
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Poll } from "@/services/social/types";

interface SocialPostPollProps {
  poll: Poll | null;
  handleVote: (option: string) => void;
}

export const SocialPostPoll = ({ poll, handleVote }: SocialPostPollProps) => {
  if (!poll) return null;
  
  const getTotalVotes = () => {
    if (!poll || !poll.votes) return 0;
    return Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  };
  
  const getPercentage = (option: string) => {
    if (!poll || !poll.votes) return 0;
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    return Math.round((poll.votes[option] / totalVotes) * 100);
  };
  
  const totalVotes = getTotalVotes();
  
  return (
    <div className="mt-4 border rounded-md p-4">
      <h3 className="font-semibold text-lg mb-2">{poll.question}</h3>
      <div className="space-y-3">
        {Array.isArray(poll.options) && poll.options.map((option, index) => {
          const percentage = getPercentage(option);
          const userVoted = poll.user_vote === option;
          const canVote = !poll.user_vote;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {userVoted && <div className="w-2 h-2 bg-primary rounded-full" />}
                  <span className={userVoted ? "font-medium" : ""}>{option}</span>
                </div>
                <span className="text-sm text-gray-500">{percentage}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <Progress value={percentage} className="h-2 flex-grow" />
                {canVote && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs"
                    onClick={() => handleVote(option)}
                  >
                    Vote
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-sm text-gray-500 mt-3">{totalVotes} votes</div>
    </div>
  );
};
