import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categoryColors: Record<string, string> = {
  Sports: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Exams: "bg-red-500/10 text-red-400 border-red-500/20",
  Events: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Clubs: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Placements: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Celebrations: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

interface SentNotification {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Sports");
  const [isSending, setIsSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(false);

  const fetchSentNotifications = async () => {
    if (!user) return;
    setIsLoadingSent(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, content, category, created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSentNotifications(data || []);
    } catch (error) {
      console.error("Error fetching sent notifications:", error);
    } finally {
      setIsLoadingSent(false);
    }
  };

  useEffect(() => {
    fetchSentNotifications();
  }, [user]);

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationText.trim()) {
      toast({ title: "Error", description: "Please enter both title and notification text", variant: "destructive" });
      return;
    }

    if (!user) {
      toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("notifications").insert({
        title: notificationTitle.trim(),
        content: notificationText.trim(),
        category: selectedCategory,
        sender_id: user.id,
      });

      if (error) throw error;

      toast({ title: "Success", description: `Notification sent to ${selectedCategory} category` });
      setNotificationTitle("");
      setNotificationText("");
      fetchSentNotifications();
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({ title: "Error", description: error.message || "Failed to send notification", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="w-full justify-start mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg">Students Data</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Send Notification</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                <select
                  className="w-full p-2.5 rounded-lg bg-muted/50 border border-white/[0.08] text-foreground text-sm focus:border-primary/50 transition-colors outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Sports">Sports</option>
                  <option value="Exams">Exams</option>
                  <option value="Events">Events</option>
                  <option value="Clubs">Clubs</option>
                  <option value="Placements">Placements</option>
                  <option value="Celebrations">Celebrations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g. Exam Schedule Released"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notification Text</label>
                <Textarea
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  placeholder="Enter notification message..."
                  className="min-h-[100px] glass-input"
                />
              </div>

              <Button onClick={handleSendNotification} className="w-full" disabled={isSending}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Notification
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Sent Notifications</h2>
            {isLoadingSent ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm py-8">No notifications sent yet.</p>
            ) : (
              <div className="space-y-3">
                {sentNotifications.map((notif) => (
                  <div key={notif.id} className="glass-surface rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryColors[notif.category] || ""}`}>
                          {notif.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(notif.created_at), "MMM d, yyyy • h:mm a")}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm">{notif.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{notif.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Students Data</h2>
            <div className="relative overflow-x-auto rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06]">
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} className="border-white/[0.06]">
                      <TableCell className="font-medium text-sm">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.department}</TableCell>
                      <TableCell className="text-sm">{user.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            toast({ title: "Action Triggered", description: `Action performed for ${user.name}` });
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
