
import { Navigation } from "@/components/Navigation";
import { ConnectionsList } from "@/components/connections/ConnectionsList";

const Connections = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-28 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Connections</h1>
          <p className="text-muted-foreground">Connect with other students and message them directly</p>
        </div>
        <ConnectionsList />
      </main>
    </div>
  );
};

export default Connections;
