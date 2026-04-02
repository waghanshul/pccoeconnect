import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/services/user";
import { BasicInfoSection } from "@/components/settings/BasicInfoSection";
import { AcademicInfoSection } from "@/components/settings/AcademicInfoSection";
import { InterestsSection } from "@/components/settings/InterestsSection";
import { NotificationPreferencesSection } from "@/components/settings/NotificationPreferencesSection";
import { LoadingSpinner } from "@/components/settings/LoadingSpinner";
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
      <AppLayout>
        <div className="py-8">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const sections = [
    { value: "basic", icon: UserCog, iconColor: "text-primary", label: "Basic Information", content: <BasicInfoSection basicInfo={basicInfo} setBasicInfo={setBasicInfo} /> },
    { value: "academic", icon: GraduationCap, iconColor: "text-blue-400", label: "Academic Information", content: <AcademicInfoSection academicInfo={academicInfo} setAcademicInfo={setAcademicInfo} /> },
    { value: "interests", icon: Sparkles, iconColor: "text-amber-400", label: "Interests", content: <InterestsSection interests={interests} setInterests={setInterests} /> },
    { value: "notifications", icon: BellRing, iconColor: "text-emerald-400", label: "Notification Preferences", content: <NotificationPreferencesSection notifications={notifications} setNotifications={setNotifications} /> },
  ];

  return (
    <AppLayout maxWidth="max-w-3xl">
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Accordion type="multiple" defaultValue={["basic", "academic", "interests", "notifications"]} className="space-y-3">
          {sections.map(({ value, icon: Icon, iconColor, label, content }) => (
            <AccordionItem key={value} value={value} className="bg-card rounded-xl border border-border px-5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>{content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </AppLayout>
  );
};

export default Settings;
