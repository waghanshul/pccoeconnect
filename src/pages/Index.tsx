
import Landing from "./Landing";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, CalendarDays, Users, MessageSquare } from "lucide-react";
import { useState } from "react";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { Post } from "@/components/Post";

export default function Index() {
  const { user } = useAuth();
  const [openCreatePost, setOpenCreatePost] = useState(false);

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Home Feed</h1>
          <Button className="flex items-center gap-2" onClick={() => setOpenCreatePost(true)}>
            <PlusCircle size={18} />
            <span>Create Post</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Feed Content */}
            <Post
              author={{
                name: "Aditya Sharma",
                avatar: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
                branch: "Computer Science",
                year: "3rd Year"
              }}
              content="Just finished my project on machine learning! 🎉 It was challenging but rewarding. Looking forward to presenting it next week."
              timestamp="2 hours ago"
              likes={24}
              comments={8}
              shares={3}
            />
            
            <Post
              author={{
                name: "Priya Patel",
                avatar: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
                branch: "Electronics Engineering",
                year: "4th Year"
              }}
              content="The campus fest is coming up! Anyone interested in joining the organizing committee? We need volunteers for various events. Comment below if you're interested!"
              timestamp="5 hours ago"
              likes={42}
              comments={15}
              shares={7}
            />
            
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
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <BookOpen size={16} />
                    <span className="text-sm">Academic Resources</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <CalendarDays size={16} />
                    <span className="text-sm">Event Calendar</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <Users size={16} />
                    <span className="text-sm">Clubs & Societies</span>
                  </a>
                  <a href="#" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors">
                    <MessageSquare size={16} />
                    <span className="text-sm">Forum Discussions</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <CreatePostDialog open={openCreatePost} onOpenChange={setOpenCreatePost} />
    </div>
  );
}
