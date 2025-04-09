
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/services/user";
import { BasicInfoSection } from "@/components/settings/BasicInfoSection";
import { AcademicInfoSection } from "@/components/settings/AcademicInfoSection";
import { InterestsSection } from "@/components/settings/InterestsSection";
import { NotificationPreferencesSection } from "@/components/settings/NotificationPreferencesSection";
import { LoadingSpinner } from "@/components/settings/LoadingSpinner";

const Settings = () => {
  const { user } = useAuth();
  const { user: userProfile, studentProfile, fetchUserProfile } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
  });
  
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
        <Navigation />
        <div className="p-4 pt-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-black dark:text-white">
      <Navigation />
      <div className="p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          
          <BasicInfoSection 
            basicInfo={basicInfo} 
            setBasicInfo={setBasicInfo} 
          />
          
          <AcademicInfoSection 
            academicInfo={academicInfo} 
            setAcademicInfo={setAcademicInfo} 
          />
          
          <InterestsSection 
            interests={interests} 
            setInterests={setInterests} 
          />
          
          <NotificationPreferencesSection 
            notifications={notifications} 
            setNotifications={setNotifications} 
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
