
import { Navigation } from "@/components/Navigation";
import { UserProfile } from "@/components/UserProfile";
import { useUserStore } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const Profile = () => {
  const { userData, fetchUserProfile, isLoading } = useUserStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user, fetchUserProfile]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-32">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary/30 to-blue-500/20 rounded-b-3xl blur-sm -z-10" />
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <UserProfile user={userData} isOwnProfile={true} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
