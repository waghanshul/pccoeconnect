import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/services/user";
import { BasicInfoSection } from "@/components/settings/BasicInfoSection";
import { AcademicInfoSection } from "@/components/settings/AcademicInfoSection";
import { InterestsSection } from "@/components/settings/InterestsSection";
import { NotificationPreferencesSection } from "@/components/settings/NotificationPreferencesSection";
import { LoadingSpinner } from "@/components/settings/LoadingSpinner";
import { PageTransition } from "@/components/ui/PageTransition";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserCog, GraduationCap, Sparkles, BellRing } from "lucide-react";

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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-4 pt-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageTransition>
        <div className="p-4 pt-16 md:pt-20 pb-24 md:pb-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            
            <Accordion type="multiple" defaultValue={["basic", "academic", "interests", "notifications"]} className="space-y-4">
              <AccordionItem value="basic" className="glass-card rounded-xl border-none px-6">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <UserCog className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Basic Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <BasicInfoSection basicInfo={basicInfo} setBasicInfo={setBasicInfo} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="academic" className="glass-card rounded-xl border-none px-6">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold">Academic Information</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <AcademicInfoSection academicInfo={academicInfo} setAcademicInfo={setAcademicInfo} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="interests" className="glass-card rounded-xl border-none px-6">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                    <span className="font-semibold">Interests</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <InterestsSection interests={interests} setInterests={setInterests} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="notifications" className="glass-card rounded-xl border-none px-6">
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-3">
                    <BellRing className="h-5 w-5 text-emerald-400" />
                    <span className="font-semibold">Notification Preferences</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <NotificationPreferencesSection notifications={notifications} setNotifications={setNotifications} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Settings;
