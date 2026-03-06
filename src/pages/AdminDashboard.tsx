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
  Sports: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Exams: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Events: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Clubs: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Placements: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  Celebrations: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
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
      toast({
        title: "Error",
        description: "Please enter both title and notification text",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: `Notification sent to ${selectedCategory} category`,
      });
      setNotificationTitle("");
      setNotificationText("");
      fetchSentNotifications();
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="w-full justify-start mb-8">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="students">Students Data</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Send Notification</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Category</label>
                <select
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Title</label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="e.g. Exam Schedule Released"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Notification Text</label>
                <Textarea
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  placeholder="Enter notification message..."
                  className="min-h-[100px]"
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

          {/* Sent Notifications History */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Sent Notifications</h2>
            {isLoadingSent ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : sentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No notifications sent yet.</p>
            ) : (
              <div className="space-y-3">
                {sentNotifications.map((notif) => (
                  <div key={notif.id} className="border dark:border-gray-700 rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColors[notif.category] || ""}`}>
                          {notif.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notif.created_at), "MMM d, yyyy • h:mm a")}
                        </span>
                      </div>
                      <h4 className="font-medium dark:text-white">{notif.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{notif.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Students Data</h2>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.status}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Action Triggered",
                              description: `Action performed for ${user.name}`,
                            });
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
