
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserX, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchUserConnections, toggleConnection } from "@/hooks/messaging/friendsService";
import { Friend } from "@/hooks/messaging/types";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ConnectionsList = () => {
  const [connections, setConnections] = useState<Friend[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingConnection, setRemovingConnection] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      loadConnections();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConnections(connections);
    } else {
      const filtered = connections.filter(
        connection => connection.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConnections(filtered);
    }
  }, [searchQuery, connections]);

  const loadConnections = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const userConnections = await fetchUserConnections(user.id);
      setConnections(userConnections);
      setFilteredConnections(userConnections);
    } catch (error) {
      console.error("Error loading connections:", error);
      toast({
        title: "Error",
        description: "Failed to load connections",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveConnection = async (connectionId: string) => {
    if (!user?.id) return;
    setRemovingConnection(connectionId);
    
    try {
      await toggleConnection(user.id, connectionId, true);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      setFilteredConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      toast({
        title: "Connection removed",
        description: "Successfully removed connection",
        variant: "default"
      });
    } catch (error) {
      console.error("Failed to remove connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      });
    } finally {
      setRemovingConnection(null);
    }
  };

  const handleMessage = (connectionId: string) => {
    navigate(`/messages`, { state: { initialContactId: connectionId } });
  };

  const handleViewProfile = (connectionId: string) => {
    navigate(`/user/${connectionId}`);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Connections</CardTitle>
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredConnections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? "No connections match your search" : "You don't have any connections yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConnections.map(connection => (
              <div 
                key={connection.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Avatar 
                  className="h-12 w-12 cursor-pointer" 
                  onClick={() => handleViewProfile(connection.id)}
                >
                  <AvatarImage src={connection.avatar_url || undefined} />
                  <AvatarFallback>
                    {connection.full_name.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 cursor-pointer" onClick={() => handleViewProfile(connection.id)}>
                  <p className="font-medium">{connection.full_name}</p>
                  {connection.department && (
                    <p className="text-sm text-muted-foreground">{connection.department}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMessage(connection.id)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRemoveConnection(connection.id)}
                    disabled={removingConnection === connection.id}
                  >
                    {removingConnection === connection.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionsList;
