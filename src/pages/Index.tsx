
import { Navigation } from "@/components/Navigation";
import { SocialFeed } from "@/components/social/SocialFeed";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <Navigation />
      <main className="container mx-auto px-4 pt-32 pb-10 max-w-3xl relative z-10">
        <SocialFeed />
      </main>
    </div>
  );
};

export default Index;
