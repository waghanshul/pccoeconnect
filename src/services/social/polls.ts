
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Poll } from "./types";

export const createPoll = async (question: string, options: string[]): Promise<string | null> => {
  try {
    // Insert poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        question,
        options: options
      })
      .select()
      .single();
    
    if (pollError) throw pollError;
    
    return pollData?.id || null;
  } catch (error) {
    console.error("Error creating poll:", error);
    toast({
      title: "Error",
      description: "Failed to create poll",
      variant: "destructive",
    });
    return null;
  }
};

export const votePoll = async (pollId: string, option: string): Promise<boolean> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    
    // Insert vote
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        choice: option,
        user_id: user.id
      });
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Vote recorded successfully",
    });
    
    return true;
  } catch (error) {
    console.error("Error voting on poll:", error);
    toast({
      title: "Error",
      description: "Failed to record vote",
      variant: "destructive",
    });
    return false;
  }
};

export const fetchPoll = async (pollId: string): Promise<Poll | null> => {
  try {
    // Get poll data
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();
    
    if (pollError) throw pollError;
    
    // Get vote counts
    const { data: votesData, error: votesError } = await supabase
      .from('poll_votes')
      .select('choice')
      .eq('poll_id', pollId);
    
    if (votesError) throw votesError;
    
    // Get current user's vote
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userVote, error: userVoteError } = await supabase
      .from('poll_votes')
      .select('choice')
      .eq('poll_id', pollId)
      .eq('user_id', user?.id)
      .maybeSingle();
    
    // Count votes for each option
    const voteCount: Record<string, number> = {};
    
    // Ensure options is treated as string array
    const pollOptions = Array.isArray(pollData.options) 
      ? pollData.options 
      : typeof pollData.options === 'string' 
        ? JSON.parse(pollData.options) 
        : [];
    
    // Initialize vote counts for each option
    pollOptions.forEach((option: string) => {
      voteCount[option] = 0;
    });
    
    // Count votes
    votesData.forEach((vote) => {
      if (voteCount[vote.choice] !== undefined) {
        voteCount[vote.choice]++;
      }
    });
    
    const poll: Poll = {
      id: pollData.id,
      question: pollData.question,
      options: pollOptions,
      created_at: pollData.created_at,
      votes: voteCount,
      user_vote: userVote?.choice
    };
    
    return poll;
  } catch (error) {
    console.error("Error fetching poll:", error);
    return null;
  }
};
