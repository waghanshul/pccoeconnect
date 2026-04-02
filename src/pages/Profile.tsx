import { AppLayout } from "@/components/layout/AppLayout";
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
    <AppLayout>
      <div className="py-6">
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
    </AppLayout>
  );
};

export default Profile;
