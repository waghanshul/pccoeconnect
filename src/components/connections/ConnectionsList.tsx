import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { ConnectionCard } from "./ConnectionCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Connection {
  id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  role?: string;
}

export const ConnectionsList = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [pendingRequestIds, setPendingRequestIds] = useState<string[]>([]);
  const [receivedRequestIds, setReceivedRequestIds] = useState<string[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserConnectionStatus();
      fetchAllUsers();
      
      // Set up realtime subscription for connection changes
      const channel = supabase
        .channel('connection-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'connections_v2' },
          () => {
            console.log("Connection change detected, refreshing status...");
            fetchUserConnectionStatus();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUserConnectionStatus = async () => {
    if (!user) return;
    
    try {
      // Get accepted connections where user is either sender or receiver
      const { data: connectedData, error: connectedError } = await supabase
        .from('connections_v2')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted');
        
      if (connectedError) throw connectedError;
      
      // Extract connected user IDs
      const connected = connectedData.map(conn => 
        conn.sender_id === user.id ? conn.receiver_id : conn.sender_id
      );
      setConnectedIds(connected);
      console.log("Connected IDs:", connected);
      
      // Get pending requests sent by user
      const { data: sentData, error: sentError } = await supabase
        .from('connections_v2')
        .select('receiver_id')
        .eq('sender_id', user.id)
        .eq('status', 'pending');
        
      if (sentError) throw sentError;
      
      const pendingIds = sentData.map(req => req.receiver_id);
      setPendingRequestIds(pendingIds);
      console.log("Pending request IDs:", pendingIds);
      
      // Get pending requests received by user
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections_v2')
        .select('sender_id')
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
        
      if (receivedError) throw receivedError;
      
      const receivedIds = receivedData.map(req => req.sender_id);
      setReceivedRequestIds(receivedIds);
      console.log("Received request IDs:", receivedIds);
      
    } catch (error) {
      console.error("Error fetching connection status:", error);
      toast.error("Failed to load connection status");
    }
  };

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all users except current user
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .neq('id', user?.id);
        
      if (error) throw error;
      
      // Get student profile data for each user
      const usersWithExtendedInfo = await Promise.all(
        data.map(async (profile) => {
          if (profile.role === 'student') {
            const { data: studentData } = await supabase
              .from('student_profiles')
              .select('department')
              .eq('id', profile.id)
              .maybeSingle();
              
            return {
              ...profile,
              department: studentData?.department
            };
          }
          return profile;
        })
      );
      
      setConnections(usersWithExtendedInfo);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      fetchAllUsers();
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .neq('id', user?.id)
        .ilike('full_name', `%${query}%`);
        
      if (error) throw error;
      
      // Get student profile data for each user
      const usersWithExtendedInfo = await Promise.all(
        data.map(async (profile) => {
          if (profile.role === 'student') {
            const { data: studentData } = await supabase
              .from('student_profiles')
              .select('department')
              .eq('id', profile.id)
              .maybeSingle();
              
            return {
              ...profile,
              department: studentData?.department
            };
          }
          return profile;
        })
      );
      
      setConnections(usersWithExtendedInfo);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionUpdate = () => {
    console.log("Connection updated, refreshing data...");
    fetchUserConnectionStatus();
  };

  const filteredConnections = searchQuery 
    ? connections 
    : connections.sort((a, b) => {
        // Sort by connection status first, then by name
        const aConnected = connectedIds.includes(a.id);
        const bConnected = connectedIds.includes(b.id);
        if (aConnected && !bConnected) return -1;
        if (!aConnected && bConnected) return 1;
        return a.full_name.localeCompare(b.full_name);
      });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for students..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-9"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredConnections.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              isConnected={connectedIds.includes(connection.id)}
              hasPendingRequest={pendingRequestIds.includes(connection.id)}
              hasReceivedRequest={receivedRequestIds.includes(connection.id)}
              onConnectionUpdate={handleConnectionUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No students found</p>
        </div>
      )}
    </div>
  );
};
