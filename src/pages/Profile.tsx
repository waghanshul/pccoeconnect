
import { Navigation } from "@/components/Navigation";
import { UserProfile } from "@/components/UserProfile";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setUserData(data);
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Could not load profile data');
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary to-blue-600 dark:from-primary/80 dark:to-blue-600/80 rounded-b-3xl -z-10" />
          
          {loading ? (
            <div className="rounded-lg bg-card shadow-lg p-6 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          ) : (
            userData && <UserProfile user={userData} />
          )}
          
          <Tabs defaultValue="posts" className="mt-6 max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground py-8">
                    You haven't created any posts yet.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground py-8">
                    No recent activities to show.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="groups" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground py-8">
                    You haven't joined any groups yet.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
