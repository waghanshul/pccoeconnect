import { Navigation } from "@/components/Navigation";
import { SocialFeed } from "@/components/social/SocialFeed";
import { PageTransition } from "@/components/ui/PageTransition";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <Navigation />
      <PageTransition>
        <main className="container mx-auto px-4 pt-20 md:pt-20 pb-24 md:pb-10 max-w-3xl relative z-10">
          <SocialFeed />
        </main>
      </PageTransition>
    </div>
  );
};

export default Index;
