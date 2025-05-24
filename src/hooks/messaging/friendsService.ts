
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Friend } from "./types";

export const fetchContacts = async (userId: string | undefined): Promise<Friend[]> => {
  try {
    if (!userId) return [];
    
    console.log("Fetching contacts for user:", userId);
    
    // Get accepted connections (both directions)
    const { data: connectedData, error: connectedError } = await supabase
      .from('connections_v2')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');
        
    if (connectedError) {
      console.error("Error fetching connected users:", connectedError);
      throw connectedError;
    }
    
    // Extract connected user IDs
    const connectedIds = (connectedData || []).map(conn => 
      conn.sender_id === userId ? conn.receiver_id : conn.sender_id
    );
    
    console.log("Connected user IDs:", connectedIds);
    
    if (connectedIds.length === 0) return [];
    
    // Get the profile information for each connected user
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .in('id', connectedIds);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw profilesError;
    }
    
    // Get additional data for student profiles where available
    const friendsWithDepartments = await Promise.all((profiles || []).map(async (profile) => {
      try {
        if (profile.role === 'student') {
          const { data: studentData } = await supabase
            .from('student_profiles')
            .select('department')
            .eq('id', profile.id)
            .maybeSingle();
            
          return {
            ...profile,
            department: studentData?.department || undefined
          };
        }
        return profile;
      } catch (err) {
        // If there's an error getting the student profile, just return the basic profile
        console.error("Error fetching student profile:", err);
        return profile;
      }
    }));
    
    console.log("Fetched friends with departments:", friendsWithDepartments);
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
    
    // Get accepted connections (both directions)
    const { data: connectedData, error: connectedError } = await supabase
      .from('connections_v2')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted');
        
    if (connectedError) throw connectedError;
    
    // Extract connected user IDs
    const connectedIds = (connectedData || []).map(conn => 
      conn.sender_id === userId ? conn.receiver_id : conn.sender_id
    );
    
    // Search only within connections
    if (connectedIds.length === 0) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .in('id', connectedIds)
      .ilike('full_name', `%${query}%`);
      
    if (error) throw error;
    
    // Get additional data for student profiles where available
    const friendsWithDepartments = await Promise.all((data || []).map(async (profile) => {
      try {
        if (profile.role === 'student') {
          const { data: studentData } = await supabase
            .from('student_profiles')
            .select('department')
            .eq('id', profile.id)
            .maybeSingle();
            
          return {
            ...profile,
            department: studentData?.department || undefined
          };
        }
        return profile;
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
