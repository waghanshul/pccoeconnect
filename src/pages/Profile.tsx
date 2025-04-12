
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-32">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary to-blue-600 dark:from-primary/80 dark:to-blue-600/80 rounded-b-3xl -z-10" />
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
