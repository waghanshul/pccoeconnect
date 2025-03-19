
import { Navigation } from "@/components/Navigation";
import { SocialFeed } from "@/components/social/SocialFeed";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-10 max-w-3xl">
        <SocialFeed />
      </main>
    </div>
  );
};

export default Index;
