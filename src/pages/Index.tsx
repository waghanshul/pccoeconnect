
import Landing from "./Landing";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Home Feed</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle size={18} />
            <span>Create Post</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Feed Content */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome to your dashboard!</CardTitle>
                <CardDescription>Your personalized college community feed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This is where you'll see posts and updates from your classmates, events, 
                  and groups. Start by creating a post or joining a group!
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Upcoming events at your college</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="p-3 rounded-lg bg-muted flex justify-between items-center">
                    <div>
                      <p className="font-medium">Tech Symposium 2023</p>
                      <p className="text-sm text-muted-foreground">Nov 15, 2023 • Engineering Block</p>
                    </div>
                    <Button variant="outline" size="sm">RSVP</Button>
                  </li>
                  <li className="p-3 rounded-lg bg-muted flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cultural Fest</p>
                      <p className="text-sm text-muted-foreground">Dec 5, 2023 • Main Auditorium</p>
                    </div>
                    <Button variant="outline" size="sm">RSVP</Button>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            {/* Sidebar Content */}
            <Card>
              <CardHeader>
                <CardTitle>My Groups</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="p-2 rounded-lg bg-muted text-sm">Computer Science Study Group</li>
                  <li className="p-2 rounded-lg bg-muted text-sm">Coding Club</li>
                  <li className="p-2 rounded-lg bg-muted text-sm">Campus Photography</li>
                </ul>
                <Button variant="ghost" size="sm" className="w-full mt-3">View All Groups</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">#Exams</Button>
                  <Button variant="outline" size="sm">#CampusFest</Button>
                  <Button variant="outline" size="sm">#Placements</Button>
                  <Button variant="outline" size="sm">#Projects</Button>
                  <Button variant="outline" size="sm">#Sports</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
