
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Friend } from "./types";

export const fetchContacts = async (userId: string | undefined): Promise<Friend[]> => {
  try {
    if (!userId) return [];
    
    // Get the user's connections first (people they follow)
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('following_id')
      .eq('follower_id', userId);
      
    if (connectionsError) throw connectionsError;
    
    // If no connections, return empty array
    if (!connections || connections.length === 0) return [];
    
    // Get the profile information for each connection
    const connectionIds = connections.map(c => c.following_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', connectionIds);
      
    if (profilesError) throw profilesError;
    
    // Get additional data for student profiles where available
    const friendsWithDepartments = await Promise.all((profiles || []).map(async (profile) => {
      try {
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('department')
          .eq('id', profile.id)
          .single();
          
        return {
          ...profile,
          department: studentData?.department || undefined
        };
      } catch (err) {
        // If there's an error getting the student profile, just return the basic profile
        return profile;
      }
    }));
    
    return friendsWithDepartments;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    toast({
      title: "Error",
      description: "Failed to load contacts",
      variant: "destructive",
    });
    return [];
  }
};

export const searchUsers = async (query: string, userId: string | undefined): Promise<Friend[]> => {
  try {
    if (!userId) return [];
    
    if (!query.trim()) {
      return await fetchContacts(userId);
    }
    
    // Get user's connections
    const { data: connections } = await supabase
      .from('connections')
      .select('following_id')
      .eq('follower_id', userId);
    
    const connectionIds = connections?.map(c => c.following_id) || [];
    
    // Search only within connections
    if (connectionIds.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', connectionIds)
      .ilike('full_name', `%${query}%`);
      
    if (error) throw error;
    
    // Get additional data for student profiles where available
    const friendsWithDepartments = await Promise.all((data || []).map(async (profile) => {
      try {
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('department')
          .eq('id', profile.id)
          .single();
          
        return {
          ...profile,
          department: studentData?.department || undefined
        };
      } catch (err) {
        // If there's an error getting the student profile, just return the basic profile
        return profile;
      }
    }));
    
    return friendsWithDepartments;
  } catch (error) {
    console.error("Error searching users:", error);
    toast({
      title: "Error",
      description: "Failed to search users",
      variant: "destructive",
    });
    return [];
  }
};
