import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/services/user";
import { useAuth } from "@/context/AuthContext";

interface BasicInfoProps {
  basicInfo: {
    fullName: string;
    email: string;
    phone: string;
    bio: string;
  };
  setBasicInfo: React.Dispatch<React.SetStateAction<{
    fullName: string;
    email: string;
    phone: string;
    bio: string;
  }>>;
}

export const BasicInfoSection = ({ basicInfo, setBasicInfo }: BasicInfoProps) => {
  const { user } = useAuth();
  const { updateUserProfile, updateStudentProfile, updateUserPhone } = useUserStore();
  const { toast } = useToast();

  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBasicInfo({ ...basicInfo, [name]: value });
  };

  const handlePhoneBlur = () => {
    if (user && basicInfo.phone !== user.phone) {
      updateUserPhone(user.id, basicInfo.phone);
    }
  };

  const handleSaveBasicInfo = async () => {
    if (!user) return;
    try {
      await updateUserProfile(user.id, { full_name: basicInfo.fullName });
      await updateStudentProfile(user.id, { bio: basicInfo.bio });
      toast({ title: "Success", description: "Basic information updated successfully" });
    } catch (error) {
      console.error("Error saving basic info:", error);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl mb-6">
      <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
          <Input name="fullName" value={basicInfo.fullName} onChange={handleBasicInfoChange} className="max-w-md glass-input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
          <Input name="email" value={basicInfo.email} disabled className="max-w-md bg-muted/30 opacity-60" />
          <p className="mt-1 text-xs text-muted-foreground">You cannot change your secondary email address</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
          <Input name="phone" value={basicInfo.phone} onChange={handleBasicInfoChange} onBlur={handlePhoneBlur} className="max-w-md glass-input" placeholder="Enter your phone number" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
          <Textarea name="bio" value={basicInfo.bio} onChange={handleBasicInfoChange} placeholder="Tell us about yourself" className="max-w-md glass-input" />
        </div>
        <Button onClick={handleSaveBasicInfo} size="sm">Save Basic Information</Button>
      </div>
    </div>
  );
};
