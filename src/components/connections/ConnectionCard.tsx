
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, UserMinus, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ConnectionCardProps {
  connection: {
    id: string;
    full_name: string;
    avatar_url?: string;
    department?: string;
    role?: string;
  };
  isConnected: boolean;
  onConnectionUpdate: () => void;
}

export const ConnectionCard = ({ connection, isConnected, onConnectionUpdate }: ConnectionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleToggleConnection = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (isConnected) {
        // Remove connection
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', connection.id);
        
        if (error) throw error;
        toast.success(`Disconnected from ${connection.full_name}`);
      } else {
        // Add connection
        const { error } = await supabase
          .from('connections')
          .insert({
            follower_id: user.id,
            following_id: connection.id
          });
        
        if (error) throw error;
        toast.success(`Connected with ${connection.full_name}`);
      }
      
      // Trigger refresh of connections
      onConnectionUpdate();
    } catch (error) {
      console.error("Error toggling connection:", error);
      toast.error("Failed to update connection");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    // Create a conversation and navigate to it
    try {
      // Check if a conversation already exists
      const { data: existingConversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', user?.id)
        .order('created_at', { ascending: false });
        
      const otherParticipantConversations = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', connection.id);
        
      // Find common conversation IDs
      const userConvIds = existingConversations?.map(c => c.conversation_id) || [];
      const otherConvIds = otherParticipantConversations.data?.map(c => c.conversation_id) || [];
      const commonConvIds = userConvIds.filter(id => otherConvIds.includes(id));
      
      let conversationId;
      
      if (commonConvIds.length > 0) {
        // Use existing conversation
        conversationId = commonConvIds[0];
      } else {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
          
        if (convError) throw convError;
        
        conversationId = newConversation.id;
        
        // Add participants
        const participants = [
          { conversation_id: conversationId, profile_id: user?.id },
          { conversation_id: conversationId, profile_id: connection.id }
        ];
        
        const { error: participantsError } = await supabase
          .from('conversation_participants')
          .insert(participants);
          
        if (participantsError) throw participantsError;
      }
      
      // Navigate to the conversation
      navigate(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={connection.avatar_url} alt={connection.full_name} />
              <AvatarFallback>{connection.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-foreground">{connection.full_name}</h3>
              <p className="text-sm text-muted-foreground">
                {connection.department ? `${connection.department}` : connection.role || 'Student'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleMessage}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              variant={isConnected ? "destructive" : "default"}
              size="icon"
              onClick={handleToggleConnection}
              disabled={isLoading}
            >
              {isConnected ? (
                <UserMinus className="h-4 w-4" />
              ) : (
                <UserCheck className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
