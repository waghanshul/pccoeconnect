
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Friend } from "./types";

export const fetchContacts = async (userId: string | undefined): Promise<Friend[]> => {
  try {
    if (!userId) return [];
    
    // Get user's connections (people they follow)
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('following_id')
      .eq('follower_id', userId);
      
    if (connectionsError) throw connectionsError;
    
    if (!connections || connections.length === 0) {
      // If no connections yet, return an empty array
      return [];
    }
    
    // Extract the IDs of connections
    const connectionIds = connections.map(conn => conn.following_id);
    
    // Fetch profile information for all connections
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
    
    // Get user's connections for later reference
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('following_id')
      .eq('follower_id', userId);
      
    if (connectionsError) throw connectionsError;
    
    // Create a set of connection IDs for easy lookup
    const connectionIds = new Set((connections || []).map(conn => conn.following_id));
    
    // Search for users matching the query
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', userId)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
      
    if (profilesError) throw profilesError;
    
    // Get additional data for student profiles and flag connections
    const usersWithDetails = await Promise.all((profiles || []).map(async (profile) => {
      try {
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('department')
          .eq('id', profile.id)
          .single();
          
        return {
          ...profile,
          department: studentData?.department || undefined,
          isConnected: connectionIds.has(profile.id)
        };
      } catch (err) {
        // If there's an error getting the student profile, just return the basic profile
        return {
          ...profile,
          isConnected: connectionIds.has(profile.id)
        };
      }
    }));
    
    return usersWithDetails;
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

// New function to get user connections
export const fetchUserConnections = async (userId: string | undefined): Promise<Friend[]> => {
  try {
    if (!userId) return [];
    
    // Get user's connections (people they follow)
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('following_id')
      .eq('follower_id', userId);
      
    if (connectionsError) throw connectionsError;
    
    if (!connections || connections.length === 0) {
      return [];
    }
    
    // Extract the IDs of connections
    const connectionIds = connections.map(conn => conn.following_id);
    
    // Fetch profile information for all connections
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, status')
      .in('id', connectionIds);
      
    if (profilesError) throw profilesError;
    
    // Get additional data for student profiles where available
    const connectionsWithDetails = await Promise.all((profiles || []).map(async (profile) => {
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
        return profile;
      }
    }));
    
    return connectionsWithDetails;
  } catch (error) {
    console.error("Error fetching user connections:", error);
    toast({
      title: "Error",
      description: "Failed to load connections",
      variant: "destructive",
    });
    return [];
  }
};

// New function to toggle connection status
export const toggleConnection = async (
  userId: string | undefined, 
  targetUserId: string,
  isCurrentlyConnected: boolean
): Promise<boolean> => {
  try {
    if (!userId) return false;
    
    if (isCurrentlyConnected) {
      // Remove connection
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('follower_id', userId)
        .eq('following_id', targetUserId);
        
      if (error) throw error;
      return false; // No longer connected
    } else {
      // Add connection
      const { error } = await supabase
        .from('connections')
        .insert({
          follower_id: userId,
          following_id: targetUserId
        });
        
      if (error) throw error;
      return true; // Now connected
    }
  } catch (error) {
    console.error("Error toggling connection:", error);
    toast({
      title: "Error",
      description: "Failed to update connection",
      variant: "destructive",
    });
    return isCurrentlyConnected; // Return original status on error
  }
};
