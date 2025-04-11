
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Friend } from "./types";

export const fetchContacts = async (userId: string | undefined): Promise<Friend[]> => {
  try {
    if (!userId) return [];
    
    // For simplicity, we're getting all users except the current user
    // In a real app, you'd want to filter for friends/connections
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', userId);
      
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
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', userId)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
      
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
