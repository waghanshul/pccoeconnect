
import { Navigation } from "@/components/Navigation";
import { UserProfile } from "@/components/UserProfile";
import { useUserStore } from "@/services/user";

const Profile = () => {
  const { userData } = useUserStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <div className="relative">
          <div className="absolute inset-0 h-48 bg-gradient-to-r from-primary to-blue-600 dark:from-primary/80 dark:to-blue-600/80 rounded-b-3xl -z-10" />
          <UserProfile user={userData} />
        </div>
      </main>
    </div>
  );
};

export default Profile;
