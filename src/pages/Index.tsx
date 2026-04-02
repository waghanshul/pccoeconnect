import { Navigation } from "@/components/Navigation";
import { SocialFeed } from "@/components/social/SocialFeed";
import { PageTransition } from "@/components/ui/PageTransition";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>
        <main className="container mx-auto px-4 pt-20 md:pt-20 pb-24 md:pb-10 max-w-3xl">
          <SocialFeed />
        </main>
      </PageTransition>
    </div>
  );
};

export default Index;
