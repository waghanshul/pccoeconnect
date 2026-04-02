import { Navigation } from "@/components/Navigation";
import { UserProfile } from "@/components/UserProfile";
import { useUserStore } from "@/services/user";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { PageTransition } from "@/components/ui/PageTransition";

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
      <PageTransition>
        <main className="container mx-auto px-4 pt-16 md:pt-20 pb-24 md:pb-10">
          <div>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              </div>
            ) : (
              <UserProfile user={userData} isOwnProfile={true} />
            )}
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Profile;
