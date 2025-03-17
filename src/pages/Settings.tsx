
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { HomeSidebar } from "@/components/HomeSidebar";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/services/user";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user } = useAuth();
  const { user: userProfile, studentProfile, fetchUserProfile, updateUserProfile, updateStudentProfile, updateUserInterests, updateUserPhone } = useUserStore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
  });
  
  const [newInterest, setNewInterest] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  
  const [academicInfo, setAcademicInfo] = useState({
    prn: "",
    branch: "",
    year: "",
    recoveryEmail: "",
  });
  
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    app: true,
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id)
        .then(() => setIsLoading(false))
        .catch(() => setIsLoading(false));
    }
  }, [user, fetchUserProfile]);

  useEffect(() => {
    if (userProfile) {
      setBasicInfo({
        fullName: userProfile.full_name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        bio: studentProfile?.bio || "",
      });
    }
    
    if (studentProfile) {
      setAcademicInfo({
        prn: studentProfile.prn || "",
        branch: studentProfile.branch || "",
        year: studentProfile.year || "",
        recoveryEmail: studentProfile.recovery_email || "",
      });
      
      setInterests(studentProfile.interests || []);
    }
  }, [userProfile, studentProfile]);

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo({ ...basicInfo, [name]: value });
  };

  const handlePhoneBlur = () => {
    if (user && basicInfo.phone !== userProfile?.phone) {
      updateUserPhone(user.id, basicInfo.phone);
    }
  };
  
  const handleAcademicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAcademicInfo({ ...academicInfo, [name]: value });
  };

  const handleSaveBasicInfo = async () => {
    if (!user) return;
    
    try {
      await updateUserProfile(user.id, {
        full_name: basicInfo.fullName,
      });
      
      await updateStudentProfile(user.id, {
        bio: basicInfo.bio,
      });
      
      toast({
        title: "Success",
        description: "Basic information updated successfully",
      });
    } catch (error) {
      console.error("Error saving basic info:", error);
    }
  };

  const handleSaveAcademicInfo = async () => {
    if (!user) return;
    
    try {
      await updateStudentProfile(user.id, {
        prn: academicInfo.prn,
        branch: academicInfo.branch,
        year: academicInfo.year,
        recovery_email: academicInfo.recoveryEmail,
      });
      
      toast({
        title: "Success",
        description: "Academic information updated successfully",
      });
    } catch (error) {
      console.error("Error saving academic info:", error);
    }
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) {
      toast({
        title: "Duplicate Interest",
        description: "This interest is already in your list",
        variant: "destructive",
      });
      return;
    }
    
    const updatedInterests = [...interests, newInterest.trim()];
    setInterests(updatedInterests);
    setNewInterest("");
    
    if (user) {
      updateUserInterests(user.id, updatedInterests);
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = interests.filter(i => i !== interest);
    setInterests(updatedInterests);
    
    if (user) {
      updateUserInterests(user.id, updatedInterests);
    }
  };

  const handleNotificationChange = (value: boolean, type: string) => {
    setNotifications({
      ...notifications,
      [type]: value,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
        <HomeSidebar />
        <div className="ml-16 p-4">
          <Navigation />
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <HomeSidebar />
      <div className="ml-16 p-4">
        <Navigation />
        <div className="max-w-4xl mx-auto mt-8">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input 
                  name="fullName"
                  value={basicInfo.fullName}
                  onChange={handleBasicInfoChange}
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  name="email"
                  value={basicInfo.email}
                  disabled
                  className="max-w-md bg-gray-100 dark:bg-gray-700"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You cannot change your PCCOE email address</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input 
                  name="phone"
                  value={basicInfo.phone}
                  onChange={handleBasicInfoChange}
                  onBlur={handlePhoneBlur}
                  className="max-w-md"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <Textarea 
                  name="bio"
                  value={basicInfo.bio}
                  onChange={handleBasicInfoChange}
                  placeholder="Tell us about yourself"
                  className="max-w-md"
                />
              </div>
              <Button onClick={handleSaveBasicInfo}>Save Basic Information</Button>
            </div>
          </div>
          
          {/* Academic Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Academic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">PRN Number</label>
                <Input 
                  name="prn"
                  value={academicInfo.prn}
                  onChange={handleAcademicInfoChange}
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Branch</label>
                <Input 
                  name="branch"
                  value={academicInfo.branch}
                  onChange={handleAcademicInfoChange}
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input 
                  name="year"
                  value={academicInfo.year}
                  onChange={handleAcademicInfoChange}
                  className="max-w-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Recovery Email</label>
                <Input 
                  name="recoveryEmail"
                  value={academicInfo.recoveryEmail}
                  onChange={handleAcademicInfoChange}
                  className="max-w-md"
                />
              </div>
              <Button onClick={handleSaveAcademicInfo}>Save Academic Information</Button>
            </div>
          </div>
          
          {/* Interests */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Interests</h2>
            <div className="space-y-4">
              <div className="flex gap-2 max-w-md">
                <Input 
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button onClick={addInterest}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest, index) => (
                  <Badge key={index} className="px-2 py-1 flex items-center gap-1">
                    {interest}
                    <button onClick={() => removeInterest(interest)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {interests.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No interests added yet</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                </div>
                <Switch 
                  checked={notifications.email} 
                  onCheckedChange={(value) => handleNotificationChange(value, "email")} 
                />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications in browser</p>
                </div>
                <Switch 
                  checked={notifications.browser} 
                  onCheckedChange={(value) => handleNotificationChange(value, "browser")} 
                />
              </div>
              <div className="flex items-center justify-between max-w-md">
                <div>
                  <p className="font-medium">Mobile App Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications on mobile app</p>
                </div>
                <Switch 
                  checked={notifications.app} 
                  onCheckedChange={(value) => handleNotificationChange(value, "app")} 
                />
              </div>
              <Button>Save Notification Preferences</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
