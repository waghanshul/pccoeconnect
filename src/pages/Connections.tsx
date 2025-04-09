
import { Navigation } from "@/components/Navigation";
import ConnectionsList from "@/components/connections/ConnectionsList";
import NewMessageDialog from "@/components/messaging/NewMessageDialog";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { searchUsers } from "@/hooks/messaging/friendsService";
import { Friend } from "@/hooks/messaging/types";

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // When dialog is opened, perform empty search to get all users
    if (isDialogOpen) {
      handleSearch("");
    }
  }, [isDialogOpen]);

  const handleSearch = async (query: string) => {
    if (!user?.id) return;
    
    setSearchQuery(query);
    setIsSearching(true);
    
    try {
      const results = await searchUsers(query, user.id);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    const handler = setTimeout(() => {
      handleSearch(query);
    }, 300);
    
    return () => clearTimeout(handler);
  };

  const handleUserSelect = (userId: string) => {
    // Navigate to user profile
    window.location.href = `/user/${userId}`;
  };

  const handleConnectionToggle = (userId: string, isConnected: boolean) => {
    // Update the connection status in the UI
    setSearchResults(prev => 
      prev.map(result => 
        result.id === userId 
          ? { ...result, isConnected }
          : result
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">Connections</h1>
          <NewMessageDialog
            friends={searchResults}
            isSearching={isSearching}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFriendSelect={handleUserSelect}
            onConnectionToggle={handleConnectionToggle}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            isConnectionsView={true}
          />
        </div>
        
        <ConnectionsList />
      </main>
    </div>
  );
};

export default Connections;
