import { Navigation } from "@/components/Navigation";
import { ConnectionsList } from "@/components/connections/ConnectionsList";
import { PageTransition } from "@/components/ui/PageTransition";

const Connections = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>
        <main className="container mx-auto px-4 pt-16 md:pt-20 pb-24 md:pb-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Connections</h1>
            <p className="text-muted-foreground">Connect with other students and message them directly</p>
          </div>
          <ConnectionsList />
        </main>
      </PageTransition>
    </div>
  );
};

export default Connections;
