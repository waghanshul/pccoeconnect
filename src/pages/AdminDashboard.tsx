import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Trash2, Users, GraduationCap, ShieldCheck, Link as LinkIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

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
  link_url: string | null;
}

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  status: string | null;
  avatar_url: string | null;
  branch?: string;
  year?: string;
  prn?: string;
}

interface AdminRow {
  id: string;
  full_name: string;
  email: string;
  status: string | null;
  designation?: string;
  department?: string;
  employee_id?: string;
}

interface PostRow {
  id: string;
  content: string;
  created_at: string | null;
  file_type: string | null;
  user_id: string;
  author_name?: string;
  author_email?: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Notifications state
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [notificationLinkUrl, setNotificationLinkUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Sports");
  const [isSending, setIsSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
  const [isLoadingSent, setIsLoadingSent] = useState(false);
  const [deletingNotifId, setDeletingNotifId] = useState<string | null>(null);

  // Stats state
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);

  // Students state
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Admins state
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const [totalRes, studentRes, adminRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    ]);
    setTotalUsers(totalRes.count ?? 0);
    setTotalStudents(studentRes.count ?? 0);
    setTotalAdmins(adminRes.count ?? 0);
  }, []);

  const fetchSentNotifications = useCallback(async () => {
    setIsLoadingSent(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, content, category, created_at, link_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSentNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoadingSent(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, status, avatar_url")
        .eq("role", "student")
        .order("full_name");
      if (profilesError) throw profilesError;

      const ids = (profilesData || []).map((p) => p.id);
      let studentMap: Record<string, { branch: string; year: string; prn: string }> = {};
      if (ids.length > 0) {
        const { data: spData } = await supabase
          .from("student_profiles")
          .select("id, branch, year, prn")
          .in("id", ids);
        (spData || []).forEach((sp) => {
          studentMap[sp.id] = { branch: sp.branch, year: sp.year, prn: sp.prn };
        });
      }

      setStudents(
        (profilesData || []).map((p) => ({
          ...p,
          branch: studentMap[p.id]?.branch,
          year: studentMap[p.id]?.year,
          prn: studentMap[p.id]?.prn,
        }))
      );
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoadingStudents(false);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, status")
        .eq("role", "admin")
        .order("full_name");
      if (profilesError) throw profilesError;

      const ids = (profilesData || []).map((p) => p.id);
      let adminMap: Record<string, { designation: string; department: string; employee_id: string }> = {};
      if (ids.length > 0) {
        const { data: apData } = await supabase
          .from("admin_profiles")
          .select("id, designation, department, employee_id")
          .in("id", ids);
        (apData || []).forEach((ap) => {
          adminMap[ap.id] = { designation: ap.designation, department: ap.department, employee_id: ap.employee_id };
        });
      }

      setAdmins(
        (profilesData || []).map((p) => ({
          ...p,
          designation: adminMap[p.id]?.designation,
          department: adminMap[p.id]?.department,
          employee_id: adminMap[p.id]?.employee_id,
        }))
      );
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from("social_posts")
        .select("id, content, created_at, file_type, user_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((p) => p.user_id))];
      let profileMap: Record<string, { full_name: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        (profiles || []).forEach((p) => {
          profileMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }

      setPosts(
        (data || []).map((p) => ({
          ...p,
          author_name: profileMap[p.user_id]?.full_name || "Unknown",
          author_email: profileMap[p.user_id]?.email || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchSentNotifications();
    fetchStudents();
    fetchAdmins();
    fetchPosts();
  }, [fetchStats, fetchSentNotifications, fetchStudents, fetchAdmins, fetchPosts]);

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
      const insertData: { title: string; content: string; category: string; sender_id: string; link_url?: string } = {
        title: notificationTitle.trim(),
        content: notificationText.trim(),
        category: selectedCategory,
        sender_id: user.id,
      };
      if (notificationLinkUrl.trim()) {
        insertData.link_url = notificationLinkUrl.trim();
      }
      const { error } = await supabase.from("notifications").insert(insertData);
      if (error) throw error;
      toast({ title: "Success", description: `Notification sent to ${selectedCategory} category` });
      setNotificationTitle("");
      setNotificationText("");
      setNotificationLinkUrl("");
      fetchSentNotifications();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send notification", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async (notifId: string) => {
    setDeletingNotifId(notifId);
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notifId);
      if (error) throw error;
      toast({ title: "Deleted", description: "Notification has been removed" });
      setSentNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete notification", variant: "destructive" });
    } finally {
      setDeletingNotifId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setDeletingPostId(postId);
    try {
      const { error } = await supabase.from("social_posts").delete().eq("id", postId);
      if (error) throw error;
      toast({ title: "Deleted", description: "Post has been removed" });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      fetchStats();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete post", variant: "destructive" });
    } finally {
      setDeletingPostId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-border/50">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalAdmins}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="w-full justify-start mb-8 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg">Students</TabsTrigger>
          <TabsTrigger value="admins" className="rounded-lg">Admins</TabsTrigger>
          <TabsTrigger value="posts" className="rounded-lg">Posts</TabsTrigger>
        </TabsList>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Send Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                <select
                  className="w-full p-2.5 rounded-lg bg-muted/50 border border-border text-foreground text-sm focus:border-primary/50 transition-colors outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {["Sports", "Exams", "Events", "Clubs", "Placements", "Celebrations"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Title</label>
                <Input value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} placeholder="e.g. Exam Schedule Released" className="glass-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Link URL (optional)</label>
                <Input value={notificationLinkUrl} onChange={(e) => setNotificationLinkUrl(e.target.value)} placeholder="https://example.com/details" className="glass-input" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Notification Text</label>
                <Textarea value={notificationText} onChange={(e) => setNotificationText(e.target.value)} placeholder="Enter notification message..." className="min-h-[100px] glass-input" />
              </div>
              <Button onClick={handleSendNotification} className="w-full" disabled={isSending}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send Notification
              </Button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">All Notifications ({sentNotifications.length})</h2>
            {isLoadingSent ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : sentNotifications.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm py-8">No notifications yet.</p>
            ) : (
              <div className="space-y-3">
                {sentNotifications.map((notif) => (
                  <div key={notif.id} className="glass-surface rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryColors[notif.category] || ""}`}>{notif.category}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(notif.created_at), "MMM d, yyyy • h:mm a")}</span>
                      </div>
                      <h4 className="font-medium text-sm">{notif.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{notif.content}</p>
                      {notif.link_url && (
                        <a href={notif.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                          <LinkIcon className="h-3 w-3" />
                          {notif.link_url}
                        </a>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove this notification for all users. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteNotification(notif.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deletingNotifId === notif.id}
                          >
                            {deletingNotifId === notif.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Students Tab ── */}
        <TabsContent value="students" className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Registered Students ({students.length})</h2>
            {isLoadingStudents ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : students.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm py-8">No students registered yet.</p>
            ) : (
              <div className="relative overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">PRN</TableHead>
                      <TableHead className="text-xs">Branch</TableHead>
                      <TableHead className="text-xs">Year</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.id} className="border-border/30">
                        <TableCell className="font-medium text-sm">{s.full_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                        <TableCell className="text-sm">{s.prn || "—"}</TableCell>
                        <TableCell className="text-sm">{s.branch || "—"}</TableCell>
                        <TableCell className="text-sm">{s.year || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={s.status === "online" ? "default" : "secondary"} className="text-[10px]">
                            {s.status || "offline"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Admins Tab ── */}
        <TabsContent value="admins" className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Registered Admins ({admins.length})</h2>
            {isLoadingAdmins ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : admins.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm py-8">No admins registered yet.</p>
            ) : (
              <div className="relative overflow-x-auto rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Designation</TableHead>
                      <TableHead className="text-xs">Department</TableHead>
                      <TableHead className="text-xs">Employee ID</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((a) => (
                      <TableRow key={a.id} className="border-border/30">
                        <TableCell className="font-medium text-sm">{a.full_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                        <TableCell className="text-sm">{a.designation || "—"}</TableCell>
                        <TableCell className="text-sm">{a.department || "—"}</TableCell>
                        <TableCell className="text-sm">{a.employee_id || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={a.status === "online" ? "default" : "secondary"} className="text-[10px]">
                            {a.status || "offline"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Posts Tab ── */}
        <TabsContent value="posts" className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">All Posts ({posts.length})</h2>
            {isLoadingPosts ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : posts.length === 0 ? (
              <p className="text-muted-foreground text-center text-sm py-8">No posts yet.</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="glass-surface rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{post.author_name}</span>
                        <span className="text-[10px] text-muted-foreground">{post.author_email}</span>
                        {post.file_type && (
                          <Badge variant="outline" className="text-[10px]">{post.file_type}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                      {post.created_at && (
                        <span className="text-[10px] text-muted-foreground">{format(new Date(post.created_at), "MMM d, yyyy • h:mm a")}</span>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove this post. This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deletingPostId === post.id}
                          >
                            {deletingPostId === post.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
