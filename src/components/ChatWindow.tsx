
import { useState, useEffect, useRef } from "react";
import { User, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  conversationId: string;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverProfile, setReceiverProfile] = useState<{ id: string; full_name: string; avatar_url: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchConversationParticipants();
      setupRealtimeSubscription();
    }
  }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Fetch sender profiles for each message
      const messagesWithSenders = await Promise.all((data || []).map(async (message) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', message.sender_id)
          .single();
          
        return {
          ...message,
          sender: profileData || undefined
        };
      }));
      
      setMessages(messagesWithSenders);
      
      // Mark messages as read
      markMessagesAsRead(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversationParticipants = async () => {
    try {
      // Get conversation participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('conversation_participants')
        .select('profile_id')
        .eq('conversation_id', conversationId);
        
      if (participantsError) throw participantsError;
      
      // Find the other participant (not current user)
      const otherParticipantId = participantsData.find(p => p.profile_id !== user?.id)?.profile_id;
      
      if (otherParticipantId) {
        // Get profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', otherParticipantId)
          .single();
          
        if (profileError) throw profileError;
        
        setReceiverProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching conversation participants:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        async (payload) => {
          // Only process messages that aren't from the current user
          if (payload.new.sender_id !== user?.id) {
            // Fetch sender information
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single();
            
            // Ensure the new message conforms to the Message interface
            const newMessage: Message = {
              id: payload.new.id,
              sender_id: payload.new.sender_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              read_at: payload.new.read_at,
              sender: profileData || undefined
            };
            
            setMessages(current => [...current, newMessage]);
            
            // Mark the message as read
            markMessagesAsRead([payload.new]);
          }
        })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async (messagesToMark: any[]) => {
    try {
      // Only mark messages that were not sent by the current user and are unread
      const unreadMessages = messagesToMark.filter(msg => 
        msg.sender_id !== user?.id && msg.read_at === null
      );
      
      if (unreadMessages.length === 0) return;
      
      const messageIds = unreadMessages.map(msg => msg.id);
      
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds);
        
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    try {
      console.log("Sending message to conversation:", conversationId);
      
      // First, update the conversation's updated_at timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
        
      if (updateError) {
        console.error("Error updating conversation timestamp:", updateError);
      }
      
      // Then insert the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: newMessage,
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      // Add sender info to the message with proper typing
      const newMessageWithSender: Message = {
        id: data.id,
        sender_id: data.sender_id,
        content: data.content,
        created_at: data.created_at,
        read_at: data.read_at,
        sender: {
          full_name: user?.user_metadata?.full_name || user?.email || 'You',
          avatar_url: user?.user_metadata?.avatar_url || null
        }
      };
      
      setMessages(current => [...current, newMessageWithSender]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!conversationId) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={receiverProfile?.avatar_url || undefined} />
          <AvatarFallback>
            <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold dark:text-white">{receiverProfile?.full_name || 'Loading...'}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500 dark:text-gray-400">No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start gap-2 max-w-[70%]">
                {message.sender_id !== user?.id && (
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarImage src={message.sender?.avatar_url || undefined} />
                    <AvatarFallback>
                      {message.sender?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg p-3 ${
                    message.sender_id === user?.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {formatTime(message.created_at)}
                  </span>
                </div>
                
                {message.sender_id === user?.id && (
                  <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 min-h-[60px] max-h-[120px] dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 resize-none"
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon" 
            className="self-end h-10 w-10"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
