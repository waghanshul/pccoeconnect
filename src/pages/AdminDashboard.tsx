import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { mockUsers } from "@/data/mockData";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [notificationText, setNotificationText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("sports");

  const handleSendNotification = () => {
    if (!notificationText.trim()) {
      toast({
        title: "Error",
        description: "Please enter notification text",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Notification sent to ${selectedCategory} category`,
    });
    setNotificationText("");
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
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Send Notifications</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Category
                </label>
                <select 
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="sports">Sports</option>
                  <option value="exams">Exams</option>
                  <option value="events">Events</option>
                  <option value="clubs">Clubs</option>
                  <option value="placements">Placements</option>
                  <option value="celebrations">Celebrations</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                  Notification Text
                </label>
                <Textarea
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  placeholder="Enter notification message..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleSendNotification}
                className="w-full"
              >
                Send Notification
              </Button>
            </div>
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