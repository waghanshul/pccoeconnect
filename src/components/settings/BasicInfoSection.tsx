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
export const BasicInfoSection = ({
  basicInfo,
  setBasicInfo
}: BasicInfoProps) => {
  const {
    user
  } = useAuth();
  const {
    updateUserProfile,
    updateStudentProfile,
    updateUserPhone
  } = useUserStore();
  const {
    toast
  } = useToast();
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: value
    });
  };
  const handlePhoneBlur = () => {
    if (user && basicInfo.phone !== user.phone) {
      updateUserPhone(user.id, basicInfo.phone);
    }
  };
  const handleSaveBasicInfo = async () => {
    if (!user) return;
    try {
      await updateUserProfile(user.id, {
        full_name: basicInfo.fullName
      });
      await updateStudentProfile(user.id, {
        bio: basicInfo.bio
      });
      toast({
        title: "Success",
        description: "Basic information updated successfully"
      });
    } catch (error) {
      console.error("Error saving basic info:", error);
    }
  };
  return <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <Input name="fullName" value={basicInfo.fullName} onChange={handleBasicInfoChange} className="max-w-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input name="email" value={basicInfo.email} disabled className="max-w-md bg-gray-100 dark:bg-gray-700" />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You cannot change your secondary email address</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <Input name="phone" value={basicInfo.phone} onChange={handleBasicInfoChange} onBlur={handlePhoneBlur} className="max-w-md" placeholder="Enter your phone number" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <Textarea name="bio" value={basicInfo.bio} onChange={handleBasicInfoChange} placeholder="Tell us about yourself" className="max-w-md" />
        </div>
        <Button onClick={handleSaveBasicInfo}>Save Basic Information</Button>
      </div>
    </div>;
};