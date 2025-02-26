
import Landing from "./Landing";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20">
        <h1>Welcome back!</h1>
      </main>
    </div>
  );
}
